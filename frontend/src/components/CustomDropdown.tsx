import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: DropdownOption[];
  placeholder?: string;
  width?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  width = "auto",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          height: "36px",
          padding: "0 36px 0 12px",
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          fontSize: "14px",
          background: "#fff",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.2s",
          outline: "none",
          color: selectedOption ? "#1f2937" : "#9ca3af",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#cbd5e1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#dee2e6";
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            zIndex: 1000,
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: isSelected ? "#6366f1" : "#1f2937",
                  background: isSelected ? "#f0f4ff" : "#fff",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    style={{ fontSize: "12px", color: "#6366f1" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

