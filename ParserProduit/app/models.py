# app/models.py
from sqlalchemy import Column, Integer, String, Text
from .database import Base

class ProduitRaw(Base):
    __tablename__ = "produits_raw"

    id = Column(Integer, primary_key=True, index=True)

    gtin = Column(String(20), index=True)
    nom = Column(String(255))
    marque = Column(String(255))
    categorie = Column(String(255))
    poids_net_g = Column(Integer)

    ingredients_raw = Column(Text)
    packaging_raw = Column(Text)
    origine_raw = Column(Text)
    labels_raw = Column(Text)

    source_file = Column(String(255))
