export interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({ children, onClose }: ModalProps) {
  return (
    <div style={styles.modalOverlay} className="ecowidget-modal-overlay" onClick={onClose}>
      <div style={styles.modalContent} className="ecowidget-modal-content" onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} className="ecowidget-button" onClick={onClose} aria-label="Fermer">×</button>
        {children}
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalContent: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    maxWidth: 600,
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto" as const,
    position: "relative" as const,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalClose: {
    position: "absolute" as const,
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    border: "none",
    background: "#f1f5f9",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 24,
    lineHeight: 1,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

