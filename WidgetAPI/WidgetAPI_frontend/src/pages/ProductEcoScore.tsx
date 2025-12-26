import { useState } from "react";
import EcoScoreCore from "../components/EcoScoreCore";
import "./ProductEcoScore.css";

export interface ProductEcoScoreProps {
  productId?: number | string;
  initialMode?: "page" | "widget";
  apiBase?: string;
}

/**
 * Page principale ProductEcoScore
 * 
 * Point d'entrée pour afficher l'EcoScore d'un produit
 * Gère le mode d'affichage (page ou widget)
 * 
 * @param productId - ID du produit (peut être passé en props ou récupéré depuis l'URL)
 * @param initialMode - Mode initial d'affichage (défaut: "page")
 * @param apiBase - URL de base de l'API
 */
export default function ProductEcoScore({
  productId: propProductId,
  initialMode = "page",
  apiBase = "http://127.0.0.1:8005",
}: ProductEcoScoreProps) {
  // Récupérer productId depuis les props ou l'URL
  const [productId] = useState(() => {
    if (propProductId) return propProductId;
    // Essayer de récupérer depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const urlProductId = params.get("productId");
    if (urlProductId) return urlProductId;
    // Par défaut, utiliser 1
    return 1;
  });

  const [mode, setMode] = useState<"page" | "widget">(initialMode);

  const handleBackToList = () => {
    window.location.href = "/";
  };

  return (
    <div className="product-ecoscore-container">
      <div className="product-ecoscore-nav">
        <button 
          onClick={handleBackToList} 
          className="product-ecoscore-back-button"
          aria-label="Retour à la liste des produits"
        >
          ← Retour à la liste des produits
        </button>
      </div>
      <EcoScoreCore
        productId={productId}
        mode={mode}
        apiBase={apiBase}
        onModeChange={setMode}
      />
    </div>
  );
}

