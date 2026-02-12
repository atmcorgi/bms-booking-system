import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  size?: number;
  editable?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUpload,
  size = 120,
  editable = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Avatar Circle */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid white",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          background: "white", // Ensure opaque background
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Profile Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FontAwesomeIcon
            icon={faUser}
            style={{ fontSize: size / 2.5, color: "#94a3b8" }}
          />
        )}
        
        {/* Loading Overlay */}
        {uploading && (
           <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0px", // Squared Overlay
            }}
          >
            <FontAwesomeIcon icon={faSpinner} spin style={{ color: "#3b82f6", fontSize: "24px" }} />
          </div>
        )}
      </div>

      {/* Upload Button (Camera Icon) */}
      {editable && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              width: "36px",
              height: "36px",
              borderRadius: "8px", 
              border: "1px solid #E50914",
              color: "#E50914",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
               if(!uploading) e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
               e.currentTarget.style.transform = "scale(1)";
            }}
            title="Update Avatar"
          >
            <FontAwesomeIcon icon={faCamera} style={{ fontSize: "14px" }} />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </>
      )}
    </div>
  );
};

export default AvatarUpload;
