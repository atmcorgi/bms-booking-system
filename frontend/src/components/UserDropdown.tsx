import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faCog, faFilm, faAddressCard } from "@fortawesome/free-solid-svg-icons";

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
}

export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
       }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine Profile Link based on Role (though we have role based redirects, explicit links are safe)
  let profileLink = "/profile";
  if (user?.roles?.includes("ADMIN")) profileLink = "/admin/profile";
  else if (user?.roles?.includes("STAFF")) profileLink = "/staff/profile";

  // Initials logic
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 0) return "U";
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };
  
  const displayName = user.fullName || user.username || "User";

  return (
     <div className="user-dropdown" ref={dropdownRef} style={{ position: "relative", marginLeft: "12px" }}>
        <button 
           onClick={() => setIsOpen(!isOpen)}
           style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px 4px 4px",
              borderRadius: "20px",
              transition: "background 0.2s"
           }}
           onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
           onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
           {/* Avatar Circle */}
           <div style={{
              width: "22px", // Reduced to 22px as requested
              height: "22px",
              borderRadius: "50%",
              background: user.avatar ? "transparent" : "#E50914",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "600",
              overflow: "hidden",
              border: "1px solid #8b7355", // Cinema Gold/Brown border for elegance
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
           }}>
              {user.avatar ? (
                 <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                 getInitials(displayName)
              )}
           </div>
           
           {/* Show username next to avatar for better UX */}
           <span style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563" }}>
              {user.username}
           </span>
        </button>

        {isOpen && (
           <div 
             style={{
                position: "absolute",
                top: "calc(100% + 8px)", 
                right: 0,
                width: "240px",
                background: "white",
                borderRadius: "0px",
                // Removed borderTop as we have a colored header now
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e5e7eb",
                zIndex: 1000,
                overflow: "hidden",
                padding: "0",
                textAlign: "left"
             }}
           >
              {/* Header inside dropdown */}
              <div style={{ padding: "16px", background: "#D4CBB0", marginBottom: "0" }}>
                 <p style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#2e2b29", fontSize: "15px" }}>{displayName}</p>
                 <p style={{ margin: 0, fontSize: "12px", color: "#4b443c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Link 
                  to={profileLink} 
                  onClick={() => setIsOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#334155", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#E50914"; e.currentTarget.style.background = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "transparent"; }}
                >
                  <FontAwesomeIcon icon={faAddressCard} style={{ width: "16px" }}/> My Profile
                </Link>
                
                {(user.roles?.includes("ADMIN")) && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#334155", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#E50914"; e.currentTarget.style.background = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "transparent"; }}
                  >
                      <FontAwesomeIcon icon={faCog} style={{ width: "16px" }}/> Admin Dashboard
                  </Link>
                )}

                {(user.roles?.includes("STAFF")) && (
                  <Link 
                    to="/staff" 
                    onClick={() => setIsOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none", color: "#334155", fontSize: "14px", fontWeight: "500", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#E50914"; e.currentTarget.style.background = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#334155"; e.currentTarget.style.background = "transparent"; }}
                  >
                      <FontAwesomeIcon icon={faFilm} style={{ width: "16px" }}/> Staff Dashboard
                  </Link>
                )}
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb" }}></div>

              <button 
                 onClick={() => { onLogout(); setIsOpen(false); }}
                 style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "14px", textAlign: "left", fontWeight: "500" }}
                 onMouseEnter={(e) => { e.currentTarget.style.color = "#E50914"; }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
              >
                 <FontAwesomeIcon icon={faSignOutAlt} style={{ width: "16px" }}/> Sign Out
              </button>
           </div>
        )}
     </div>
  );
}
