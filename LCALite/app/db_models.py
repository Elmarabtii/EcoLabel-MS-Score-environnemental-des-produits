from sqlalchemy import Column, Integer, String, Numeric
from .db import Base


class IngredientFactor(Base):
    __tablename__ = "lca_ingredient_factors"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, nullable=False)
    co2_kg_per_kg = Column(Numeric(10, 4), nullable=False)
    water_l_per_kg = Column(Numeric(10, 4), nullable=False)
    energy_mj_per_kg = Column(Numeric(10, 4), nullable=False)


class PackagingFactor(Base):
    __tablename__ = "lca_packaging_factors"

    id = Column(Integer, primary_key=True, index=True)
    material = Column(String(100), unique=True, nullable=False)
    co2_kg_per_kg = Column(Numeric(10, 4), nullable=False)
    water_l_per_kg = Column(Numeric(10, 4), nullable=False)
    energy_mj_per_kg = Column(Numeric(10, 4), nullable=False)


class TransportFactor(Base):
    __tablename__ = "lca_transport_factors"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(50), unique=True, nullable=False)
    co2_kg_per_tkm = Column(Numeric(10, 4), nullable=False)
    water_l_per_tkm = Column(Numeric(10, 4), nullable=False)
    energy_mj_per_tkm = Column(Numeric(10, 4), nullable=False)
