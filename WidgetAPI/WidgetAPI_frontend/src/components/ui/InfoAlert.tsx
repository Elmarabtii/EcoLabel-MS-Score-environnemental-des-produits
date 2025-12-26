import "./InfoAlert.css";

export interface InfoAlertProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
  icon?: string;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * Composant d'alerte d'information avec icône et action optionnelle
 */
export function InfoAlert({
  type = "info",
  title,
  children,
  icon,
  className = "",
  onAction,
  actionLabel,
}: InfoAlertProps) {
  const typeClasses = {
    info: "info-alert-info",
    warning: "info-alert-warning",
    success: "info-alert-success",
    error: "info-alert-error",
  };

  const defaultIcons = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  return (
    <div className={`info-alert ${typeClasses[type]} ${className}`} role="alert">
      <div className="info-alert-content">
        <div className="info-alert-icon">
          {icon || defaultIcons[type]}
        </div>
        <div className="info-alert-body">
          {title && <div className="info-alert-title">{title}</div>}
          <div className="info-alert-message">{children}</div>
        </div>
      </div>
      {onAction && actionLabel && (
        <button
          className="info-alert-action"
          onClick={onAction}
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

