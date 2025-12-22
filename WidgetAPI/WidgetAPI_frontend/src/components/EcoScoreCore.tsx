import { useEcoScore } from "../hooks/useEcoScore";
import EcoScorePage from "./EcoScorePage";
import EcoScoreWidget from "./EcoScoreWidget";
import { EcoScoreLoading } from "./EcoScoreLoading";
import { EcoScoreError } from "./EcoScoreError";

export interface EcoScoreCoreProps {
  productId: number | string | undefined | null;
  mode: "page" | "widget";
  apiBase?: string;
  onModeChange?: (mode: "page" | "widget") => void;
}

/**
 * Composant central EcoScore
 * 
 * Single Source of Truth : utilise le hook useEcoScore qui consomme l'API unique
 * Délègue le rendu selon le mode (page ou widget)
 * 
 * @param productId - ID du produit
 * @param mode - Mode d'affichage : "page" (détaillé) ou "widget" (compact)
 * @param apiBase - URL de base de l'API
 * @param onModeChange - Callback optionnel pour changer le mode
 */
export default function EcoScoreCore({
  productId,
  mode,
  apiBase = "http://127.0.0.1:8005",
  onModeChange,
}: EcoScoreCoreProps) {
  const { data, loading, error, retry } = useEcoScore(productId, apiBase);

  // État de chargement
  if (loading) {
    return <EcoScoreLoading mode={mode} />;
  }

  // État d'erreur
  if (error) {
    return (
      <EcoScoreError
        error={error}
        productId={productId}
        onRetry={retry}
        mode={mode}
      />
    );
  }

  // Pas de données
  if (!data) {
    return null;
  }

  // Délégation du rendu selon le mode
  if (mode === "widget") {
    return (
      <EcoScoreWidget
        data={data}
        onViewDetails={() => onModeChange?.("page")}
      />
    );
  }

  return (
    <EcoScorePage
      data={data}
      apiBase={apiBase}
      onModeChange={onModeChange}
    />
  );
}

