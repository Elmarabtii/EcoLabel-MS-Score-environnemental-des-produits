import { useMemo, useState } from "react";
import { EcoScoreData, fetchEcoScore } from "../services/ecoScoreApi";
import { fmtNum, getScoreUI, getGradeUI, getGradeRange, formatPackagingType, getPackagingImpact } from "../utils/ecoScoreUtils";
import { Tooltip } from "./shared/Tooltip";
import { Modal } from "./shared/Modal";
import { MethodologyModal } from "./modals/MethodologyModal";
import { ComparisonModal } from "./modals/ComparisonModal";
import "./EcoScorePage.css";

export interface EcoScorePageProps {
  data: EcoScoreData;
  apiBase?: string;
  onModeChange?: (mode: "page" | "widget") => void;
}

export default function EcoScorePage({ data, apiBase = "http://127.0.0.1:8005", onModeChange }: EcoScorePageProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareProductId, setCompareProductId] = useState("");
  const [compareData, setCompareData] = useState<EcoScoreData | null>(null);

  const s = useMemo(() => getScoreUI(data.numeric_score), [data.numeric_score]);
  const gradeUI = useMemo(() => getGradeUI(data.grade), [data.grade]);
  const gradeRange = useMemo(() => getGradeRange(data.grade), [data.grade]);

  const weights = data.details?.weights || {};
  const norm = data.details?.normalized_indicators || {};
  const productName = data.product_name || `Produit #${data.product_id}`;
  const brand = data.brand || data.manufacturer || "—";
  const category = data.category || "—";
  const origin = data.origin || data.country || "—";
  const barcode = data.barcode || data.ean || "—";

  // Calcul des points forts/faibles/conseils
  const strengths: string[] = [];
  const improvements: string[] = [];
  const advice: string[] = [];

  if (norm.co2 >= 0.8) strengths.push("Faible émission CO₂");
  else if (norm.co2 < 0.5) improvements.push("Émissions CO₂ élevées");
  
  if (norm.energy >= 0.8) strengths.push("Bonne efficacité énergétique");
  else if (norm.energy < 0.5) improvements.push("Consommation énergétique élevée");
  
  if (norm.water >= 0.8) strengths.push("Faible consommation d'eau");
  else if (norm.water < 0.5) improvements.push("Consommation d'eau élevée");

  if (data.details?.packaging_type === "paper" || data.details?.packaging_type === "cardboard") {
    advice.push("Emballage recyclable, bon choix !");
  } else if ((data.details?.packaging_penalty || 0) > 0.05) {
    advice.push("Préférer un emballage recyclé pour améliorer le score");
  }

  const handleCompare = async () => {
    if (!compareProductId) return;
    try {
      const result = await fetchEcoScore(compareProductId, apiBase);
      setCompareData(result);
    } catch {
      alert("Impossible de charger le produit à comparer.");
    }
  };

  return (
    <div style={styles.shell} className="ecowidget-shell">
      <div style={styles.card} className="ecowidget-card">
        {/* Mode switcher */}
        {onModeChange && (
          <div style={styles.modeSwitcher} className="ecowidget-mode-switcher">
            <button
              onClick={() => onModeChange("page")}
              style={{ ...styles.modeButton, ...styles.modeButtonActive }}
              aria-pressed={true}
            >
              Mode page
            </button>
            <button
              onClick={() => onModeChange("widget")}
              style={styles.modeButton}
              aria-pressed={false}
            >
              Mode widget
            </button>
          </div>
        )}

        {/* Header amélioré */}
        <div style={styles.header} className="ecowidget-header">
          <div style={styles.headerLeft}>
            <div style={styles.kicker}>
              EcoScore • Product
              <span style={styles.kickerSub}>Score environnemental basé sur CO₂, Eau, Énergie</span>
            </div>
            <div style={styles.title} className="ecowidget-title">{productName}</div>
            <div style={styles.productInfo} className="ecowidget-product-info">
              <InfoBadge label="Marque" value={brand} />
              <InfoBadge label="Catégorie" value={category} />
              <InfoBadge label="Origine" value={origin} />
              {barcode !== "—" && <InfoBadge label="Code-barres" value={barcode} />}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ ...styles.gradeBadge, background: gradeUI.bg, borderColor: gradeUI.border }}>
              <div style={{ ...styles.gradeLetter, color: gradeUI.text }}>{data.grade ?? "—"}</div>
              <div style={{ ...styles.gradeLabel, color: gradeUI.textSoft }}>Grade</div>
            </div>
            <Tooltip
              content={
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Plage de score : {gradeRange}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                    <div><strong>Pondérations :</strong></div>
                    <div>CO₂: {fmtNum(weights.co2)}</div>
                    <div>Eau: {fmtNum(weights.water)}</div>
                    <div>Énergie: {fmtNum(weights.energy)}</div>
                    <div style={{ marginTop: 8 }}>
                      <strong>Normalisation :</strong> Les valeurs sont normalisées entre 0 et 1.
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <strong>Pénalités :</strong> Emballage (-{fmtNum((data.details?.packaging_penalty || 0) * 100)}%)
                    </div>
                  </div>
                </div>
              }
            >
              <button style={styles.infoButton} aria-label="Comment c'est calculé ?">
                ℹ️
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Score hero */}
        <div style={styles.scoreBlock}>
          <div style={styles.scoreTop}>
            <div style={styles.scoreValue}>
              {fmtNum(data.numeric_score)} <span style={styles.scoreOn}>/ 100</span>
            </div>
            <div style={styles.scoreMeta}>
              <Tooltip content="Fiabilité liée à la complétude des données et stabilité du modèle">
                <span>
                  Confidence: <b>{fmtNum(data.confidence)}</b>
                </span>
              </Tooltip>
            </div>
          </div>

          <div style={styles.barTrack}>
            <div style={styles.barMarkers}>
              <div style={styles.barMarker}>0</div>
              <div style={styles.barMarker}>50</div>
              <div style={styles.barMarker}>85</div>
              <div style={styles.barMarker}>100</div>
            </div>
            <div style={styles.barFillContainer}>
              <div style={{ ...styles.barFill, width: `${s.pct}%`, background: s.color }} className="ecowidget-bar-fill" />
            </div>
          </div>

          <div style={styles.scoreHint}>
            <span style={{ fontWeight: 700 }}>{s.label}</span> • {s.description}
          </div>
        </div>

        {/* Résumé en 3 points */}
        <div style={styles.summarySection}>
          <div style={styles.sectionTitle}>Résumé en 3 points</div>
          <div style={styles.summaryGrid} className="ecowidget-summary-grid">
            {strengths.length > 0 && (
              <SummaryCard type="strength" title="Points forts" items={strengths} />
            )}
            {improvements.length > 0 && (
              <SummaryCard type="improvement" title="Points à améliorer" items={improvements} />
            )}
            {advice.length > 0 && (
              <SummaryCard type="advice" title="Conseil" items={advice} />
            )}
          </div>
        </div>

        {/* Impact par catégorie */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Impact par catégorie</div>
          <div style={styles.impactGrid} className="ecowidget-impact-grid">
            <ImpactCard 
              label="CO₂" 
              value={norm.co2} 
              weight={weights.co2}
              description="Émissions de gaz à effet de serre"
            />
            <ImpactCard 
              label="Eau" 
              value={norm.water} 
              weight={weights.water}
              description="Consommation d'eau"
            />
            <ImpactCard 
              label="Énergie" 
              value={norm.energy} 
              weight={weights.energy}
              description="Consommation énergétique"
            />
          </div>
        </div>

        {/* Pondérations */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Pondérations</div>
          <div style={styles.weightsCard}>
            <div style={styles.weightsGrid} className="ecowidget-weights-grid">
              <WeightRow label="Weight CO₂" value={weights.co2} />
              <WeightRow label="Weight Water" value={weights.water} />
              <WeightRow label="Weight Energy" value={weights.energy} />
            </div>
            <div style={styles.weightsNote}>
              Ces pondérations peuvent varier selon la catégorie produit (ex: alimentaire vs électronique).
            </div>
          </div>
        </div>

        {/* Packaging amélioré */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Emballage</div>
          <div style={styles.packagingCard} className="ecowidget-packaging-card">
            <div style={styles.packagingInfo}>
              <div style={styles.packagingType}>
                Emballage : <strong>{formatPackagingType(data.details?.packaging_type)}</strong>
                <span style={styles.packagingImpact}>
                  ({getPackagingImpact(data.details?.packaging_type)})
                </span>
              </div>
              {(data.details?.packaging_penalty || 0) > 0 && (
                <div style={styles.packagingPenalty}>
                  Pénalité : <strong>-{fmtNum((data.details.packaging_penalty || 0) * 100)}%</strong> sur le score
                </div>
              )}
            </div>
            <button 
              style={styles.alternativesButton}
              className="ecowidget-button"
              onClick={() => alert("Fonctionnalité à venir : alternatives d'emballage")}
              aria-label="Voir alternatives d'emballage"
            >
              Voir alternatives
            </button>
          </div>
        </div>

        {/* Traçabilité */}
        <div style={styles.section}>
          <div style={styles.traceability}>
            <div style={styles.traceabilityItem}>
              <span style={styles.traceabilityLabel}>Dernière mise à jour :</span>
              <span style={styles.traceabilityValue}>
                {data.updated_at 
                  ? new Date(data.updated_at).toLocaleString("fr-FR")
                  : data.created_at 
                  ? new Date(data.created_at).toLocaleString("fr-FR")
                  : "—"}
              </span>
            </div>
            <div style={styles.traceabilityItem}>
              <span style={styles.traceabilityLabel}>Source des données :</span>
              <span style={styles.traceabilityValue}>
                {data.data_source || "Base de données EcoScore"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actionsSection} className="ecowidget-actions-section">
          <button 
            onClick={() => setShowMethodology(true)}
            style={styles.actionButton}
            className="ecowidget-button ecowidget-action-button"
            aria-label="Voir méthodologie"
          >
            📊 Méthodologie
          </button>
          <button 
            onClick={() => {
              setShowComparison(true);
              setCompareData(null);
            }}
            style={styles.actionButton}
            className="ecowidget-button ecowidget-action-button"
            aria-label="Comparer avec un autre produit"
          >
            ⚖️ Comparer
          </button>
          <button 
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert("Lien copié dans le presse-papier !");
            }}
            style={styles.actionButton}
            className="ecowidget-button ecowidget-action-button"
            aria-label="Copier le lien"
          >
            🔗 Copier lien
          </button>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `EcoScore - ${productName}`,
                  text: `Score environnemental : ${data.grade} (${fmtNum(data.numeric_score)}/100)`,
                  url: window.location.href
                });
              } else {
                alert("Partage non disponible sur ce navigateur");
              }
            }}
            style={styles.actionButton}
            className="ecowidget-button ecowidget-action-button"
            aria-label="Partager"
          >
            📤 Partager
          </button>
          <button 
            onClick={() => {
              alert("Fonctionnalité export PDF à implémenter avec jsPDF");
            }}
            style={styles.actionButton}
            className="ecowidget-button ecowidget-action-button"
            aria-label="Télécharger PDF"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* Modal Méthodologie */}
      {showMethodology && (
        <Modal onClose={() => setShowMethodology(false)}>
          <MethodologyModal data={data} />
        </Modal>
      )}

      {/* Modal Comparaison */}
      {showComparison && (
        <Modal onClose={() => setShowComparison(false)}>
          <ComparisonModal
            product1={data}
            product2={compareData}
            compareProductId={compareProductId}
            setCompareProductId={setCompareProductId}
            onCompare={handleCompare}
            apiBase={apiBase}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Composants internes ---------- */

function InfoBadge({ label, value }: { label: string; value: string }) {
  if (value === "—" || !value) return null;
  return (
    <div style={styles.infoBadge}>
      <span style={styles.infoBadgeLabel}>{label}:</span>
      <span style={styles.infoBadgeValue}>{value}</span>
    </div>
  );
}

function SummaryCard({ type, title, items }: { type: "strength" | "improvement" | "advice"; title: string; items: string[] }) {
  const icons = {
    strength: "✅",
    improvement: "⚠️",
    advice: "📌"
  };
  const colors = {
    strength: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
    improvement: { bg: "#fff7ed", border: "#fed7aa", text: "#7c2d12" },
    advice: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a" }
  };
  const color = colors[type] || colors.advice;

  return (
    <div style={{ ...styles.summaryCard, background: color.bg, borderColor: color.border }}>
      <div style={{ ...styles.summaryCardTitle, color: color.text }}>
        {icons[type]} {title}
      </div>
      <ul style={styles.summaryCardList}>
        {items.map((item, i) => (
          <li key={i} style={{ ...styles.summaryCardItem, color: color.text }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ImpactCard({ label, value, weight, description }: { label: string; value?: number; weight?: number; description: string }) {
  const n = Number(value) || 0;
  const pct = Math.min(100, Math.max(0, n * 100));
  const quality = n >= 0.8 ? "Très bon" : n >= 0.6 ? "Bon" : n >= 0.4 ? "Moyen" : "Faible";
  const color = n >= 0.8 ? "#16a34a" : n >= 0.6 ? "#22c55e" : n >= 0.4 ? "#f59e0b" : "#ef4444";

  return (
    <div style={styles.impactCard}>
      <div style={styles.impactCardHeader}>
        <div style={styles.impactCardLabel}>{label}</div>
        <div style={styles.impactCardValue}>{fmtNum(n)}</div>
      </div>
      <div style={styles.impactBarTrack}>
        <div style={{ ...styles.impactBarFill, width: `${pct}%`, background: color }} className="ecowidget-impact-bar-fill" />
      </div>
      <div style={styles.impactCardMeta}>
        <span style={styles.impactQuality}>{quality}</span>
        <span style={styles.impactWeight}>Pondération: {fmtNum(weight)}</span>
      </div>
      <div style={styles.impactDescription}>{description}</div>
    </div>
  );
}

function WeightRow({ label, value }: { label: string; value?: number }) {
  return (
    <div style={styles.weightRow}>
      <div style={styles.weightLabel}>{label}</div>
      <div style={styles.weightValue}>{fmtNum(value)}</div>
    </div>
  );
}

/* ---------- Styles ---------- */

const styles = {
  shell: {
    width: "min(800px, 100%)",
    padding: 14,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e6e8ee",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  modeSwitcher: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    padding: 4,
    background: "#f1f5f9",
    borderRadius: 10,
  },
  modeButton: {
    flex: 1,
    padding: "8px 16px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    transition: "all 0.2s",
  },
  modeButtonActive: {
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  kicker: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  kickerSub: {
    fontSize: 11,
    fontWeight: 400,
    color: "#94a3b8",
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    marginTop: 6,
    marginBottom: 12,
  },
  productInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  infoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    background: "#f1f5f9",
    borderRadius: 6,
    fontSize: 12,
  },
  infoBadgeLabel: {
    color: "#64748b",
    fontWeight: 600,
  },
  infoBadgeValue: {
    color: "#0f172a",
    fontWeight: 700,
  },
  gradeBadge: {
    width: 86,
    minWidth: 86,
    height: 70,
    borderRadius: 14,
    border: "1px solid",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  },
  gradeLetter: {
    fontSize: 26,
    fontWeight: 900,
    lineHeight: 1,
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 4,
  },
  infoButton: {
    position: "absolute" as const,
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  scoreBlock: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    border: "1px solid #eef2f7",
    background: "#fbfcfe",
  },
  scoreTop: {
    display: "flex",
    alignItems: "baseline" as const,
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 900,
    color: "#0f172a",
  },
  scoreOn: {
    fontSize: 18,
    fontWeight: 700,
    color: "#64748b",
    marginLeft: 6,
  },
  scoreMeta: {
    fontSize: 13,
    color: "#334155",
    cursor: "help",
  },
  barTrack: {
    marginTop: 12,
  },
  barMarkers: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#94a3b8",
    marginBottom: 4,
  },
  barMarker: {
    fontWeight: 600,
  },
  barFillContainer: {
    height: 12,
    borderRadius: 999,
    background: "#e9eef5",
    overflow: "hidden",
    position: "relative" as const,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.3s ease",
  },
  scoreHint: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 10,
    fontWeight: 600,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 12,
  },
  summarySection: {
    marginTop: 24,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid",
  },
  summaryCardTitle: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 8,
  },
  summaryCardList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 12,
    lineHeight: 1.6,
  },
  summaryCardItem: {
    marginTop: 4,
  },
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  impactCard: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #eef2f7",
    background: "#ffffff",
  },
  impactCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  impactCardLabel: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },
  impactCardValue: {
    fontSize: 18,
    fontWeight: 900,
    color: "#0f172a",
  },
  impactBarTrack: {
    height: 8,
    borderRadius: 999,
    background: "#e9eef5",
    overflow: "hidden",
    marginBottom: 8,
  },
  impactBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.3s ease",
  },
  impactCardMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 6,
  },
  impactQuality: {
    fontWeight: 700,
    color: "#64748b",
  },
  impactWeight: {
    color: "#94a3b8",
  },
  impactDescription: {
    fontSize: 11,
    color: "#64748b",
    fontStyle: "italic",
  },
  weightsCard: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #eef2f7",
    background: "#fbfcfe",
  },
  weightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 12,
  },
  weightRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  weightLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },
  weightValue: {
    fontSize: 18,
    color: "#0f172a",
    fontWeight: 900,
  },
  weightsNote: {
    fontSize: 11,
    color: "#64748b",
    fontStyle: "italic",
    paddingTop: 12,
    borderTop: "1px solid #eef2f7",
  },
  packagingCard: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #eef2f7",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  packagingInfo: {
    flex: 1,
  },
  packagingType: {
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 6,
  },
  packagingImpact: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
  },
  packagingPenalty: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: 600,
  },
  alternativesButton: {
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    color: "#0f172a",
    transition: "all 0.2s",
  },
  traceability: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #eef2f7",
    background: "#fbfcfe",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  traceabilityItem: {
    display: "flex",
    gap: 8,
    fontSize: 12,
  },
  traceabilityLabel: {
    color: "#64748b",
    fontWeight: 700,
  },
  traceabilityValue: {
    color: "#0f172a",
    fontWeight: 600,
  },
  actionsSection: {
    marginTop: 24,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    padding: "10px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    transition: "all 0.2s",
  },
};

