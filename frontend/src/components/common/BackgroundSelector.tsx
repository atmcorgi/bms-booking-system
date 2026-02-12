import { useState, useRef, useEffect } from "react";
import { useBackground } from "../../contexts/BackgroundContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export default function BackgroundSelector() {
  const { currentBackground, setBackground, availableBackgrounds } =
    useBackground();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="background-selector" style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          border: "none",
          borderRadius: "8px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          color: "#fff",
          backdropFilter: "blur(4px)",
          transition: "all 0.2s",
          fontSize: "13px",
          fontWeight: 600
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
        }}
        title="Đổi ảnh bìa"
      >
        <FontAwesomeIcon icon={faImage} />
        <span>Đổi ảnh bìa</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50px",
            background: "#fff",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            width: "280px",
            zIndex: 1000,
          }}
        >
          <h4
            style={{
              marginTop: 0,
              marginBottom: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Chọn hình nền
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            {availableBackgrounds.map((bg, index) => (
              <div
                key={index}
                onClick={() => {
                  setBackground(bg);
                  setIsOpen(false);
                }}
                style={{
                  height: "80px",
                  borderRadius: "8px",
                  backgroundImage: `url(${bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  border:
                    currentBackground === bg
                      ? "3px solid #6366f1"
                      : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
