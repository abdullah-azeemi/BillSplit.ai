from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.receipt import router as receiptRouter

app = FastAPI(title="BillSplit.ai")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receiptRouter, prefix="/receipt")