import { useMemo } from "react";
import { EcoScoreData } from "../services/ecoScoreApi";
import { fmtNum, getGradeUI } from "../utils/ecoScoreUtils";
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
  const gradeUI = useMemo(() => getGradeUI(data.grade), [data.grade]);
  const norm = data.details?.normalized_indicators || {};

  return (
    <div style={styles.widgetCompact} className="ecowidget-widget">
      <div style={styles.widgetHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ ...styles.gradeBadgeSmall, background: gradeUI.bg, borderColor: gradeUI.border }}>
            <div style={{ ...styles.gradeLetterSmall, color: gradeUI.text }}>{data.grade ?? "—"}</div>
          </div>
          <div>
            <div style={styles.widgetScore}>{fmtNum(data.numeric_score)}/100</div>
            <div style={styles.widgetLabel}>EcoScore</div>
          </div>
        </div>
        {onViewDetails && (
          <button 
            onClick={onViewDetails} 
            style={styles.widgetButton}
            className="ecowidget-button"
            aria-label="Voir détails complets"
          >
            Voir détails
          </button>
        )}
      </div>
      <div style={styles.widgetIndicators}>
        <IndicatorMini label="CO₂" value={norm.co2} />
        <IndicatorMini label="Eau" value={norm.water} />
        <IndicatorMini label="Énergie" value={norm.energy} />
      </div>
    </div>
  );
}

function IndicatorMini({ label, value }: { label: string; value?: number }) {
  const n = Number(value) || 0;
  const color = n >= 0.8 ? "#16a34a" : n >= 0.6 ? "#22c55e" : n >= 0.4 ? "#f59e0b" : "#ef4444";
  return (
    <div style={styles.indicatorMini}>
      <div style={styles.indicatorMiniLabel}>{label}</div>
      <div style={{ ...styles.indicatorMiniValue, color }}>{fmtNum(n)}</div>
    </div>
  );
}

const styles = {
  widgetCompact: {
    width: "min(400px, 100%)",
    padding: 12,
    border: "1px solid #e6e8ee",
    borderRadius: 12,
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  },
  widgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gradeBadgeSmall: {
    width: 50,
    height: 50,
    borderRadius: 10,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  gradeLetterSmall: {
    fontSize: 20,
    fontWeight: 900,
  },
  widgetScore: {
    fontSize: 20,
    fontWeight: 900,
    color: "#0f172a",
  },
  widgetLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 600,
  },
  widgetButton: {
    padding: "6px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    color: "#0f172a",
  },
  widgetIndicators: {
    display: "flex",
    gap: 12,
  },
  indicatorMini: {
    flex: 1,
    textAlign: "center" as const,
  },
  indicatorMiniLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: 600,
    marginBottom: 4,
  },
  indicatorMiniValue: {
    fontSize: 16,
    fontWeight: 900,
  },
};

