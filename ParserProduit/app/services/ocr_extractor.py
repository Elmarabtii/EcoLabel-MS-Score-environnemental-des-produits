# app/services/ocr_extractor.py
import io
from PIL import Image
import pytesseract

# 👉 très important sur Windows, indique le chemin de Tesseract :
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_image(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    text = pytesseract.image_to_string(image, lang="fra+eng")  # texte en français
    return text
