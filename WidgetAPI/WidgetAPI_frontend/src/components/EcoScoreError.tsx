import { EcoScoreCoreProps } from "./EcoScoreCore";

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
  if (error === "NOT_FOUND") {
    return (
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={styles.notFound}>
            <div style={styles.notFoundIcon}>📦</div>
            <div style={styles.notFoundTitle}>Produit introuvable</div>
            <div style={styles.notFoundText}>
              Le produit #{productId} n'existe pas dans notre base de données.
            </div>
            <button onClick={onRetry} style={styles.retryButton} className="ecowidget-button">
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={{ ...styles.alert, ...styles.alertError }}>
          <div style={styles.alertTitle}>Erreur</div>
          <div style={styles.alertText}>{error}</div>
          <button onClick={onRetry} style={styles.retryButton} className="ecowidget-button" aria-label="Réessayer">
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    width: "min(800px, 100%)",
    padding: 14,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e6e8ee",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  alert: {
    borderRadius: 14,
    padding: 16,
    border: "1px solid",
  },
  alertError: {
    background: "#fef2f2",
    borderColor: "#fecaca",
  },
  alertTitle: {
    fontWeight: 900,
    color: "#7f1d1d",
    fontSize: 16,
    marginBottom: 8,
  },
  alertText: {
    color: "#991b1b",
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 8,
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  notFound: {
    textAlign: "center" as const,
    padding: 40,
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
};

