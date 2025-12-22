from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .db import init_db, get_db
from .schemas import RawTextRequest, NLPResponse
from . import nlp_pipeline
from .services import (
    normalize_ingredients,
    normalize_packaging,
    normalize_labels,
    normalize_origins,
)

from .lca_client import call_lca_service
from .lca_mapping import build_lca_request_from_nlp

app = FastAPI(title="EcoLabel-MS - NLPIngrédients")


@app.on_event("startup")
def on_startup():
    init_db()


# ---------- 1) Fonction interne : exécuter ton pipeline NLP existant ----------

def run_nlp_pipeline(payload: RawTextRequest, db: Session) -> NLPResponse:
    text = payload.text

    # 1) extraction brute avec règles simples
    ingredients_raw = nlp_pipeline.simple_extract_ingredients(text)
    packaging_raw = nlp_pipeline.simple_extract_packaging(text)
    labels_raw = nlp_pipeline.simple_extract_labels(text)
    origins_raw = nlp_pipeline.simple_extract_origins(text)

    # 2) normalisation via taxonomies
    ingredients_norm = normalize_ingredients(db, ingredients_raw)
    packaging_norm = normalize_packaging(db, packaging_raw)
    labels_norm = normalize_labels(db, labels_raw)
    origins_norm = normalize_origins(db, origins_raw)

    return NLPResponse(
        product_id=payload.product_id,
        ingredients=ingredients_norm,
        packaging=packaging_norm,
        labels=labels_norm,
        origins=origins_norm,
    )


# ---------- 2) Endpoint NLP simple (comme avant) ----------

@app.post("/nlp/extract", response_model=NLPResponse)
def extract_entities(payload: RawTextRequest, db: Session = Depends(get_db)):
    return run_nlp_pipeline(payload, db)


# ---------- 3) Nouveau endpoint : NLP + LCA ----------

@app.post("/nlp/extract-and-lca")
async def extract_and_calculate_lca(
    payload: RawTextRequest,
    db: Session = Depends(get_db)
):
    """
    1) Exécute le NLP (MS2)
    2) Construit la requête LCA
    3) Appelle le microservice LCA (MS3)
    4) Retourne tout dans une seule réponse
    """

    # 1) NLP
    nlp_response = run_nlp_pipeline(payload, db)
    nlp_dict = nlp_response.dict()

    # 2) Mapping vers la requête /lca/calc
    lca_request = build_lca_request_from_nlp(nlp_dict)

    # 3) Appel du microservice 3
    lca_result = await call_lca_service(lca_request)

    # 4) Réponse combinée
    return {
        "nlp_output": nlp_dict,
        "lca_request": lca_request,
        "lca_result": lca_result,
    }
