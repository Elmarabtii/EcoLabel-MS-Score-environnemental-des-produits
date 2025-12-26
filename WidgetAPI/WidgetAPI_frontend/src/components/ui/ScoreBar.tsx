import { getScoreColor } from "../../styles/theme";
import "./ScoreBar.css";

export interface ScoreBarProps {
  score: number;
  max?: number;
  showLabels?: boolean;
  showValue?: boolean;
  height?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

/**
 * Barre de progression élégante avec labels et animation
 */
export function ScoreBar({
  score,
  max = 100,
  showLabels = false,
  showValue = false,
  height = "md",
  className = "",
  animated = true,
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));
  const color = getScoreColor(score);

  const heightClasses = {
    sm: "score-bar-sm",
    md: "score-bar-md",
    lg: "score-bar-lg",
  };

  return (
    <div className={`score-bar-container ${className}`}>
      {showValue && (
        <div className="score-bar-value">
          {score.toFixed(1)} / {max}
        </div>
      )}
      {showLabels && (
        <div className="score-bar-labels">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      )}
      <div className={`score-bar-track ${heightClasses[height]}`}>
        <div
          className={`score-bar-fill ${animated ? "score-bar-animated" : ""}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Score: ${score} sur ${max}`}
        />
      </div>
    </div>
  );
}

