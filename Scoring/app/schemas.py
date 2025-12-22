from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ScoreRequest(BaseModel):
    product_id: int
    co2_kg: float = Field(..., ge=0)
    water_l: float = Field(..., ge=0)
    energy_mj: float = Field(..., ge=0)
    packaging_type: str = "unknown"
    data_completeness: float = Field(1.0, ge=0, le=1)

class ScoreResponse(BaseModel):
    product_id: int
    numeric_score: float
    grade: str
    confidence: float
    details: Dict[str, Any]
    created_at: Optional[str] = None

    class Config:
        from_attributes = True  # pour supporter SQLAlchemy -> Pydantic
