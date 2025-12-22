from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class IngredientTaxonomy(Base):
    __tablename__ = "ingredient_taxonomy"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)      # nom normalisé
    synonyms = Column(String)                               # "huile palme;huile de palme"
    eco_ref_code = Column(String)                           # code EcoInvent, etc.
    default_impact_factor = Column(Float, nullable=True)    # optionnel

class PackagingTaxonomy(Base):
    __tablename__ = "packaging_taxonomy"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)      # "Plastique PET", "Verre"
    synonyms = Column(String)
    eco_ref_code = Column(String)

class LabelTaxonomy(Base):
    __tablename__ = "label_taxonomy"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)      # "Bio", "AB", "FairTrade"
    synonyms = Column(String)

class OriginTaxonomy(Base):
    __tablename__ = "origin_taxonomy"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)      # "France", "Maroc", "UE"
    synonyms = Column(String)
