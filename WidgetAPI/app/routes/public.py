from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db import get_db
from ..models import Score
from ..schemas import ScoreOut

router = APIRouter(prefix="/public", tags=["Public"])

@router.get("/product/{product_id}", response_model=ScoreOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    # dernier score calculé pour ce produit
    score = (
        db.query(Score)
        .filter(Score.product_id == product_id)
        .order_by(desc(Score.created_at))
        .first()
    )
    if not score:
        raise HTTPException(status_code=404, detail="Score not found for this product")
    return score

@router.get("/search")
def search(product_id: int = Query(...), db: Session = Depends(get_db)):
    # retourne tous les scores d’un produit (utile debug)
    items = (
        db.query(Score)
        .filter(Score.product_id == product_id)
        .order_by(desc(Score.created_at))
        .all()
    )
    return {
        "product_id": product_id,
        "count": len(items),
        "scores": [
            {
                "id": s.id,
                "numeric_score": s.numeric_score,
                "grade": s.grade,
                "confidence": s.confidence,
                "created_at": s.created_at,
            }
            for s in items
        ],
    }
