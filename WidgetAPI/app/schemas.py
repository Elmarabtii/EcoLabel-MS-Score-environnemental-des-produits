from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ScoreOut(BaseModel):
    product_id: int
    numeric_score: float
    grade: str
    confidence: float
    details: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
