from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import re  # 👈 pour extraire la partie numérique du product_id

from .db import Base, engine, get_db
from . import db_models  # pour que les tables soient connues
from .models import LCARequest, LCAResponse
from .lca_calculator import LCACalculator  # ⬅️ on importe la CLASSE
from .scoring_client import send_to_scoring  # ⬅️ NOUVEAU : client vers MS4


app = FastAPI(
    title="LCALite Microservice",
    description="Analyse du cycle de vie simplifiée pour EcoLabel-MS",
    version="1.0.0",
)

# 👉 création AUTOMATIQUE des tables dans eco_lca au démarrage
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "LCALite OK"}


@app.post("/lca/calc", response_model=LCAResponse)
def calculate_lca(
    payload: LCARequest,
    db: Session = Depends(get_db)
):
    try:
        # 1) Calcul ACV (ta logique existante)
        calculator = LCACalculator(db)
        totals, breakdown = calculator.compute_lca(payload)
        # totals = {"co2_kg": ..., "water_l": ..., "energy_mj": ...}

        # 2) Déterminer le type d'emballage principal pour le Scoring
        packaging_type = "unknown"
        if payload.packaging and len(payload.packaging) > 0:
            main_pack = payload.packaging[0]
            mat = main_pack.material.upper()

            if "PLASTIC" in mat:
                packaging_type = "plastic"
            elif "GLASS" in mat:
                packaging_type = "glass"
            elif "CARDBOARD" in mat or "PAPER" in mat:
                packaging_type = "paper"
            else:
                packaging_type = "other"

        # 3) Convertir product_id string -> int pour MS4 (ex: "PROD-123" -> 123)
        match = re.search(r"(\d+)$", payload.product_id)
        if match:
            numeric_product_id = int(match.group(1))
        else:
            numeric_product_id = 0  # fallback générique

        # 4) Appeler le microservice Scoring (MS4)
        score = send_to_scoring(
            product_id=numeric_product_id,
            co2_kg=totals["co2_kg"],
            water_l=totals["water_l"],
            energy_mj=totals["energy_mj"],
            packaging_type=packaging_type,
            data_completeness=1.0
        )

        # 5) Retourner la réponse ACV + score
        return LCAResponse(
            product_id=payload.product_id,
            co2_kg=totals["co2_kg"],
            water_l=totals["water_l"],
            energy_mj=totals["energy_mj"],
            breakdown=breakdown,
            score=score  # 👈 NOUVEAU
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur LCA: {e}")
