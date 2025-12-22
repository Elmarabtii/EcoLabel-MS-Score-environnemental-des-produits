# app/main.py
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from .models import ProduitRaw
from .schemas import ProduitRawOut
from .services.pdf_extractor import extract_text_from_pdf
from .services.ocr_extractor import extract_text_from_image
from .services.parser_logic import parse_product_text

# ⬇️ NOUVEL IMPORT
from .services.nlp_client import call_nlp_and_lca


# Création tables au démarrage
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ParserProduit-MS")


# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/parse", response_model=ProduitRawOut)
async def parse_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    content_type = file.content_type or ""
    filename_lower = file.filename.lower()

    if content_type == "application/pdf" or filename_lower.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif content_type.startswith("image/") or filename_lower.endswith((".png", ".jpg", ".jpeg", ".webp")):
        text = extract_text_from_image(file_bytes)
    else:
        raise HTTPException(400, "Fichier non supporté")

    if not text.strip():
        raise HTTPException(400, "Impossible d'extraire du texte")

    produit_dict = parse_product_text(text=text, gtin="", source_file=file.filename)
    produit = ProduitRaw(**produit_dict)
    db.add(produit)
    db.commit()
    db.refresh(produit)

    return produit


@app.post("/parse-and-nlp")
async def parse_file_and_nlp(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Recyclage du /parse
    file_bytes = await file.read()
    content_type = file.content_type or ""
    filename_lower = file.filename.lower()

    if content_type == "application/pdf" or filename_lower.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif content_type.startswith("image/") or filename_lower.endswith((".png", ".jpg", ".jpeg", ".webp")):
        text = extract_text_from_image(file_bytes)
    else:
        raise HTTPException(400, "Fichier non supporté")

    if not text.strip():
        raise HTTPException(400, "Impossible d'extraire du texte")

    produit_dict = parse_product_text(text=text, gtin="", source_file=file.filename)

    produit = ProduitRaw(**produit_dict)
    db.add(produit)
    db.commit()
    db.refresh(produit)

    # 🔥 ici on appelle MS2 → MS3
    combined = call_nlp_and_lca(
        product_id=str(produit.id),
        text=text,
    )

    # Extraction propre
    nlp_output = combined.get("nlp_output", {})
    lca_output = combined.get("lca_result", {})

    # Réponse enrichie
    return {
        "product": produit,
        "nlp": nlp_output,
        "lca": lca_output
    }
