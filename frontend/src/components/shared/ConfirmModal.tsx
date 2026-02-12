import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1002,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 8,
          width: 400,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>{title}</h3>
        <div style={{ marginBottom: 24 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {showCancel && (
            <button type="button" onClick={onClose} className="fd-btn-secondary">
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="fd-btn-danger"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
