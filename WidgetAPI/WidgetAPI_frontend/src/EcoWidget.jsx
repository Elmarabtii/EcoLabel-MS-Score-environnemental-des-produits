import { useEffect, useMemo, useState } from "react";

export default function EcoWidget({ productId, apiBase = "http://127.0.0.1:8005" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId === undefined || productId === null || productId === "") return;

    const ctrl = new AbortController();
    setErr("");
    setLoading(true);
    setData(null);

    fetch(`${apiBase}/public/product/${productId}`, { signal: ctrl.signal })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json?.detail || "API error");
        return json;
      })
      .then(setData)
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Impossible de charger le produit.");
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [productId, apiBase]);

  const s = useMemo(() => getScoreUI(data?.numeric_score), [data?.numeric_score]);
  const gradeUI = useMemo(() => getGradeUI(data?.grade), [data?.grade]);

  if (err) {
    return (
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={{ ...styles.alert, ...styles.alertError }}>
            <div style={styles.alertTitle}>Erreur</div>
            <div style={styles.alertText}>{err}</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={styles.skelRow}>
            <div style={styles.skelBlock(160)} />
            <div style={styles.skelCircle} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={styles.skelBlock(280)} />
            <div style={{ height: 10 }} />
            <div style={styles.skelBlock(240)} />
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={styles.skelChip} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const weights = data.details?.weights || {};
  const norm = data.details?.normalized_indicators || {};

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.kicker}>EcoScore • Product</div>
            <div style={styles.title}>Product #{data.product_id}</div>
            <div style={styles.subtle}>
              {data.created_at ? new Date(data.created_at).toLocaleString() : "—"}
            </div>
          </div>

          <div style={{ ...styles.gradeBadge, background: gradeUI.bg, borderColor: gradeUI.border }}>
            <div style={{ ...styles.gradeLetter, color: gradeUI.text }}>{data.grade ?? "—"}</div>
            <div style={{ ...styles.gradeLabel, color: gradeUI.textSoft }}>Grade</div>
          </div>
        </div>

        {/* Score line */}
        <div style={styles.scoreBlock}>
          <div style={styles.scoreTop}>
            <div style={styles.scoreValue}>
              {fmtNum(data.numeric_score)} <span style={styles.scoreOn}>/ 100</span>
            </div>
            <div style={styles.scoreMeta}>
              Confidence: <b>{fmtNum(data.confidence)}</b>
            </div>
          </div>

          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${s.pct}%`, background: s.color }} />
          </div>

          <div style={styles.scoreHint}>{s.label}</div>
        </div>

        {/* Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Détails</div>

          <div style={styles.grid2}>
            <InfoRow label="Packaging" value={data.details?.packaging_type ?? "—"} />
            <InfoRow label="Packaging penalty" value={fmtNum(data.details?.packaging_penalty)} />
            <InfoRow label="Data completeness" value={fmtNum(data.details?.data_completeness)} />
          </div>
        </div>

        {/* Chips */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Indicateurs</div>

          <div style={styles.chips}>
            <Chip label="Weight CO₂" value={fmtNum(weights.co2)} />
            <Chip label="Weight Water" value={fmtNum(weights.water)} />
            <Chip label="Weight Energy" value={fmtNum(weights.energy)} />
            <Chip label="Norm CO₂" value={fmtNum(norm.co2)} />
            <Chip label="Norm Water" value={fmtNum(norm.water)} />
            <Chip label="Norm Energy" value={fmtNum(norm.energy)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value ?? "—"}</div>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div style={styles.chip}>
      <div style={styles.chipLabel}>{label}</div>
      <div style={styles.chipValue}>{value ?? "—"}</div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function fmtNum(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  // 2 décimales max (pro)
  return n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function getScoreUI(score) {
  const n = Number(score);
  const safe = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  const pct = safe;

  if (safe >= 80) return { pct, color: "#16a34a", label: "Excellent" };
  if (safe >= 60) return { pct, color: "#22c55e", label: "Bon" };
  if (safe >= 40) return { pct, color: "#f59e0b", label: "Moyen" };
  return { pct, color: "#ef4444", label: "À améliorer" };
}

function getGradeUI(grade) {
  const g = String(grade || "").toUpperCase();

  // Palette douce + pro
  const map = {
    A: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", textSoft: "#047857" },
    B: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a", textSoft: "#1d4ed8" },
    C: { bg: "#f8fafc", border: "#e2e8f0", text: "#0f172a", textSoft: "#475569" },
    D: { bg: "#fff7ed", border: "#fed7aa", text: "#7c2d12", textSoft: "#c2410c" },
    E: { bg: "#fef2f2", border: "#fecaca", text: "#7f1d1d", textSoft: "#b91c1c" },
  };

  return map[g] || { bg: "#f8fafc", border: "#e2e8f0", text: "#0f172a", textSoft: "#475569" };
}

/* ---------- Styles ---------- */

const styles = {
  shell: {
    width: "min(520px, 100%)",
    padding: 14,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e6e8ee",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },

  kicker: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  title: { fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 },
  subtle: { fontSize: 12, color: "#64748b", marginTop: 4 },

  gradeBadge: {
    width: 86,
    minWidth: 86,
    height: 70,
    borderRadius: 14,
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  gradeLetter: { fontSize: 26, fontWeight: 900, lineHeight: 1 },
  gradeLabel: { fontSize: 11, fontWeight: 700, marginTop: 4 },

  scoreBlock: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #eef2f7",
    background: "#fbfcfe",
  },
  scoreTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  scoreValue: { fontSize: 22, fontWeight: 900, color: "#0f172a" },
  scoreOn: { fontSize: 13, fontWeight: 700, color: "#64748b", marginLeft: 6 },
  scoreMeta: { fontSize: 13, color: "#334155" },

  barTrack: {
    height: 10,
    borderRadius: 999,
    background: "#e9eef5",
    overflow: "hidden",
    marginTop: 10,
  },
  barFill: { height: "100%", borderRadius: 999 },
  scoreHint: { fontSize: 12, color: "#64748b", marginTop: 8, fontWeight: 600 },

  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: 900, color: "#0f172a", marginBottom: 10 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  infoRow: {
    border: "1px solid #eef2f7",
    background: "#ffffff",
    borderRadius: 12,
    padding: 10,
  },
  infoLabel: { fontSize: 12, color: "#64748b", fontWeight: 700 },
  infoValue: { fontSize: 13, color: "#0f172a", fontWeight: 800, marginTop: 4 },

  chips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    border: "1px solid #eef2f7",
    background: "#ffffff",
    borderRadius: 999,
    padding: "8px 10px",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  chipLabel: { fontSize: 12, color: "#64748b", fontWeight: 700 },
  chipValue: { fontSize: 12, color: "#0f172a", fontWeight: 900 },

  alert: { borderRadius: 14, padding: 12, border: "1px solid" },
  alertError: { background: "#fef2f2", borderColor: "#fecaca" },
  alertTitle: { fontWeight: 900, color: "#7f1d1d" },
  alertText: { marginTop: 4, color: "#991b1b", fontSize: 13 },

  // Skeleton
  skelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  skelCircle: {
    width: 70,
    height: 70,
    borderRadius: 16,
    background: "#eef2f7",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  skelBlock: (w) => ({
    width: w,
    height: 14,
    borderRadius: 10,
    background: "#eef2f7",
    animation: "pulse 1.2s ease-in-out infinite",
  }),
  skelChip: {
    width: 120,
    height: 34,
    borderRadius: 999,
    background: "#eef2f7",
    animation: "pulse 1.2s ease-in-out infinite",
  },
};
