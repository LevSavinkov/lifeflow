from fastapi import FastAPI
from backend.src.api import auth

app = FastAPI()

@app.get("/ping")
async def ping():
    return {"pong": True}