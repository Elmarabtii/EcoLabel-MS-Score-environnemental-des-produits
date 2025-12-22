from typing import Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text

from .models import LCARequest


class LCACalculator:

    def __init__(self, db: Session):
        self.db = db

    # ---------- Chargement des facteurs depuis la BDD ----------

    def _load_ingredient_factors(self) -> Dict[str, Dict[str, float]]:
        """
        Retourne un dict:
        {
          "MILK_COW": {"co2_kg_per_kg": 1.2, "water_l_per_kg": 10.0, "energy_mj_per_kg": 5.0},
          ...
        }
        """
        sql = text("""
            SELECT code, co2_kg_per_kg, water_l_per_kg, energy_mj_per_kg
            FROM lca_ingredient_factors
        """)
        rows = self.db.execute(sql).mappings().all()
        return {
            row["code"]: {
                "co2_kg_per_kg": float(row["co2_kg_per_kg"]),
                "water_l_per_kg": float(row["water_l_per_kg"]),
                "energy_mj_per_kg": float(row["energy_mj_per_kg"]),
            }
            for row in rows
        }

    def _load_packaging_factors(self) -> Dict[str, Dict[str, float]]:
        sql = text("""
            SELECT material, co2_kg_per_kg, water_l_per_kg, energy_mj_per_kg
            FROM lca_packaging_factors
        """)
        rows = self.db.execute(sql).mappings().all()
        return {
            row["material"]: {
                "co2_kg_per_kg": float(row["co2_kg_per_kg"]),
                "water_l_per_kg": float(row["water_l_per_kg"]),
                "energy_mj_per_kg": float(row["energy_mj_per_kg"]),
            }
            for row in rows
        }

    def _load_transport_factors(self) -> Dict[str, Dict[str, float]]:
        sql = text("""
            SELECT mode, co2_kg_per_tkm, water_l_per_tkm, energy_mj_per_tkm
            FROM lca_transport_factors
        """)
        rows = self.db.execute(sql).mappings().all()
        return {
            row["mode"]: {
                "co2_kg_per_tkm": float(row["co2_kg_per_tkm"]),
                "water_l_per_tkm": float(row["water_l_per_tkm"]),
                "energy_mj_per_tkm": float(row["energy_mj_per_tkm"]),
            }
            for row in rows
        }

    # ---------- Calcul ACV ----------

    def compute_lca(self, req: LCARequest) -> Tuple[Dict[str, float], Dict[str, Any]]:
        ing_factors = self._load_ingredient_factors()
        pack_factors = self._load_packaging_factors()
        tr_factors = self._load_transport_factors()

        # --- Ingrédients ---
        co2_ing = water_ing = energy_ing = 0.0
        for ing in req.ingredients:
            f = ing_factors.get(ing.code)
            if not f:
                # tu peux logger les codes non trouvés si tu veux
                continue

            mass_kg = ing.mass_g / 1000.0
            co2_ing += mass_kg * f["co2_kg_per_kg"]
            water_ing += mass_kg * f["water_l_per_kg"]
            energy_ing += mass_kg * f["energy_mj_per_kg"]

        # --- Packaging ---
        co2_pack = water_pack = energy_pack = 0.0
        for p in req.packaging:
            f = pack_factors.get(p.material)
            if not f:
                continue

            mass_kg = p.mass_g / 1000.0
            co2_pack += mass_kg * f["co2_kg_per_kg"]
            water_pack += mass_kg * f["water_l_per_kg"]
            energy_pack += mass_kg * f["energy_mj_per_kg"]

        # --- Transport ---
        co2_tr = water_tr = energy_tr = 0.0
        for t in req.transport:
            f = tr_factors.get(t.mode)
            if not f:
                continue

            # tonne.km = distance_km × masse(tonnes)
            tkm = t.distance_km * (t.mass_kg / 1000.0)
            co2_tr += tkm * f["co2_kg_per_tkm"]
            water_tr += tkm * f["water_l_per_tkm"]
            energy_tr += tkm * f["energy_mj_per_tkm"]

        co2_total = co2_ing + co2_pack + co2_tr
        water_total = water_ing + water_pack + water_tr
        energy_total = energy_ing + energy_pack + energy_tr

        breakdown = {
            "ingredients": {
                "co2_kg": round(co2_ing, 4),
                "water_l": round(water_ing, 4),
                "energy_mj": round(energy_ing, 4),
            },
            "packaging": {
                "co2_kg": round(co2_pack, 4),
                "water_l": round(water_pack, 4),
                "energy_mj": round(energy_pack, 4),
            },
            "transport": {
                "co2_kg": round(co2_tr, 4),
                "water_l": round(water_tr, 4),
                "energy_mj": round(energy_tr, 4),
            },
        }

        totals = {
            "co2_kg": round(co2_total, 4),
            "water_l": round(water_total, 4),
            "energy_mj": round(energy_total, 4),
        }

        return totals, breakdown
