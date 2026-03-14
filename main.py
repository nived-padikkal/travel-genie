from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Any, Dict
import re
import csv
import pandas as pd
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
import chromadb.utils.embedding_functions as embedding_functions

load_dotenv()

google_ef = embedding_functions.GoogleGeminiEmbeddingFunction(
    model_name="models/gemini-embedding-001",
    task_type="RETRIEVAL_DOCUMENT",
)

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    name="travel_packages",
    embedding_function=google_ef
)

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
                "location": row.get("location", ""),
                "days": row["days"],
                "price": row["price"],
                "type": row.get("type", ""),
                "best_for": row.get("best_for", ""),
                "season": row.get("season", ""),
                "description": row.get("description", ""),
                "activities": row.get("activities", ""),
                "keywords": row.get("keywords", ""),
                "image": row["image"],
                "included": row.get("included", ""),
                "excluded": row.get("excluded", "")
            }
            
    # Always re-initialize ChromaDB to keep it in sync with CSV
    existing_count = collection.count()
    df = pd.read_csv(csv_path)
    if existing_count != len(df):
        # Clear and re-add if counts don't match
        if existing_count > 0:
            existing_ids = collection.get()["ids"]
            if existing_ids:
                collection.delete(ids=existing_ids)
        print("Initializing ChromaDB with package embeddings...")
        documents = []
        metadatas = []
        ids = []
        for index, row in df.iterrows():
            text = (
                f"Package: {row['name']}. "
                f"Location: {row['location']}. "
                f"Duration: {row['days']} days. "
                f"Price: {row['price']} rupees per person. "
                f"Type: {row['type']}. "
                f"Best for: {row['best_for']}. "
                f"Season: {row['season']}. "
                f"Description: {row['description']}. "
                f"Activities: {row['activities']}. "
                f"Keywords: {row['keywords']}. "
                f"Included: {row['included']}. "
                f"Excluded: {row['excluded']}."
            )
            documents.append(text)
            metadatas.append({
                "id": str(row['id']),
                "name": str(row['name']),
                "location": str(row['location']),
                "days": str(row['days']),
                "price": str(row['price']),
                "type": str(row.get('type', '')),
                "best_for": str(row.get('best_for', '')),
                "season": str(row.get('season', '')),
            })
            ids.append(str(row['id']))
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"ChromaDB initialized with {len(ids)} packages.")
    else:
        print(f"ChromaDB already has {existing_count} packages, skipping init.")
except Exception as e:
    print(f"Error loading packages or initializing ChromaDB: {e}")

def build_query_from_conversation(contents: list) -> str:
    """Extract all user messages from the conversation to build a combined search query.
    This ensures follow-up messages retain context from earlier in the conversation."""
    user_texts = []
    for message in contents:
        if message.get("role") == "user":
            parts = message.get("parts", [])
            for part in parts:
                text = part.get("text", "").strip()
                if text:
                    user_texts.append(text)
    return " ".join(user_texts)

def search_packages(query: str, n_results: int = 5):
    if not query.strip():
        return list(PACKAGES_DB.items())[:n_results]
    try:
        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, collection.count())
        )
        if not results['ids'] or not results['ids'][0]:
            return list(PACKAGES_DB.items())[:n_results]
        retrieved_ids = results['ids'][0]
        return [(pid, PACKAGES_DB[pid]) for pid in retrieved_ids if pid in PACKAGES_DB]
    except Exception as e:
        print(f"Error during Chroma search: {e}")
        return list(PACKAGES_DB.items())[:n_results]

def get_system_instruction(lang: str, region: str, top_packages: list) -> str:
    location_context = f"\nThe user is currently browsing from {region}. You can use this to politely recommend it as their departure city." if region else ""
    packages_list = ""
    for pid, info in top_packages:
        packages_list += f"{pid}. {info['name']} | Location: {info['location']} | {info['days']} Days | ₹{int(info['price']):,} per person\n"
        packages_list += f"   Type: {info['type']} | Best For: {info['best_for']} | Season: {info['season']}\n"
        packages_list += f"   Description: {info['description']}\n"
        packages_list += f"   Activities: {info['activities']} | Keywords: {info['keywords']}\n"
        packages_list += f"   Included: {info['included']} | Excluded: {info['excluded']}\n\n"
    
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
        
    # Build query from ALL user messages to preserve context across follow-ups
    user_query = build_query_from_conversation(request.contents)
    top_packages = search_packages(user_query)
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    gemini_request = {
        "systemInstruction": {
            "parts": [{"text": get_system_instruction(request.language, request.region, top_packages)}]
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
