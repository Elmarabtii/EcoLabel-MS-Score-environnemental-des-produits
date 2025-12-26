import { EcoScoreCoreProps } from "./EcoScoreCore";
import { ProductDetailSkeleton, Skeleton } from "./ui/Skeleton";
import "./EcoScoreError.css";

export function EcoScoreLoading({ mode }: { mode: EcoScoreCoreProps["mode"] }) {
  if (mode === "widget") {
    return (
      <div className="ecoscore-widget-skeleton">
        <div className="ecoscore-widget-skeleton-row">
          <Skeleton variant="circular" width="50px" height="50px" />
          <div>
            <Skeleton width="80px" height="20px" />
            <Skeleton width="60px" height="12px" className="skeleton-margin-top" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecoscore-page-container">
      <ProductDetailSkeleton />
    </div>
  );
}

