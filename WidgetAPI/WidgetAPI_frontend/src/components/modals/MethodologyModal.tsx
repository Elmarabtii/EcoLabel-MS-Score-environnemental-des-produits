import { EcoScoreData } from "../../services/ecoScoreApi";
import { fmtNum } from "../../utils/ecoScoreUtils";

export interface MethodologyModalProps {
  data: EcoScoreData;
}

export function MethodologyModal({ data }: MethodologyModalProps) {
  const weights = data?.details?.weights || {};
  const norm = data?.details?.normalized_indicators || {};
  const score = data?.numeric_score || 0;
  const penalty = (data?.details?.packaging_penalty || 0) * 100;

  return (
    <div style={styles.modalBody}>
      <h2 style={styles.modalTitle}>Méthodologie de calcul</h2>
      
      <div style={styles.methodologySection}>
        <h3 style={styles.methodologySubtitle}>1. Normalisation</h3>
        <p style={styles.methodologyText}>
          Chaque indicateur (CO₂, Eau, Énergie) est normalisé entre 0 et 1 pour permettre la comparaison.
        </p>
        <div style={styles.methodologyExample}>
          <div>CO₂ normalisé : {fmtNum(norm.co2)}</div>
          <div>Eau normalisée : {fmtNum(norm.water)}</div>
          <div>Énergie normalisée : {fmtNum(norm.energy)}</div>
        </div>
      </div>

      <div style={styles.methodologySection}>
        <h3 style={styles.methodologySubtitle}>2. Pondérations</h3>
        <p style={styles.methodologyText}>
          Chaque indicateur est pondéré selon son importance relative :
        </p>
        <div style={styles.methodologyExample}>
          <div>CO₂ : {fmtNum(weights.co2)} × {fmtNum(norm.co2)} = {fmtNum((weights.co2 || 0) * (norm.co2 || 0))}</div>
          <div>Eau : {fmtNum(weights.water)} × {fmtNum(norm.water)} = {fmtNum((weights.water || 0) * (norm.water || 0))}</div>
          <div>Énergie : {fmtNum(weights.energy)} × {fmtNum(norm.energy)} = {fmtNum((weights.energy || 0) * (norm.energy || 0))}</div>
        </div>
      </div>

      <div style={styles.methodologySection}>
        <h3 style={styles.methodologySubtitle}>3. Score de base</h3>
        <p style={styles.methodologyText}>
          Score = (CO₂ × poids_CO₂) + (Eau × poids_Eau) + (Énergie × poids_Énergie)
        </p>
        <div style={styles.methodologyExample}>
          Score de base = {fmtNum(((weights.co2 || 0) * (norm.co2 || 0) + (weights.water || 0) * (norm.water || 0) + (weights.energy || 0) * (norm.energy || 0)) * 100)}
        </div>
      </div>

      <div style={styles.methodologySection}>
        <h3 style={styles.methodologySubtitle}>4. Pénalités</h3>
        <p style={styles.methodologyText}>
          Des pénalités sont appliquées selon le type d'emballage :
        </p>
        <div style={styles.methodologyExample}>
          Pénalité emballage : -{fmtNum(penalty)}%
          <br />
          Score final = {fmtNum(score)}
        </div>
      </div>

      <div style={styles.methodologySection}>
        <h3 style={styles.methodologySubtitle}>5. Grade</h3>
        <p style={styles.methodologyText}>
          Le grade est attribué selon la plage de score :
        </p>
        <div style={styles.methodologyExample}>
          <div>A = 85-100 (Excellent)</div>
          <div>B = 70-84 (Bon)</div>
          <div>C = 55-69 (Moyen)</div>
          <div>D = 40-54 (Faible)</div>
          <div>E = 0-39 (Très faible)</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalBody: {
    paddingRight: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 24,
  },
  methodologySection: {
    marginBottom: 24,
  },
  methodologySubtitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 8,
  },
  methodologyText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 1.6,
    marginBottom: 12,
  },
  methodologyExample: {
    padding: 12,
    background: "#f1f5f9",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "monospace",
    color: "#0f172a",
    lineHeight: 1.8,
  },
};

