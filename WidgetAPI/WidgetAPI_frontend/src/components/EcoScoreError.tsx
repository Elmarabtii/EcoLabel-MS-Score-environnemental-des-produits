import { EcoScoreCoreProps } from "./EcoScoreCore";
import { InfoAlert } from "./ui/InfoAlert";
import "./EcoScoreError.css";

export function EcoScoreError({
  error,
  productId,
  onRetry,
  mode,
}: {
  error: string;
  productId: number | string | undefined | null;
  onRetry: () => void;
  mode: EcoScoreCoreProps["mode"];
}) {
  const handleBackToList = () => {
    window.location.href = "/";
  };

  if (error === "NOT_FOUND") {
    return (
      <div className="ecoscore-page-container">
        <div className="ecoscore-page-card">
          <div className="ecoscore-not-found">
            <div className="ecoscore-not-found-icon">📦</div>
            <h2 className="ecoscore-not-found-title">Produit introuvable</h2>
            <p className="ecoscore-not-found-text">
              Le produit #{productId} n'existe pas dans notre base de données.
            </p>
            <button 
              onClick={handleBackToList} 
              className="ecoscore-action-button"
              aria-label="Retour à la liste"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecoscore-page-container">
      <div className="ecoscore-page-card">
        <InfoAlert
          type="error"
          title="Erreur de chargement"
          onAction={onRetry}
          actionLabel="Réessayer"
        >
          {error}
        </InfoAlert>
      </div>
    </div>
  );
}

