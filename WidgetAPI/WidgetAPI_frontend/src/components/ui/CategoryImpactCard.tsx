import { getScoreColor } from "../../styles/theme";
import { Tooltip } from "../shared/Tooltip";
import "./CategoryImpactCard.css";

export interface CategoryImpactCardProps {
  label: string;
  value: number;
  weight?: number;
  description: string;
  className?: string;
}

/**
 * Carte d'impact par catégorie avec mini-barre et tooltip
 */
export function CategoryImpactCard({
  label,
  value,
  weight,
  description,
  className = "",
}: CategoryImpactCardProps) {
  const normalizedValue = Math.min(1, Math.max(0, value));
  const percentage = normalizedValue * 100;
  const color = getScoreColor(percentage);

  const quality =
    normalizedValue >= 0.8
      ? "Très bon"
      : normalizedValue >= 0.6
      ? "Bon"
      : normalizedValue >= 0.4
      ? "Moyen"
      : "Faible";

  return (
    <div className={`category-impact-card ${className}`}>
      <div className="category-impact-header">
        <div className="category-impact-label">{label}</div>
        <div className="category-impact-value">{normalizedValue.toFixed(2)}</div>
      </div>
      <div className="category-impact-bar-track">
        <div
          className="category-impact-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="category-impact-meta">
        <span className="category-impact-quality">{quality}</span>
        {weight !== undefined && (
          <span className="category-impact-weight">
            Pondération: {weight.toFixed(2)}
          </span>
        )}
      </div>
      <Tooltip content={description}>
        <div className="category-impact-description">{description}</div>
      </Tooltip>
    </div>
  );
}

