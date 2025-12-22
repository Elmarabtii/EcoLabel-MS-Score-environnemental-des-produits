# app/services/pdf_extractor.py
import io
import pdfplumber

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_chunks = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_chunks.append(page_text)
    full_text = "\n".join(text_chunks)
    return full_text
