from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class IngredientItem(BaseModel):
    code: str
    name: Optional[str] = None
    mass_g: float
    origin_country: Optional[str] = None


class PackagingItem(BaseModel):
    material: str
    mass_g: float


class TransportLeg(BaseModel):
    mode: str
    distance_km: float
    mass_kg: float  # masse transportée sur ce trajet


class LCARequest(BaseModel):
    product_id: str
    category: str
    ingredients: List[IngredientItem] = []
    packaging: List[PackagingItem] = []
    transport: List[TransportLeg] = []


class LCAResponse(BaseModel):
    product_id: str
    co2_kg: float
    water_l: float
    energy_mj: float
    breakdown: Dict[str, Any]
    # 👇 NOUVEAU : le score renvoyé par le MS4
    score: Optional[Dict[str, Any]] = None
