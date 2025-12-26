import { GradeBadge } from "./GradeBadge";
import { ScoreBar } from "./ScoreBar";
import "./ProductCard.css";

export interface ProductCardProps {
  id: number;
  name?: string;
  score?: number;
  grade?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Carte produit premium avec header, métriques et CTA
 */
export function ProductCard({
  id,
  name,
  score,
  grade,
  onClick,
  className = "",
}: ProductCardProps) {
  const displayName = name || `Produit #${id}`;

  return (
    <div
      className={`product-card ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Voir les détails de ${displayName}`}
    >
      <div className="product-card-header">
        <div className="product-card-info">
          <h3 className="product-card-name">{displayName}</h3>
          <div className="product-card-id">ID: {id}</div>
        </div>
        {grade && <GradeBadge grade={grade} size="md" />}
      </div>

      {score !== undefined && (
        <div className="product-card-score">
          <div className="product-card-score-value">
            {score.toFixed(1)} / 100
          </div>
          <ScoreBar score={score} height="sm" animated />
        </div>
      )}

      <div className="product-card-footer">
        <span className="product-card-cta">Voir les détails →</span>
      </div>
    </div>
  );
}

