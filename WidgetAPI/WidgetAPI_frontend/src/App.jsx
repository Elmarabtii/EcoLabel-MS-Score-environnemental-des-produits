import { useState } from "react";
import ProductEcoScore from "./pages/ProductEcoScore";
import ProductList from "./pages/ProductList";

/**
 * Application principale
 * 
 * Utilise la nouvelle architecture centralisée :
 * - ProductEcoScore (page) -> EcoScoreCore -> EcoScorePage / EcoScoreWidget
 * - Single Source of Truth : backend unique via useEcoScore hook
 * - ProductList : liste de tous les produits disponibles
 */
export default function App() {
  // Récupérer productId depuis l'URL si présent au chargement
  const urlParams = new URLSearchParams(window.location.search);
  const urlProductId = urlParams.get("productId");
  
  const [currentView, setCurrentView] = useState(
    urlProductId ? "product" : "list"
  );
  const [selectedProductId, setSelectedProductId] = useState(
    urlProductId ? Number(urlProductId) : null
  );

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    setCurrentView("product");
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, "", `?productId=${productId}`);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    window.history.pushState({}, "", window.location.pathname);
  };

  if (currentView === "list") {
    return (
      <div>
        <ProductList onProductSelect={handleProductSelect} />
      </div>
    );
  }

  return (
    <div>
      <ProductEcoScore 
        productId={selectedProductId || 1} 
        initialMode="page" 
      />
    </div>
  );
}
