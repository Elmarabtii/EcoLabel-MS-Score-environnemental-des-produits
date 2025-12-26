import { getGradeColors } from "../../styles/theme";
import "./GradeBadge.css";

export interface GradeBadgeProps {
  grade: string | undefined | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * Badge élégant pour afficher le grade A-E
 */
export function GradeBadge({ 
  grade, 
  size = "md", 
  showLabel = false,
  className = "" 
}: GradeBadgeProps) {
  if (!grade) return null;

  const colors = getGradeColors(grade);
  const sizeClasses = {
    sm: "grade-badge-sm",
    md: "grade-badge-md",
    lg: "grade-badge-lg",
  };

  return (
    <div
      className={`grade-badge ${sizeClasses[size]} ${className}`}
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      aria-label={`Grade ${grade}`}
    >
      <div className="grade-letter">{grade}</div>
      {showLabel && <div className="grade-label">Grade</div>}
    </div>
  );
}

