from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Any, Dict
import re
import csv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    contents: list
    language: str
    region: str = ""

PACKAGES_DB = {}
csv_path = os.path.join(os.path.dirname(__file__), "packages.csv")
try:
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            PACKAGES_DB[row["id"]] = {
                "name": row["name"],
                "days": row["days"],
                "price": row["price"],
                "image": row["image"]
            }
except Exception as e:
    print(f"Error loading packages.csv: {e}")

def get_system_instruction(lang: str, region: str) -> str:
    location_context = f"\nThe user is currently browsing from {region}. You can use this to politely recommend it as their departure city." if region else ""
    packages_list = "\n".join([f"{pid}. {info['name']} | ₹{int(info['price']):,} per person" for pid, info in PACKAGES_DB.items()])
    
    return f"""You are Travel Genie, an AI travel assistant for Omega, a DOMESTIC travel agency focused explicitly on trips WITHIN INDIA.{location_context}

AVAILABLE PACKAGES:
{packages_list}

CONVERSATION FLOW:
You must guide users step-by-step to find travel packages. Collect these details sequentially:
1. Destination (Where do they want to go?)
2. Number of travelers
3. Travel start date (IMPORTANT: When asking for the date, you MUST include the keyword [[DATE_PICKER]] anywhere in your response text!)
4. Trip duration
5. Budget per person
6. Departure city

RULES:
- VERY IMPORTANT: Extract ALL details provided by the user in their messages. If the user already provided the destination, number of travelers, start date, duration, budget, or departure city at ANY point, DO NOT ask for that specific detail again. Only ask for the MISSING details.
- Ask ONLY ONE question at a time for the remaining missing details.
- Acknowledge their provided details in a friendly way before asking the next missing question.
- If a user asks for an international destination (outside India), politely inform them that Omega only provides domestic trips within India and ask them if they'd like to explore domestic options.
- Keep responses EXTREMELY concise (1-2 sentences max) and fast. Avoid unnecessary fluff.
- HEAVILY use emojis throughout your responses to make them feel friendly and alive.
- ALWAYS wrap important keywords (like numbers, dates, locations, prices, and package names) in markdown bold format (**keyword**) so they clearly stand out in the text.
- You must respond in "{lang}" language.
- At the end of EVERY response, YOU MUST provide 1 to 4 suggested quick replies the user might want to tap next. Format each strictly as [[SUGGESTION: text]]. (e.g., [[SUGGESTION: 2 people]] [[SUGGESTION: Family of 4]]).

WHEN ALL DETAILS ARE COLLECTED:
Once you have collected all 6 details, you must stop asking questions and recommend a MAXIMUM OF 2 packages from the AVAILABLE PACKAGES list that somewhat fit their destination and budget.
If their budget is too low, state: "Note: None of the packages exactly match your budget, but here are the closest options."
You must output the recommended packages using EXACTLY this format, providing ONLY the ID of the package:
[[PACKAGE: ID]]

Example:
[[PACKAGE: 1]]

Add [[SUGGESTION: Start Over]] at the end when showing packages."""

@app.post("/api/chat")
async def chat_proxy(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    gemini_request = {
        "systemInstruction": {
            "parts": [{"text": get_system_instruction(request.language, request.region)}]
        },
        "contents": request.contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url,
                json=gemini_request,
                timeout=30.0
            )
        except httpx.HTTPError as e:
            # You can log the error details here
            raise HTTPException(status_code=500, detail=str(e))
            
        data = response.json()
        
        try:
            # Intercept and append full details for frontend
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            def replace_pkg(match):
                pkg_id = match.group(1).strip()
                if pkg_id in PACKAGES_DB:
                    p = PACKAGES_DB[pkg_id]
                    return f"[[PACKAGE: {pkg_id} | {p['name']} | {p['days']} | {p['price']} | {p['image']}]]"
                return match.group(0)
                
            new_text = re.sub(r'\[\[PACKAGE:\s*(\d+)\s*\]\]', replace_pkg, text)
            data["candidates"][0]["content"]["parts"][0]["text"] = new_text
        except Exception:
            pass # ignore failure and pass original data through
            
        return data
