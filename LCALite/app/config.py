import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin@localhost:5432/eco_lca"
)

# ➕ URL du microservice Scoring (MS4)
SCORING_SERVICE_URL = os.getenv(
    "SCORING_SERVICE_URL",
    "http://localhost:8004/score/compute"  # port où tourne MS4
)