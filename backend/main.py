from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import google.generativeai as genai
from dotenv import load_dotenv
from uuid import uuid4
from typing import Dict

# Storage helper (generates signed upload URLs)
from . import storage as storage_helper

# Load environment variables from .env file
load_dotenv()

# Configure Gemini
api_key = os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using gemini-flash-latest for maximum stability and availability
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction="You are the 'Scent Concierge' for a ultra-luxury perfume atelier called 'Maison de Parfum'. Your tone is extremely formal, sophisticated, and helpful. You are an expert in niche fragrances, ingredients like Oud, Damask Rose, and rare Saffron. Keep your responses concise, evocative, and luxurious. Refer to the user as 'Guest'."
    )
else:
    model = None

app = FastAPI(title="Scent Concierge Backend")

# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../frontend/static")), name="static")

def get_template(name: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "../frontend/templates", name)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/", response_class=HTMLResponse)
async def read_shop():
    return get_template("index.html")

@app.get("/about", response_class=HTMLResponse)
async def read_story():
    return get_template("about.html")

@app.get("/contact", response_class=HTMLResponse)
async def read_atelier():
    return get_template("contact.html")

@app.post("/contact")
async def handle_contact(name: str = Form(...), email: str = Form(...), message: str = Form(...)):
    # In a real app, send an email or save to DB.
    # For now, return a luxurious success message.
    return JSONResponse(content={
        "status": "success",
        "message": f"Thank you, {name}. Your inquiry has been received by our Atelier. A scent expert will contact you at {email}."
    })

class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat_concierge(chat: ChatMessage):
    user_message = chat.message
    
    if not model:
        # Fallback if API key is not configured
        return {"reply": "Guest, my advanced olfactory analysis is currently being refined in the Atelier. How may I assist you with our current collection in the meantime?"}

    try:
        response = model.generate_content(user_message)
        # Check if the response was blocked or empty
        if response and hasattr(response, 'text') and response.text:
            response_text = response.text.strip()
        else:
            response_text = "Guest, our Atelier's secrets are vast. Perhaps you could ask me about our specific ingredients like Oud or Rose?"
    except Exception as e:
        print(f"Gemini API Error Type: {type(e).__name__}")
        print(f"Gemini API Error Message: {str(e)}")
        response_text = "Guest, I am experiencing a brief moment of reflection. Please, tell me more about the scents that move you."
         
    return {"reply": response_text}


@app.post("/generate-upload-url")
async def generate_upload_url(payload: Dict):
    """Generate a signed upload URL for direct browser upload.

    Expects JSON payload: {"filename": "originalname.jpg", "content_type": "image/jpeg"}
    Returns: {"url": signedPutUrl, "public_url": publicUrl, "blob_name": blobName}
    """
    filename = payload.get("filename") if isinstance(payload, dict) else None
    content_type = payload.get("content_type") if isinstance(payload, dict) else "application/octet-stream"

    bucket = os.environ.get("GCS_BUCKET")
    if not bucket:
        return JSONResponse(status_code=500, content={"error": "GCS_BUCKET not configured on server"})

    # create a unique blob name to avoid collisions
    ext = os.path.splitext(filename)[1] if filename and "." in filename else ""
    blob_name = f"uploads/{uuid4().hex}{ext}"

    try:
        signed = storage_helper.generate_signed_upload_url(bucket, blob_name, content_type=content_type, expiration_minutes=15)
        return JSONResponse(content=signed)
    except Exception as e:
        print(f"Storage error: {e}")
        return JSONResponse(status_code=500, content={"error": "failed to generate upload URL"})
