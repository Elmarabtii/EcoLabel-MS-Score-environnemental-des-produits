import { EcoScoreCoreProps } from "./EcoScoreCore";

export function EcoScoreLoading({ mode }: { mode: EcoScoreCoreProps["mode"] }) {
  if (mode === "widget") {
    return (
      <div style={styles.widgetSkeleton}>
        <div style={styles.skelRow}>
          <div style={styles.skelCircle} />
          <div style={styles.skelBlock(100)} />
        </div>
      </div>
    );
  }

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
  widgetSkeleton: {
    width: "min(400px, 100%)",
    padding: 12,
    border: "1px solid #e6e8ee",
    borderRadius: 12,
    background: "#ffffff",
  },
  skelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  skelCircle: {
    width: 70,
    height: 70,
    borderRadius: 16,
    background: "#eef2f7",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  skelBlock: (w: number) => ({
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

