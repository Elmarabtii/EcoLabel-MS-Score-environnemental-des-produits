/**
 * Design System - EcoScore
 * Palette cohérente, typographie, spacing, ombres, radius
 */

export const theme = {
  // Palette de couleurs
  colors: {
    // Neutres
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    // Couleur principale (vert éco)
    primary: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    // Grades A-E
    grade: {
      A: {
        bg: "#ecfdf5",
        border: "#a7f3d0",
        text: "#065f46",
        textSoft: "#047857",
        solid: "#16a34a",
      },
      B: {
        bg: "#dbeafe",
        border: "#93c5fd",
        text: "#1e3a8a",
        textSoft: "#1d4ed8",
        solid: "#3b82f6",
      },
      C: {
        bg: "#fef3c7",
        border: "#fde68a",
        text: "#78350f",
        textSoft: "#92400e",
        solid: "#f59e0b",
      },
      D: {
        bg: "#fff7ed",
        border: "#fed7aa",
        text: "#7c2d12",
        textSoft: "#c2410c",
        solid: "#f97316",
      },
      E: {
        bg: "#fef2f2",
        border: "#fecaca",
        text: "#7f1d1d",
        textSoft: "#b91c1c",
        solid: "#ef4444",
      },
    },
    // États
    success: "#16a34a",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Typographie
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem",  // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (8px grid)
  spacing: {
    0: "0",
    1: "0.25rem",  // 4px
    2: "0.5rem",   // 8px
    3: "0.75rem",  // 12px
    4: "1rem",     // 16px
    5: "1.25rem",  // 20px
    6: "1.5rem",   // 24px
    8: "2rem",     // 32px
    10: "2.5rem",  // 40px
    12: "3rem",    // 48px
    16: "4rem",    // 64px
    20: "5rem",    // 80px
  },

  // Border radius
  radius: {
    none: "0",
    sm: "0.375rem",   // 6px
    base: "0.5rem",   // 8px
    md: "0.75rem",    // 12px
    lg: "1rem",       // 16px
    xl: "1.5rem",     // 24px
    full: "9999px",
  },

  // Ombres
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },

  // Transitions
  transitions: {
    fast: "150ms ease",
    base: "200ms ease",
    slow: "300ms ease",
  },

  // Breakpoints (pour media queries)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },

  // Layout
  layout: {
    maxWidth: "1100px",
    containerPadding: "1.5rem", // 24px
  },
} as const;

// Helpers pour obtenir les couleurs de grade
export function getGradeColors(grade: string | undefined | null) {
  const g = String(grade || "").toUpperCase();
  return theme.colors.grade[g as keyof typeof theme.colors.grade] || theme.colors.grade.C;
}

// Helpers pour obtenir la couleur du score
export function getScoreColor(score: number): string {
  if (score >= 80) return theme.colors.grade.A.solid;
  if (score >= 60) return theme.colors.primary[500];
  if (score >= 40) return theme.colors.grade.C.solid;
  return theme.colors.grade.E.solid;
}

