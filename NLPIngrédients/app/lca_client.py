import httpx
import os

# URL de ton microservice 3 (LCALITE)
# Utilise le nom du conteneur Docker si disponible, sinon localhost
LCA_SERVICE_URL = os.getenv(
    "LCA_SERVICE_URL",
    "http://localhost:8002/lca/calc"
)


async def call_lca_service(payload: dict) -> dict:
    """
    Appelle le microservice LCALite (MS3) et retourne la réponse JSON.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(LCA_SERVICE_URL, json=payload)
        resp.raise_for_status()
        return resp.json()
