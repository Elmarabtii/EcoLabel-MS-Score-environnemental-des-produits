import jsPDF from "jspdf";
import { EcoScoreData } from "../services/ecoScoreApi";
import { fmtNum, getGradeUI, getGradeRange, formatPackagingType, getPackagingImpact } from "./ecoScoreUtils";
import { getGradeColors, getScoreColor } from "../styles/theme";

/**
 * Génère un PDF professionnel avec les données EcoScore
 */
export function generateEcoScorePDF(data: EcoScoreData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Couleurs
  const primaryColor = [22, 163, 74]; // #16a34a
  const textColor = [15, 23, 42]; // #0f172a
  const grayColor = [100, 116, 139]; // #64748b
  const gradeColors = getGradeColors(data.grade);
  
  // Convertir les couleurs hex en RGB pour jsPDF
  const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  const gradeBgRgb = hexToRgb(gradeColors.bg);
  const gradeBorderRgb = hexToRgb(gradeColors.border);
  const gradeTextRgb = hexToRgb(gradeColors.text);

  // Fonction helper pour ajouter du texte
  const addText = (text: string, x: number, y: number, options: {
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    color?: number[];
    align?: "left" | "center" | "right";
  } = {}) => {
    const {
      fontSize = 12,
      fontWeight = "normal",
      color = textColor,
      align = "left",
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontWeight);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, { align });
  };

  // Fonction helper pour ajouter une ligne horizontale
  const addLine = (y: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Header avec logo/titre
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  addText("EcoScore", margin, 25, {
    fontSize: 24,
    fontWeight: "bold",
    color: [255, 255, 255],
  });

  addText("Rapport environnemental", margin, 33, {
    fontSize: 10,
    color: [255, 255, 255],
  });

  yPosition = 50;

  // Informations produit
  const productName = data.product_name || `Produit #${data.product_id}`;
  addText(productName, margin, yPosition, {
    fontSize: 20,
    fontWeight: "bold",
  });
  yPosition += 10;

  addText(`ID: ${data.product_id}`, margin, yPosition, {
    fontSize: 10,
    color: grayColor,
  });
  yPosition += 15;

  // Grade et Score
  const gradeBoxX = margin;
  const gradeBoxY = yPosition;
  const gradeBoxSize = 30;

  // Badge grade
  doc.setFillColor(gradeBgRgb[0], gradeBgRgb[1], gradeBgRgb[2]);
  doc.setDrawColor(gradeBorderRgb[0], gradeBorderRgb[1], gradeBorderRgb[2]);
  doc.setLineWidth(2);
  doc.roundedRect(gradeBoxX, gradeBoxY, gradeBoxSize, gradeBoxSize, 3, 3, "FD");

  addText(data.grade || "—", gradeBoxX + gradeBoxSize / 2, gradeBoxY + gradeBoxSize / 2 + 3, {
    fontSize: 24,
    fontWeight: "bold",
    color: gradeTextRgb,
    align: "center",
  });

  // Score
  const scoreX = gradeBoxX + gradeBoxSize + 15;
  addText("Score EcoScore", scoreX, gradeBoxY + 8, {
    fontSize: 10,
    color: grayColor,
  });

  const scoreValue = fmtNum(data.numeric_score);
  addText(`${scoreValue} / 100`, scoreX, gradeBoxY + 18, {
    fontSize: 28,
    fontWeight: "bold",
  });

  // Barre de progression
  const barY = gradeBoxY + gradeBoxSize + 10;
  const barWidth = contentWidth;
  const barHeight = 8;
  const scorePercentage = data.numeric_score / 100;
  const scoreColor = getScoreColor(data.numeric_score);

  // Fond de la barre
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin, barY, barWidth, barHeight, 4, 4, "F");

  // Remplissage de la barre
  const scoreColorRgb = hexToRgb(getScoreColor(data.numeric_score));
  doc.setFillColor(scoreColorRgb[0], scoreColorRgb[1], scoreColorRgb[2]);
  doc.roundedRect(margin, barY, barWidth * scorePercentage, barHeight, 4, 4, "F");

  yPosition = barY + barHeight + 20;

  // Informations détaillées
  addLine(yPosition);
  yPosition += 10;

  // Métadonnées produit
  const metadata = [
    { label: "Marque", value: data.brand || data.manufacturer || "—" },
    { label: "Catégorie", value: data.category || "—" },
    { label: "Origine", value: data.origin || data.country || "—" },
    { label: "Confidence", value: `${fmtNum(data.confidence)}` },
  ];

  metadata.forEach((item) => {
    if (item.value !== "—") {
      addText(`${item.label}:`, margin, yPosition, {
        fontSize: 10,
        color: grayColor,
      });
      addText(item.value, margin + 50, yPosition, {
        fontSize: 10,
        fontWeight: "bold",
      });
      yPosition += 7;
    }
  });

  yPosition += 5;
  addLine(yPosition);
  yPosition += 15;

  // Impact par catégorie
  addText("Impact par catégorie", margin, yPosition, {
    fontSize: 14,
    fontWeight: "bold",
  });
  yPosition += 10;

  const indicators = data.details?.normalized_indicators || {};
  const weights = data.details?.weights || {};

  const categories = [
    { label: "CO₂", value: indicators.co2, weight: weights.co2, desc: "Émissions de gaz à effet de serre" },
    { label: "Eau", value: indicators.water, weight: weights.water, desc: "Consommation d'eau" },
    { label: "Énergie", value: indicators.energy, weight: weights.energy, desc: "Consommation énergétique" },
  ];

  categories.forEach((cat) => {
    const value = cat.value || 0;
    const percentage = value * 100;
    const catColorRgb = hexToRgb(getScoreColor(percentage));

    addText(cat.label, margin, yPosition, {
      fontSize: 11,
      fontWeight: "bold",
    });

    addText(`${fmtNum(value)}`, margin + 30, yPosition, {
      fontSize: 11,
    });

    addText(`Pondération: ${fmtNum(cat.weight)}`, margin + 80, yPosition, {
      fontSize: 9,
      color: grayColor,
    });

    // Mini barre
    const miniBarY = yPosition + 3;
    const miniBarWidth = 40;
    const miniBarHeight = 4;

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin + 50, miniBarY, miniBarWidth, miniBarHeight, 2, 2, "F");

    doc.setFillColor(catColorRgb[0], catColorRgb[1], catColorRgb[2]);
    doc.roundedRect(margin + 50, miniBarY, miniBarWidth * value, miniBarHeight, 2, 2, "F");

    yPosition += 12;
  });

  yPosition += 5;
  addLine(yPosition);
  yPosition += 15;

  // Emballage
  addText("Emballage", margin, yPosition, {
    fontSize: 14,
    fontWeight: "bold",
  });
  yPosition += 10;

  const packagingType = formatPackagingType(data.details?.packaging_type);
  const packagingImpact = getPackagingImpact(data.details?.packaging_type);
  const packagingPenalty = data.details?.packaging_penalty || 0;

  addText(`Type: ${packagingType}`, margin, yPosition, {
    fontSize: 11,
  });
  yPosition += 7;

  addText(`Impact: ${packagingImpact}`, margin, yPosition, {
    fontSize: 11,
  });
  yPosition += 7;

  if (packagingPenalty > 0) {
    addText(`Pénalité: -${fmtNum(packagingPenalty * 100)}%`, margin, yPosition, {
      fontSize: 11,
      color: [239, 68, 68],
    });
    yPosition += 7;
  }

  yPosition += 5;
  addLine(yPosition);
  yPosition += 15;

  // Traçabilité
  addText("Traçabilité", margin, yPosition, {
    fontSize: 10,
    fontWeight: "bold",
    color: grayColor,
  });
  yPosition += 7;

  const updatedAt = data.updated_at 
    ? new Date(data.updated_at).toLocaleString("fr-FR")
    : data.created_at 
    ? new Date(data.created_at).toLocaleString("fr-FR")
    : "—";

  addText(`Dernière mise à jour: ${updatedAt}`, margin, yPosition, {
    fontSize: 9,
    color: grayColor,
  });
  yPosition += 7;

  addText(`Source: ${data.data_source || "Base de données EcoScore"}`, margin, yPosition, {
    fontSize: 9,
    color: grayColor,
  });

  // Footer
  const footerY = pageHeight - 20;
  addLine(footerY - 5);
  addText(`Généré le ${new Date().toLocaleString("fr-FR")}`, pageWidth / 2, footerY, {
    fontSize: 8,
    color: grayColor,
    align: "center",
  });

  // Télécharger le PDF
  const fileName = `EcoScore_${data.product_id}_${productName.replace(/[^a-z0-9]/gi, "_")}.pdf`;
  doc.save(fileName);
}

