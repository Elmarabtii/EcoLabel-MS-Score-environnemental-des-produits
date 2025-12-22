import { useEffect, useState } from "react";
import { fetchProductList, ProductListItem } from "../services/ecoScoreApi";
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

  const getGradeColor = (grade?: string) => {
    const g = String(grade || "").toUpperCase();
    const colors: Record<string, string> = {
      A: "#16a34a",
      B: "#22c55e",
      C: "#f59e0b",
      D: "#ef4444",
      E: "#dc2626",
    };
    return colors[g] || "#64748b";
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Liste des produits EcoScore</h1>
          <div style={styles.loading}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Chargement des produits... ({products.length} trouvé{products.length !== 1 ? "s" : ""})</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Liste des produits EcoScore</h1>
          <div style={styles.error}>
            <p>❌ {error}</p>
            <button onClick={() => window.location.reload()} style={styles.retryButton}>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Liste des produits EcoScore</h1>
          <div style={styles.count}>
            {products.length} produit{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""}
          </div>
        </div>

        {products.length === 0 ? (
          <div style={styles.empty}>
            <p>📦 Aucun produit trouvé dans la base de données.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product) => (
              <div
                key={product.id}
                style={styles.productCard}
                onClick={() => handleProductClick(product.id)}
                className="product-card"
              >
                <div style={styles.productHeader}>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>
                      {product.name || `Produit #${product.id}`}
                    </h3>
                    <div style={styles.productId}>ID: {product.id}</div>
                  </div>
                  {product.grade && (
                    <div
                      style={{
                        ...styles.gradeBadge,
                        background: getGradeColor(product.grade) + "20",
                        borderColor: getGradeColor(product.grade),
                        color: getGradeColor(product.grade),
                      }}
                    >
                      <div style={styles.gradeLetter}>{product.grade}</div>
                    </div>
                  )}
                </div>
                {product.score !== undefined && (
                  <div style={styles.scoreSection}>
                    <div style={styles.scoreValue}>
                      {product.score.toFixed(1)} / 100
                    </div>
                    <div style={styles.scoreBar}>
                      <div
                        style={{
                          ...styles.scoreBarFill,
                          width: `${Math.min(100, Math.max(0, product.score))}%`,
                          background: getGradeColor(product.grade),
                        }}
                      />
                    </div>
                  </div>
                )}
                <div style={styles.productFooter}>
                  <span style={styles.viewDetails}>Voir les détails →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    background: "#f8fafc",
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  },
  card: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
  },
  count: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 600,
  },
  loading: {
    textAlign: "center" as const,
    padding: "60px 20px",
  },
  loadingSpinner: {
    fontSize: 48,
    marginBottom: 16,
  },
  error: {
    textAlign: "center" as const,
    padding: "40px 20px",
    color: "#ef4444",
  },
  retryButton: {
    marginTop: 16,
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  empty: {
    textAlign: "center" as const,
    padding: "60px 20px",
    color: "#64748b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  productCard: {
    border: "1px solid #e6e8ee",
    borderRadius: 12,
    padding: 16,
    background: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  productHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  productId: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
  },
  gradeBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  gradeLetter: {
    fontSize: 24,
    fontWeight: 900,
  },
  scoreSection: {
    marginTop: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    borderRadius: 999,
    background: "#e9eef5",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.3s ease",
  },
  productFooter: {
    marginTop: "auto",
    paddingTop: 8,
    borderTop: "1px solid #eef2f7",
  },
  viewDetails: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 600,
  },
};

