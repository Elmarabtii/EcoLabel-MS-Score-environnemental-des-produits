import { EcoScoreData } from "../services/ecoScoreApi";
import { fmtNum } from "../utils/ecoScoreUtils";
import { GradeBadge } from "./ui/GradeBadge";
import { getScoreColor } from "../styles/theme";
import "./EcoScoreWidget.css";

export interface EcoScoreWidgetProps {
  data: EcoScoreData;
  onViewDetails?: () => void;
}

/**
 * Composant Widget Compact EcoScore
 * 
 * Affiche uniquement les informations essentielles :
 * - Grade (A-E)
 * - Score global (0-100)
 * - Indicateurs clés (CO₂, Eau, Énergie)
 * - Bouton "Voir détails"
 * 
 * Single Source of Truth : utilise les données du backend sans modification
 */
export default function EcoScoreWidget({ data, onViewDetails }: EcoScoreWidgetProps) {
  const norm = data.details?.normalized_indicators || {};

  return (
    <div className="ecoscore-widget">
      <div className="ecoscore-widget-header">
        <div className="ecoscore-widget-score-group">
          <GradeBadge grade={data.grade} size="sm" />
          <div>
            <div className="ecoscore-widget-score">{fmtNum(data.numeric_score)}/100</div>
            <div className="ecoscore-widget-label">EcoScore</div>
          </div>
        </div>
        {onViewDetails && (
          <button 
            onClick={onViewDetails} 
            className="ecoscore-widget-button"
            aria-label="Voir détails complets"
          >
            Voir détails
          </button>
        )}
      </div>
      <div className="ecoscore-widget-indicators">
        <IndicatorMini label="CO₂" value={norm.co2} />
        <IndicatorMini label="Eau" value={norm.water} />
        <IndicatorMini label="Énergie" value={norm.energy} />
      </div>
    </div>
  );
}

function IndicatorMini({ label, value }: { label: string; value?: number }) {
  const n = Number(value) || 0;
  const color = getScoreColor(n * 100);
  return (
    <div className="ecoscore-widget-indicator">
      <div className="ecoscore-widget-indicator-label">{label}</div>
      <div className="ecoscore-widget-indicator-value" style={{ color }}>
        {fmtNum(n)}
      </div>
    </div>
  );
}

