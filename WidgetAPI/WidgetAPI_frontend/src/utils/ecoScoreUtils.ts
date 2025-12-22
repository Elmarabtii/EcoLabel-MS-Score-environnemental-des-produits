/**
 * Fonctions utilitaires pour EcoScore
 * Utilisées par les composants Page et Widget
 */

export function fmtNum(v: any): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export interface ScoreUI {
  pct: number;
  color: string;
  label: string;
  description: string;
}

export function getScoreUI(score: any): ScoreUI {
  const n = Number(score);
  const safe = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  const pct = safe;

  if (safe >= 80) return { pct, color: "#16a34a", label: "Excellent", description: "Performance environnementale remarquable" };
  if (safe >= 60) return { pct, color: "#22c55e", label: "Bon", description: "Performance environnementale satisfaisante" };
  if (safe >= 40) return { pct, color: "#f59e0b", label: "Moyen", description: "Performance environnementale à améliorer" };
  return { pct, color: "#ef4444", label: "Faible", description: "Performance environnementale insuffisante" };
}

export interface GradeUI {
  bg: string;
  border: string;
  text: string;
  textSoft: string;
}

export function getGradeUI(grade: any): GradeUI {
  const g = String(grade || "").toUpperCase();
  const map: Record<string, GradeUI> = {
    A: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", textSoft: "#047857" },
    B: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a", textSoft: "#1d4ed8" },
    C: { bg: "#f8fafc", border: "#e2e8f0", text: "#0f172a", textSoft: "#475569" },
    D: { bg: "#fff7ed", border: "#fed7aa", text: "#7c2d12", textSoft: "#c2410c" },
    E: { bg: "#fef2f2", border: "#fecaca", text: "#7f1d1d", textSoft: "#b91c1c" },
  };
  return map[g] || { bg: "#f8fafc", border: "#e2e8f0", text: "#0f172a", textSoft: "#475569" };
}

export function getGradeRange(grade: any): string {
  const g = String(grade || "").toUpperCase();
  const map: Record<string, string> = {
    A: "85-100",
    B: "70-84",
    C: "55-69",
    D: "40-54",
    E: "0-39"
  };
  return map[g] || "—";
}

export function formatPackagingType(type: any): string {
  const map: Record<string, string> = {
    paper: "Papier",
    cardboard: "Carton",
    plastic: "Plastique",
    glass: "Verre",
    metal: "Métal",
    mixed: "Mixte"
  };
  return map[String(type || "").toLowerCase()] || String(type || "—");
}

export function getPackagingImpact(type: any): string {
  const map: Record<string, string> = {
    paper: "faible impact",
    cardboard: "faible impact",
    glass: "impact moyen",
    metal: "impact moyen",
    plastic: "impact élevé",
    mixed: "impact variable"
  };
  return map[String(type || "").toLowerCase()] || "—";
}

