import { useState } from "react";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div style={styles.tooltip} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
}

const styles = {
  tooltip: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    marginTop: 8,
    padding: 12,
    background: "#1e293b",
    color: "#ffffff",
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.6,
    zIndex: 1000,
    minWidth: 250,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
};

