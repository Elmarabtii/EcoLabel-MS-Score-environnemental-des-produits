import "./Modal.css";

export interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
}

export function Modal({ children, onClose, maxWidth = 600 }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <button 
          className="modal-close" 
          onClick={onClose} 
          aria-label="Fermer"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

