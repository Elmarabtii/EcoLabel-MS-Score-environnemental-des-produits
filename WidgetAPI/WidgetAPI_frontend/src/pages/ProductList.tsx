import { useEffect, useState } from "react";
import { fetchProductList, ProductListItem } from "../services/ecoScoreApi";
import { ProductCard } from "../components/ui/ProductCard";
import { ProductCardSkeleton } from "../components/ui/Skeleton";
import { InfoAlert } from "../components/ui/InfoAlert";
import { theme } from "../styles/theme";
import "./ProductList.css";

export interface ProductListProps {
  apiBase?: string;
  onProductSelect?: (productId: number) => void;
}

/**
 * Page de liste des produits
 * 
 * Affiche tous les produits disponibles dans la base de données
 * avec leurs scores EcoScore pour permettre la navigation
 */
export default function ProductList({
  apiBase = "http://127.0.0.1:8005",
  onProductSelect,
}: ProductListProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productList = await fetchProductList(apiBase);
        setProducts(productList);
      } catch (err: any) {
        setError(err?.message || "Impossible de charger la liste des produits.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [apiBase]);

  const handleProductClick = (productId: number) => {
    if (onProductSelect) {
      onProductSelect(productId);
    } else {
      // Redirection vers la page du produit
      window.location.href = `/?productId=${productId}`;
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="product-list-container">
      <div className="product-list-card">
        <div className="product-list-header">
          <h1 className="product-list-title">Liste des produits EcoScore</h1>
          {!loading && !error && (
            <div className="product-list-count">
              {products.length} produit{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {loading && (
          <div className="product-list-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <InfoAlert
            type="error"
            title="Erreur de chargement"
            onAction={handleRetry}
            actionLabel="Réessayer"
          >
            {error}
          </InfoAlert>
        )}

        {!loading && !error && products.length === 0 && (
          <InfoAlert type="info" title="Aucun produit trouvé">
            Aucun produit n'a été trouvé dans la base de données.
          </InfoAlert>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-list-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                score={product.score}
                grade={product.grade}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

