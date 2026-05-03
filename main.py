from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os

app = FastAPI(title="Scent Concierge Backend")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_template(name: str) -> str:
    path = os.path.join("templates", name)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

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
    user_message = chat.message.lower()
    response_text = ""
    
    if "oud" in user_message or "noir" in user_message:
         response_text = "Guest, our 'Oud Noir' balances top notes of Bergamot with a deep Saffron heart. It is truly a masterpiece for the Connoisseur."
    elif "floral" in user_message or "rose" in user_message:
         response_text = "Ah, you seek the delicate embrace of flowers. I recommend our 'Rose de Mai', an exquisite blend of Damascus Rose and rare vanilla orchids."
    elif "price" in user_message or "cost" in user_message:
         response_text = "Our creations are an investment in olfactory art. Prices reflect the rarity of our ingredients, ranging from $300 to $1200 per flacon."
    elif "hello" in user_message or "hi" in user_message:
         response_text = "Welcome, Guest. I am your Scent Concierge. How may I assist you in discovering your signature fragrance today?"
    else:
         response_text = "An intriguing inquiry, Guest. Our Atelier prides itself on bespoke experiences. Perhaps you would enjoy exploring 'L'Élixir Doré', a scent that transcends words."
         
    return {"reply": response_text}
