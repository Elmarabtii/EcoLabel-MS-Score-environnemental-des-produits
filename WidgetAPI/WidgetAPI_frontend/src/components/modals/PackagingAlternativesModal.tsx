import React from "react";
import { EcoScoreData } from "../../services/ecoScoreApi";
import { formatPackagingType, getPackagingImpact } from "../../utils/ecoScoreUtils";
import "./PackagingAlternativesModal.css";

export interface PackagingAlternativesModalProps {
  data: EcoScoreData;
}

/**
 * Modal affichant les alternatives d'emballage avec leurs impacts
 */
export function PackagingAlternativesModal({ data }: PackagingAlternativesModalProps) {
  const currentType = data.details?.packaging_type || "";
  const currentPenalty = data.details?.packaging_penalty || 0;

  // Alternatives d'emballage avec leurs impacts
  const alternatives = [
    {
      type: "paper",
      name: "Papier",
      impact: "faible impact",
      penalty: 0,
      description: "Emballage en papier recyclé, excellent choix environnemental",
      icon: "📄",
      color: "#16a34a",
    },
    {
      type: "cardboard",
      name: "Carton",
      impact: "faible impact",
      penalty: 0,
      description: "Emballage en carton recyclable, très bon pour l'environnement",
      icon: "📦",
      color: "#16a34a",
    },
    {
      type: "glass",
      name: "Verre",
      impact: "impact moyen",
      penalty: 0.02,
      description: "Emballage en verre, recyclable mais plus lourd à transporter",
      icon: "🥃",
      color: "#f59e0b",
    },
    {
      type: "metal",
      name: "Métal",
      impact: "impact moyen",
      penalty: 0.03,
      description: "Emballage en métal, recyclable mais nécessite de l'énergie pour la production",
      icon: "🥫",
      color: "#f59e0b",
    },
    {
      type: "plastic",
      name: "Plastique",
      impact: "impact élevé",
      penalty: 0.1,
      description: "Emballage en plastique, impact environnemental élevé",
      icon: "🧴",
      color: "#ef4444",
    },
    {
      type: "mixed",
      name: "Mixte",
      impact: "impact variable",
      penalty: 0.05,
      description: "Emballage mixte, impact variable selon les matériaux",
      icon: "📋",
      color: "#64748b",
    },
  ];

  // Filtrer pour ne pas montrer l'emballage actuel
  const otherAlternatives = alternatives.filter((alt) => alt.type !== currentType);

  // Calculer le nouveau score potentiel avec chaque alternative
  const calculateNewScore = (penalty: number) => {
    const baseScore = data.numeric_score / (1 - currentPenalty); // Score avant pénalité
    return Math.max(0, Math.min(100, baseScore * (1 - penalty)));
  };

  return (
    <div className="packaging-alternatives-modal">
      <h2 className="packaging-alternatives-title">Alternatives d'emballage</h2>
      <p className="packaging-alternatives-subtitle">
        Comparez les alternatives d'emballage et leur impact sur le score EcoScore
      </p>

      <div className="packaging-alternatives-current">
        <div className="packaging-alternatives-current-label">Emballage actuel</div>
        <div className="packaging-alternatives-current-card">
          <div className="packaging-alternatives-icon">
            {alternatives.find((a) => a.type === currentType)?.icon || "📦"}
          </div>
          <div className="packaging-alternatives-info">
            <div className="packaging-alternatives-name">
              {formatPackagingType(currentType)}
            </div>
            <div className="packaging-alternatives-impact">
              Impact: {getPackagingImpact(currentType)}
            </div>
            <div className="packaging-alternatives-score">
              Score actuel: <strong>{data.numeric_score.toFixed(1)}/100</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="packaging-alternatives-list">
        <h3 className="packaging-alternatives-list-title">Alternatives recommandées</h3>
        {otherAlternatives.map((alternative) => {
          const newScore = calculateNewScore(alternative.penalty);
          const scoreImprovement = newScore - data.numeric_score;
          const isBetter = scoreImprovement > 0;

          return (
            <div
              key={alternative.type}
              className={`packaging-alternative-card ${isBetter ? "packaging-alternative-better" : ""}`}
            >
              <div className="packaging-alternative-header">
                <div className="packaging-alternative-icon" style={{ color: alternative.color }}>
                  {alternative.icon}
                </div>
                <div className="packaging-alternative-info">
                  <div className="packaging-alternative-name">{alternative.name}</div>
                  <div className="packaging-alternative-impact">
                    Impact: <strong>{alternative.impact}</strong>
                  </div>
                </div>
                {isBetter && (
                  <div className="packaging-alternative-badge">
                    +{scoreImprovement.toFixed(1)} pts
                  </div>
                )}
              </div>
              <div className="packaging-alternative-description">
                {alternative.description}
              </div>
              <div className="packaging-alternative-comparison">
                <div className="packaging-alternative-score-current">
                  Score actuel: <strong>{data.numeric_score.toFixed(1)}/100</strong>
                </div>
                <div className="packaging-alternative-arrow">→</div>
                <div className="packaging-alternative-score-new">
                  Score potentiel: <strong style={{ color: isBetter ? "#16a34a" : "#64748b" }}>
                    {newScore.toFixed(1)}/100
                  </strong>
                </div>
              </div>
              {alternative.penalty > 0 && (
                <div className="packaging-alternative-penalty">
                  Pénalité: -{(alternative.penalty * 100).toFixed(0)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="packaging-alternatives-note">
        <strong>Note :</strong> Ces estimations sont basées sur les données moyennes. 
        Le score réel peut varier selon les spécificités du produit.
      </div>
    </div>
  );
}

