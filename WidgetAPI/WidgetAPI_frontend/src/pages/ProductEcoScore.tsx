import { useState } from "react";
import EcoScoreCore from "../components/EcoScoreCore";

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
    <div style={styles.container}>
      <div style={styles.navBar}>
        <button onClick={handleBackToList} style={styles.backButton}>
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

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    background: "#f8fafc",
    width: "100%",
  },
  navBar: {
    width: "100%",
    maxWidth: "800px",
    padding: "12px 0",
    marginBottom: "16px",
  },
  backButton: {
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    transition: "all 0.2s",
  },
};

