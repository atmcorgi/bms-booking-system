import React from "react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
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
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "20px",
            fontWeight: "600",
            color: "#1f2937",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#6366f1";
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;

