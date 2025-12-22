from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List

from .db import SessionLocal, Base, engine
from . import models, schemas
from .scoring_service import compute_score

# Créer les tables si elles n'existent pas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoLabel-MS - Scoring",
    version="1.0.0",
    description="Microservice de calcul d'éco-score (A–E) à partir des indicateurs ACV."
)

# Dépendance DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


@app.post("/score/compute", response_model=schemas.ScoreResponse, tags=["score"])
def compute_product_score(
    payload: schemas.ScoreRequest,
    db: Session = Depends(get_db)
):
    # 1) Calcul du score
    result = compute_score(
        co2_kg=payload.co2_kg,
        water_l=payload.water_l,
        energy_mj=payload.energy_mj,
        packaging_type=payload.packaging_type,
        data_completeness=payload.data_completeness
    )

    # 2) Sauvegarde en base
    score_obj = models.Score(
        product_id=payload.product_id,
        numeric_score=result["numeric_score"],
        grade=result["grade"],
        confidence=result["confidence"],
        details=result["details"]
    )

    db.add(score_obj)
    db.commit()
    db.refresh(score_obj)

    # 3) Retour API
    return schemas.ScoreResponse(
        product_id=score_obj.product_id,
        numeric_score=score_obj.numeric_score,
        grade=score_obj.grade,
        confidence=score_obj.confidence,
        details=score_obj.details,
        created_at=score_obj.created_at.isoformat() if score_obj.created_at else None
    )
