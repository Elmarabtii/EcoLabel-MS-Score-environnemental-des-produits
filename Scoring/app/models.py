from sqlalchemy import Column, Integer, Float, String, JSON, DateTime, func
from .db import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, index=True, nullable=False)
    numeric_score = Column(Float, nullable=False)
    grade = Column(String(1), nullable=False)
    confidence = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
