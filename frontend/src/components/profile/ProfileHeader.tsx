import React from "react";
import AvatarUpload from "./AvatarUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useBackground } from "../../contexts/BackgroundContext";
import BackgroundSelector from "../common/BackgroundSelector";

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  avatar?: string;
  roleLabel: string;
  isVerified: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  gradient?: string; // Custom gradient for different roles
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  fullName,
  email,
  avatar,
  roleLabel,
  isVerified,
  onAvatarUpload,
  gradient = "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)", // Default Blue
}) => {
  const { currentBackground } = useBackground();

  return (
    <div
      style={{
        background: "white",
        borderRadius: "0px", // Squared
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {/* Cover Area */}
      <div
        style={{
          background: currentBackground ? `url(${currentBackground}) center/cover no-repeat` : gradient,
          height: "140px",
          position: "relative",
          transition: "background 0.3s ease"
        }}
      >
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 20 }}>
          <BackgroundSelector />
        </div>
      </div>

      {/* Info Area */}
      <div
        style={{
          padding: "0 32px 32px",
          marginTop: "-60px", // Pull up content
          display: "flex",
          alignItems: "flex-end",
          gap: "24px",
          flexWrap: "wrap",
          position: "relative", // Ensure z-index works
          zIndex: 10
        }}
      >
        <AvatarUpload
          currentAvatar={avatar}
          onUpload={onAvatarUpload}
          size={120}
        />

        <div style={{ flex: 1, paddingBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
             <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0, color: "darkslategray", textShadow: "2px 2px 0px #ffffff" }}>
                {fullName || "User"}
             </h2>
             {isVerified && (
               <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#3b82f6", fontSize: "20px" }} title="Email Verified"/>
             )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#64748b" }}>
            <span style={{ fontSize: "15px" }}>{email}</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#cbd5e1"}}></span>
            <span 
                style={{ 
                  background: "#fff1f2", // Light Red bg 
                  padding: "4px 10px", 
                  borderRadius: "0px", // Squared
                  fontSize: "12px", 
                  fontWeight: "700",
                  color: "#e11d48", // Red text
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  border: "1px solid #fecdd3"
               }}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

