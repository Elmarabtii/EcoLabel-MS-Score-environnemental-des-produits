from fastapi import FastAPI
from app.db import Base, engine
from app.routers.provenance import router as provenance_router

app = FastAPI(title="Provenance Service", version="1.0.0")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ DB tables checked/created")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(provenance_router)
