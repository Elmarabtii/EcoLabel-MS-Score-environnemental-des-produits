import "./Skeleton.css";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular";
  className?: string;
  lines?: number;
}

/**
 * Composant Skeleton pour les états de chargement
 */
export function Skeleton({
  width,
  height,
  variant = "rectangular",
  className = "",
  lines,
}: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={`skeleton-container ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton skeleton-${variant}`}
            style={{
              width: i === lines - 1 ? "80%" : "100%",
              height: height || "1rem",
              marginBottom: i < lines - 1 ? "0.5rem" : "0",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
      aria-label="Chargement..."
      role="status"
    />
  );
}

/**
 * Skeleton spécialisé pour les cartes produit
 */
export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton-header">
        <Skeleton variant="rectangular" width="60%" height="1.5rem" />
        <Skeleton variant="circular" width="60px" height="60px" />
      </div>
      <Skeleton variant="rectangular" width="100%" height="1.25rem" className="skeleton-margin" />
      <Skeleton variant="rectangular" width="80%" height="0.5rem" />
      <Skeleton variant="rectangular" width="100%" height="8px" className="skeleton-margin-top" />
      <Skeleton variant="rectangular" width="40%" height="0.875rem" className="skeleton-margin-top" />
    </div>
  );
}

/**
 * Skeleton spécialisé pour la page détail
 */
export function ProductDetailSkeleton() {
  return (
    <div className="product-detail-skeleton">
      <Skeleton variant="rectangular" width="40%" height="2rem" className="skeleton-margin-bottom" />
      <Skeleton lines={3} width="100%" className="skeleton-margin-bottom" />
      <Skeleton variant="rectangular" width="100%" height="12px" className="skeleton-margin-bottom" />
      <div className="skeleton-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <Skeleton variant="rectangular" width="60%" height="1rem" />
            <Skeleton variant="rectangular" width="100%" height="8px" className="skeleton-margin-top" />
            <Skeleton variant="rectangular" width="40%" height="0.75rem" className="skeleton-margin-top" />
          </div>
        ))}
      </div>
    </div>
  );
}

