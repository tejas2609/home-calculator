from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .routes.transactions import router as transactions_router
from .routes.balance import router as balance_router

settings = get_settings()

app = FastAPI(
    title="Balance Calculator API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions_router)
app.include_router(balance_router)


@app.get("/")
def health():
    return {"status": "ok", "service": "Balance Calculator API"}
