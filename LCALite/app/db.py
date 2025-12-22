# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import DATABASE_URL

# ⚙️ Connexion à PostgreSQL (ta base eco_lca)
engine = create_engine(DATABASE_URL)

# Session pour les requêtes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base SQLAlchemy pour déclarer les tables
Base = declarative_base()


def get_db():
    """Dépendance FastAPI pour obtenir une session DB."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
