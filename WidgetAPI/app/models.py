from sqlalchemy import Column, Integer, Float, String, JSON, TIMESTAMP
from .db import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, index=True, nullable=False)

    numeric_score = Column(Float, nullable=False)
    grade = Column(String(1), nullable=False)          # A-E
    confidence = Column(Float, nullable=False)

    details = Column(JSON, nullable=True)             # json
    created_at = Column(TIMESTAMP, nullable=True)     # timestamptz dans DB -> OK ici
