import { useMemo, useState } from "react";
import { EcoScoreData, fetchEcoScore } from "../services/ecoScoreApi";
import { fmtNum, getScoreUI, getGradeRange, formatPackagingType, getPackagingImpact } from "../utils/ecoScoreUtils";
import { Tooltip } from "./shared/Tooltip";
import { Modal } from "./shared/Modal";
import { MethodologyModal } from "./modals/MethodologyModal";
import { ComparisonModal } from "./modals/ComparisonModal";
import { PackagingAlternativesModal } from "./modals/PackagingAlternativesModal";
import { GradeBadge } from "./ui/GradeBadge";
import { ScoreBar } from "./ui/ScoreBar";
import { CategoryImpactCard } from "./ui/CategoryImpactCard";
import { InfoAlert } from "./ui/InfoAlert";
import { Breadcrumb } from "./ui/Breadcrumb";
import { generateEcoScorePDF } from "../utils/pdfGenerator";
import "./EcoScorePage.css";

export interface EcoScorePageProps {
  data: EcoScoreData;
  apiBase?: string;
  onModeChange?: (mode: "page" | "widget") => void;
}

export default function EcoScorePage({ data, apiBase = "http://127.0.0.1:8005", onModeChange }: EcoScorePageProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showPackagingAlternatives, setShowPackagingAlternatives] = useState(false);
  const [compareProductId, setCompareProductId] = useState("");
  const [compareData, setCompareData] = useState<EcoScoreData | null>(null);

  const s = useMemo(() => getScoreUI(data.numeric_score), [data.numeric_score]);
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

  const breadcrumbItems = [
    { label: "Liste des produits", onClick: () => window.location.href = "/" },
    { label: productName },
  ];

  return (
    <div className="ecoscore-page-container">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="ecoscore-page-card">
        {/* Mode switcher */}
        {onModeChange && (
          <div className="ecoscore-mode-switcher">
            <button
              onClick={() => onModeChange("page")}
              className="ecoscore-mode-button ecoscore-mode-button-active"
              aria-pressed={true}
            >
              Mode page
            </button>
            <button
              onClick={() => onModeChange("widget")}
              className="ecoscore-mode-button"
              aria-pressed={false}
            >
              Mode widget
            </button>
          </div>
        )}

        {/* Header */}
        <div className="ecoscore-header">
          <div className="ecoscore-header-left">
            <div className="ecoscore-kicker">
              EcoScore • Product
              <span className="ecoscore-kicker-sub">Score environnemental basé sur CO₂, Eau, Énergie</span>
            </div>
            <h1 className="ecoscore-title">{productName}</h1>
            <div className="ecoscore-product-info">
              <InfoBadge label="Marque" value={brand} />
              <InfoBadge label="Catégorie" value={category} />
              <InfoBadge label="Origine" value={origin} />
              {barcode !== "—" && <InfoBadge label="Code-barres" value={barcode} />}
            </div>
          </div>

          <div className="ecoscore-grade-container">
            <GradeBadge grade={data.grade} size="lg" showLabel />
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
              <button className="ecoscore-info-button" aria-label="Comment c'est calculé ?">
                ℹ️
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Score hero */}
        <div className="ecoscore-score-block">
          <div className="ecoscore-score-top">
            <div className="ecoscore-score-value">
              {fmtNum(data.numeric_score)} <span className="ecoscore-score-on">/ 100</span>
            </div>
            <div className="ecoscore-score-meta">
              <Tooltip content="Fiabilité liée à la complétude des données et stabilité du modèle">
                <span>
                  Confidence: <b>{fmtNum(data.confidence)}</b>
                </span>
              </Tooltip>
            </div>
          </div>

          <ScoreBar 
            score={data.numeric_score} 
            showLabels 
            showValue={false}
            height="md"
            animated
          />

          <div className="ecoscore-score-hint">
            <span style={{ fontWeight: 700 }}>{s.label}</span> • {s.description}
          </div>
        </div>

        {/* Résumé en 3 points */}
        {(strengths.length > 0 || improvements.length > 0 || advice.length > 0) && (
          <div className="ecoscore-section">
            <h2 className="ecoscore-section-title">Résumé en 3 points</h2>
            <div className="ecoscore-summary-grid">
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
        )}

        {/* Impact par catégorie */}
        <div className="ecoscore-section">
          <h2 className="ecoscore-section-title">Impact par catégorie</h2>
          <div className="ecoscore-impact-grid">
            <CategoryImpactCard 
              label="CO₂" 
              value={norm.co2} 
              weight={weights.co2}
              description="Émissions de gaz à effet de serre"
            />
            <CategoryImpactCard 
              label="Eau" 
              value={norm.water} 
              weight={weights.water}
              description="Consommation d'eau"
            />
            <CategoryImpactCard 
              label="Énergie" 
              value={norm.energy} 
              weight={weights.energy}
              description="Consommation énergétique"
            />
          </div>
        </div>

        {/* Pondérations */}
        <div className="ecoscore-section">
          <h2 className="ecoscore-section-title">Pondérations</h2>
          <div className="ecoscore-weights-card">
            <div className="ecoscore-weights-grid">
              <WeightChip label="CO₂" value={weights.co2} />
              <WeightChip label="Eau" value={weights.water} />
              <WeightChip label="Énergie" value={weights.energy} />
            </div>
            <div className="ecoscore-weights-note">
              Ces pondérations peuvent varier selon la catégorie produit (ex: alimentaire vs électronique).
            </div>
          </div>
        </div>

        {/* Packaging */}
        <div className="ecoscore-section">
          <h2 className="ecoscore-section-title">Emballage</h2>
          <InfoAlert
            type={data.details?.packaging_penalty && data.details.packaging_penalty > 0 ? "warning" : "info"}
            icon="📦"
            title={`Emballage : ${formatPackagingType(data.details?.packaging_type)}`}
            onAction={() => setShowPackagingAlternatives(true)}
            actionLabel="Voir alternatives"
          >
            <div>
              <div style={{ marginBottom: 4 }}>
                Impact: <strong>{getPackagingImpact(data.details?.packaging_type)}</strong>
              </div>
              {(data.details?.packaging_penalty || 0) > 0 && (
                <div>
                  Pénalité : <strong>-{fmtNum((data.details.packaging_penalty || 0) * 100)}%</strong> sur le score
                </div>
              )}
            </div>
          </InfoAlert>
        </div>

        {/* Traçabilité */}
        <div className="ecoscore-section">
          <div className="ecoscore-traceability">
            <div className="ecoscore-traceability-item">
              <span className="ecoscore-traceability-label">Dernière mise à jour :</span>
              <span className="ecoscore-traceability-value">
                {data.updated_at 
                  ? new Date(data.updated_at).toLocaleString("fr-FR")
                  : data.created_at 
                  ? new Date(data.created_at).toLocaleString("fr-FR")
                  : "—"}
              </span>
            </div>
            <div className="ecoscore-traceability-item">
              <span className="ecoscore-traceability-label">Source des données :</span>
              <span className="ecoscore-traceability-value">
                {data.data_source || "Base de données EcoScore"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ecoscore-actions-section">
          <button 
            onClick={() => setShowMethodology(true)}
            className="ecoscore-action-button"
            aria-label="Voir méthodologie"
          >
            📊 Méthodologie
          </button>
          <button 
            onClick={() => {
              setShowComparison(true);
              setCompareData(null);
            }}
            className="ecoscore-action-button"
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
            className="ecoscore-action-button"
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
            className="ecoscore-action-button"
            aria-label="Partager"
          >
            📤 Partager
          </button>
          <button 
            onClick={() => {
              try {
                generateEcoScorePDF(data);
              } catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                alert("Une erreur est survenue lors de la génération du PDF.");
              }
            }}
            className="ecoscore-action-button"
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

      {/* Modal Alternatives d'emballage */}
      {showPackagingAlternatives && (
        <Modal onClose={() => setShowPackagingAlternatives(false)} maxWidth={700}>
          <PackagingAlternativesModal data={data} />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Composants internes ---------- */

function InfoBadge({ label, value }: { label: string; value: string }) {
  if (value === "—" || !value) return null;
  return (
    <div className="ecoscore-info-badge">
      <span className="ecoscore-info-badge-label">{label}:</span>
      <span className="ecoscore-info-badge-value">{value}</span>
    </div>
  );
}

function SummaryCard({ type, title, items }: { type: "strength" | "improvement" | "advice"; title: string; items: string[] }) {
  const icons = {
    strength: "✅",
    improvement: "⚠️",
    advice: "📌"
  };
  const typeClasses = {
    strength: "ecoscore-summary-card-strength",
    improvement: "ecoscore-summary-card-improvement",
    advice: "ecoscore-summary-card-advice"
  };

  return (
    <div className={`ecoscore-summary-card ${typeClasses[type]}`}>
      <div className="ecoscore-summary-card-title">
        {icons[type]} {title}
      </div>
      <ul className="ecoscore-summary-card-list">
        {items.map((item, i) => (
          <li key={i} className="ecoscore-summary-card-item">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function WeightChip({ label, value }: { label: string; value?: number }) {
  return (
    <div className="ecoscore-weight-chip">
      <div className="ecoscore-weight-chip-label">{label}</div>
      <div className="ecoscore-weight-chip-value">{fmtNum(value)}</div>
    </div>
  );
}
