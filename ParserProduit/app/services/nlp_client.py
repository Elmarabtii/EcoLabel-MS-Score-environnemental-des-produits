# app/services/nlp_client.py
import os
import requests

# MS2 tourne sur 8001
NLP_SERVICE_URL = os.getenv(
    "NLP_SERVICE_URL",
    "http://localhost:8001/nlp/extract-and-lca"
)


def call_nlp_and_lca(product_id: str, text: str) -> dict:
    """
    Appelle /nlp/extract-and-lca (MS2)
    et renvoie le JSON complet :
      - nlp_output
      - lca_request
      - lca_result
    """
    payload = {
        "product_id": product_id,
        "text": text,
        "language": "fr",
    }

    response = requests.post(NLP_SERVICE_URL, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()
