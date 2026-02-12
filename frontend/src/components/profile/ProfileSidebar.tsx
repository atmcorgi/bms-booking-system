import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShieldAlt,
  faHistory,
  faFilm,
} from "@fortawesome/free-solid-svg-icons";

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeTab,
  onTabChange,
  role,
}) => {
  const menuItems = [
    {
      id: "general",
      label: "General Info",
      icon: faUser,
      roles: ["ADMIN", "STAFF", "CUSTOMER"],
    },
    {
      id: "security",
      label: "Security",
      icon: faShieldAlt,
      roles: ["ADMIN", "STAFF", "CUSTOMER"],
    },
    {
      id: "bookings",
      label: "Booking History",
      icon: faHistory,
      roles: ["CUSTOMER"],
    },
        {
      id: "assignments",
      label: "Assignments",
      icon: faFilm,
      roles: ["STAFF"],
    },
    // Future expansion: Notifications, etc.
  ];

  return (
    <div
      style={{
        background: "white",
        borderRadius: "0px", // Squared
        padding: "24px",
        height: "fit-content",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e5e7eb",
        borderTop: "3px solid #8b7355", // Gold accent for sidebar
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "700",
          color: "#1e293b",
          paddingBottom: "16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        Settings
      </h3>
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "0px", // Squared
                  marginBottom: "4px",
                  border: "none",
                  borderLeft: isActive ? "4px solid #E50914" : "4px solid transparent", // Red Left Border Indicator
                  background: isActive ? "#fffcf5" : "transparent", // Light Beige active
                  color: isActive ? "#E50914" : "#64748b",
                  fontSize: "15px",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#fffcf5";
                    e.currentTarget.style.color = "#E50914";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748b";
                  }
                }}
              >
                <div
                  style={{
                    width: "20px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                {item.label}
              </button>
            );
          })}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
