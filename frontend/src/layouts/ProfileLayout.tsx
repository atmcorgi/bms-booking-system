import React from "react";
import ProfileSidebar from "../components/profile/ProfileSidebar";
// Abstracting main layout dependencies. Profile layout focuses on inner structure. 
// Actually, Profile pages are usually standalone or wrapped in main layout.
// Let's assume ProfileLayout is the INNER layout (Sidebar + Content).

interface ProfileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  avatarSection?: React.ReactNode; // Optional header section
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  role,
  avatarSection
}) => {
  return (
    <div 
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Optional: Breadcrumbs or Page Title */}
      <h1 
        style={{ 
          fontSize: "28px", 
          fontWeight: "800", 
          color: "#2e2b29", // Brand Dark Brown
          marginBottom: "32px",
          letterSpacing: "-0.5px",
          textTransform: "uppercase"
        }}
      >
        My Account
      </h1>

      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "280px 1fr", 
          gap: "32px",
          alignItems: "start" 
        }}
      >
        {/* Left Sidebar */}
        <aside style={{ position: "sticky", top: "20px" }}>
           <ProfileSidebar 
             activeTab={activeTab} 
             onTabChange={onTabChange} 
             role={role} 
           />
        </aside>

        {/* Right Content */}
        <main 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "24px" 
          }}
        >
          {/* Avatar/Header Card if provided */}
          {avatarSection}

          {/* Main Content Card */}
          <div 
            style={{ 
              background: "white", 
              borderRadius: "0px", // Squared
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e5e7eb",
              borderTop: "3px solid #E50914", // Red accent top
              padding: "32px",
              minHeight: "400px" 
            }}
          >
           {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
