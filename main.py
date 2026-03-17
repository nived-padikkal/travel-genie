import fastapi
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Any, Dict
import re
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
import chromadb.utils.embedding_functions as embedding_functions
from supabase import create_client, Client
import datetime

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

supabase_url: str = os.getenv("SUPABASE_URL")
supabase_key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

PACKAGES_DB = {}

def load_packages_from_db():
    global PACKAGES_DB
    PACKAGES_DB.clear()
    
    response = supabase.table("packages").select("*").execute()
    data = response.data
    
    for row in data:
        PACKAGES_DB[str(row["id"])] = {
            "name": row.get("name", ""),
            "location": row.get("location", ""),
            "days": str(row.get("days", "")),
            "price": str(row.get("price", "")),
            "type": row.get("type", ""),
            "best_for": row.get("best_for", ""),
            "season": row.get("season", ""),
            "description": row.get("description", ""),
            "activities": row.get("activities", ""),
            "keywords": row.get("keywords", ""),
            "image": row.get("image", ""),
            "included": row.get("included", ""),
            "excluded": row.get("excluded", "")
        }
        
    existing_count = collection.count()
    if existing_count != len(data):
        if existing_count > 0:
            existing_ids = collection.get()["ids"]
            if existing_ids:
                collection.delete(ids=existing_ids)
        print("Initializing ChromaDB with package embeddings...")
        if len(data) > 0:
            documents = []
            metadatas = []
            ids = []
            for row in data:
                text = (
                    f"Package: {row.get('name')}. "
                    f"Location: {row.get('location')}. "
                    f"Duration: {row.get('days')} days. "
                    f"Price: {row.get('price')} rupees per person. "
                    f"Type: {row.get('type')}. "
                    f"Best for: {row.get('best_for')}. "
                    f"Season: {row.get('season')}. "
                    f"Description: {row.get('description')}. "
                    f"Activities: {row.get('activities')}. "
                    f"Keywords: {row.get('keywords')}. "
                    f"Included: {row.get('included')}. "
                    f"Excluded: {row.get('excluded')}."
                )
                documents.append(text)
                metadatas.append({
                    "id": str(row['id']),
                    "name": str(row.get('name', '')),
                    "location": str(row.get('location', '')),
                    "days": str(row.get('days', '')),
                    "price": str(row.get('price', '')),
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
        print(f"ChromaDB initialized with {len(data)} packages.")
    else:
        print(f"ChromaDB already has {existing_count} packages, skipping init.")

try:
    load_packages_from_db()
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
        try:
            price_val = int(float(info['price']))
        except (ValueError, TypeError):
            price_val = 0
        packages_list += f"{pid}. {info['name']} | Location: {info['location']} | {info['days']} Days | ₹{price_val:,} per person\n"
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

# --- ADMIN API ROUTES ---

security = HTTPBasic()

def verify_credentials(credentials: HTTPBasicCredentials = fastapi.Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "admin")
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=fastapi.status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/admin", response_class=HTMLResponse)
async def admin_page():
    admin_html_path = os.path.join(os.path.dirname(__file__), "admin.html")
    try:
        with open(admin_html_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"<html><body><h3>Error loading admin page: {e}</h3></body></html>"

@app.get("/api/admin/packages")
async def get_all_packages(user: str = fastapi.Depends(verify_credentials)):
    response = supabase.table("packages").select("*").order("id").execute()
    return response.data

@app.post("/api/admin/packages")
async def create_package(pkg: dict, user: str = fastapi.Depends(verify_credentials)):
    response = supabase.table("packages").insert(pkg).execute()
    load_packages_from_db()
    return response.data

@app.put("/api/admin/packages/{pkg_id}")
async def update_package(pkg_id: str, pkg: dict, user: str = fastapi.Depends(verify_credentials)):
    response = supabase.table("packages").update(pkg).eq("id", pkg_id).execute()
    load_packages_from_db()
    return response.data

@app.delete("/api/admin/packages/{pkg_id}")
async def delete_package(pkg_id: str, user: str = fastapi.Depends(verify_credentials)):
    response = supabase.table("packages").delete().eq("id", pkg_id).execute()
    load_packages_from_db()
    return response.data

# --- CHAT HISTORY ROUTES ---

# user_id is passed as query param, could be a random UUID stored in localStorage if not logged in
@app.get("/api/chat/history")
async def get_chat_history(user_id: str):
    # For GET requests, allow anonymous IDs for migration purposes
    # Only validate Firebase UIDs for save/delete operations
    response = supabase.table("chat_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(12).execute()
    # Transform the data to match expected format
    transformed_data = []
    for item in response.data:
        session_data = item.get("data", {})
        transformed_item = {
            **session_data,  # Spread the session data first
            "db_id": item.get("id"),  # Keep database id for reference if needed
            "user_id": item.get("user_id"),
        }
        transformed_data.append(transformed_item)
    return transformed_data

@app.post("/api/chat/history")
async def save_chat_history(session: dict):
    # Don't save empty chats (e.g. ones with no user messages yet)
    # Check if history exists or if there's any user message
    messages = session.get("messages", [])
    has_user_msg = any(m.get("sender") == "user" for m in messages)
    
    if not has_user_msg:
        # Ignore empty chats, don't store them
        return {"status": "ignored", "reason": "empty chat"}
    
    user_id = session.get("user_id")
    # Validate that user_id is a Firebase UID (28 characters, not anonymous)
    if not user_id or len(user_id) != 28 or user_id.startswith('anon-'):
        return {"status": "error", "reason": "invalid user_id"}
    
    session_id = session.get("id")
    
    # Check if this chat session already exists
    existing = supabase.table("chat_history").select("*").filter("data->>id", "eq", session_id).filter("user_id", "eq", user_id).execute()
    
    data = {
        "user_id": user_id,
        "data": session
    }
    
    if existing.data:
        # Update existing record
        supabase.table("chat_history").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        # Insert new record
        supabase.table("chat_history").insert(data).execute()
    
    return {"status": "success"}

@app.delete("/api/chat/history/{chat_id}")
async def delete_chat_history(chat_id: str):
    # Since we store the frontend id in data.id, we need to query by that
    # But this is inefficient. For now, let's delete by user_id and assume chat_id is not used
    # Actually, let's modify to find the record where data->>'id' = chat_id
    supabase.table("chat_history").delete().filter("data->>id", "eq", chat_id).execute()
    return {"status": "success"}

@app.delete("/api/chat/history")
async def clear_all_chat_history(user_id: str):
    # Validate that user_id is a Firebase UID (28 characters, not anonymous)
    if not user_id or len(user_id) != 28 or user_id.startswith('anon-'):
        return {"status": "error", "reason": "invalid user_id"}
    
    supabase.table("chat_history").delete().eq("user_id", user_id).execute()
    return {"status": "success"}


