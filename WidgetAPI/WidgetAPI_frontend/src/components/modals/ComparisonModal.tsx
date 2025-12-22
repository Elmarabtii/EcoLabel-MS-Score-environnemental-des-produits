import { useEffect, useState } from "react";
import { EcoScoreData, fetchProductList, ProductListItem } from "../../services/ecoScoreApi";
import { fmtNum } from "../../utils/ecoScoreUtils";

export interface ComparisonModalProps {
  product1: EcoScoreData;
  product2: EcoScoreData | null;
  compareProductId: string;
  setCompareProductId: (id: string) => void;
  onCompare: () => void;
  apiBase?: string;
}

export function ComparisonModal({
  product1,
  product2,
  compareProductId,
  setCompareProductId,
  onCompare,
  apiBase = "http://127.0.0.1:8005",
}: ComparisonModalProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // Charger la liste des produits au montage du composant
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const productList = await fetchProductList(apiBase);
        // Filtrer le produit actuel de la liste
        const filteredProducts = productList.filter(
          (p) => p.id !== product1.product_id
        );
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [product1.product_id, apiBase]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompareProductId(e.target.value);
  };

  return (
    <div style={styles.modalBody}>
      <h2 style={styles.modalTitle}>Comparer deux produits</h2>
      
      {loadingProducts && (
        <div style={styles.loadingMessage}>
          Chargement des produits disponibles... ({products.length} trouvé{products.length !== 1 ? 's' : ''})
        </div>
      )}
      
      <div style={styles.comparisonInput}>
        <select
          value={compareProductId}
          onChange={handleProductChange}
          style={{
            ...styles.comparisonSelect,
            ...(loadingProducts ? styles.comparisonSelectDisabled : {}),
          }}
          disabled={loadingProducts}
        >
          <option value="">
            {loadingProducts 
              ? `Chargement... (${products.length} produit${products.length !== 1 ? 's' : ''} trouvé${products.length !== 1 ? 's' : ''})` 
              : products.length === 0 
                ? "Aucun produit disponible" 
                : "Sélectionner un produit"}
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name || `Produit #${product.id}`}
              {product.grade && ` (${product.grade} - ${fmtNum(product.score)}/100)`}
            </option>
          ))}
        </select>
        <button 
          onClick={onCompare} 
          style={{
            ...styles.comparisonButton,
            ...((!compareProductId || loadingProducts) ? styles.comparisonButtonDisabled : {}),
          }}
          className="ecowidget-button"
          disabled={!compareProductId || loadingProducts}
        >
          Comparer
        </button>
      </div>

      {product2 && (
        <div style={styles.comparisonGrid} className="ecowidget-comparison-grid">
          <div style={styles.comparisonColumn}>
            <h3 style={styles.comparisonTitle}>Produit 1</h3>
            <div style={styles.comparisonScore}>
              <div style={styles.comparisonGrade}>{product1.grade}</div>
              <div style={styles.comparisonNumeric}>{fmtNum(product1.numeric_score)}/100</div>
            </div>
            <div style={styles.comparisonDetails}>
              <div>CO₂: {fmtNum(product1.details?.normalized_indicators?.co2)}</div>
              <div>Eau: {fmtNum(product1.details?.normalized_indicators?.water)}</div>
              <div>Énergie: {fmtNum(product1.details?.normalized_indicators?.energy)}</div>
            </div>
          </div>
          <div style={styles.comparisonColumn}>
            <h3 style={styles.comparisonTitle}>Produit 2</h3>
            <div style={styles.comparisonScore}>
              <div style={styles.comparisonGrade}>{product2.grade}</div>
              <div style={styles.comparisonNumeric}>{fmtNum(product2.numeric_score)}/100</div>
            </div>
            <div style={styles.comparisonDetails}>
              <div>CO₂: {fmtNum(product2.details?.normalized_indicators?.co2)}</div>
              <div>Eau: {fmtNum(product2.details?.normalized_indicators?.water)}</div>
              <div>Énergie: {fmtNum(product2.details?.normalized_indicators?.energy)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  modalBody: {
    paddingRight: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 24,
  },
  loadingMessage: {
    padding: "12px",
    marginBottom: "16px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    fontSize: 13,
    color: "#1e3a8a",
    textAlign: "center" as const,
  },
  comparisonInput: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
  },
  comparisonSelect: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    background: "#ffffff",
    cursor: "pointer",
    color: "#0f172a",
  },
  comparisonSelectDisabled: {
    background: "#f1f5f9",
    cursor: "not-allowed",
    color: "#94a3b8",
  },
  comparisonButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  comparisonButtonDisabled: {
    background: "#94a3b8",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  comparisonColumn: {
    padding: 16,
    border: "1px solid #eef2f7",
    borderRadius: 12,
    background: "#fbfcfe",
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 12,
  },
  comparisonScore: {
    textAlign: "center" as const,
    marginBottom: 16,
  },
  comparisonGrade: {
    fontSize: 48,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 4,
  },
  comparisonNumeric: {
    fontSize: 20,
    fontWeight: 800,
    color: "#64748b",
  },
  comparisonDetails: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 1.8,
  },
};

