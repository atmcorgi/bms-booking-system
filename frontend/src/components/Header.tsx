import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import UserDropdown from "./UserDropdown";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";
import { profileApi } from "../services/profileApi";

export default function Header({ isSticky }: { isSticky: boolean }) {
  const navigate = useNavigate();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await profileApi.getProfile()).data,
    enabled: !!token,
    retry: 1,
  });

  const handleLogout = () => {
    authApi.logout();
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <>
      <style>{`
        .top-header-wrapper {
          max-height: 80px;
          opacity: 1;
          overflow: visible; /* Allow User Dropdown menu to bleed out */
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out;
        }
        .top-header-wrapper.hidden {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .logo-wrapper {
          max-height: 150px;
          opacity: 1;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out, margin 0.4s ease;
        }
        .logo-wrapper.hidden {
          max-height: 0;
          opacity: 0;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 0;
          padding-bottom: 0;
          pointer-events: none;
        }

        .main-header {
          transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease;
        }
        .main-header.sticky {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          /* Removed jumpy slideDown animation to allow native smooth transitions */
          backdrop-filter: blur(12px);
          background-color: rgba(255, 255, 255, 0.95);
          padding-top: 10px;
          padding-bottom: 10px;
          animation: none;
        }
      `}</style>
      
      <div className={`top-header-wrapper ${isSticky ? "hidden" : ""}`}>
        <div className="top-header">
          <div className="container">
            <div className="top-header-left">
              <a href="#" className="app-link">
                <span className="app-icon">📱</span>
                My Cinema APP
              </a>
              <a href="#" className="facebook-link">
                <span className="facebook-icon">f</span>
                My Cinema Facebook
              </a>
            </div>
            <div
              className="top-header-right"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <Link to="/contact" style={{ marginRight: 8, fontSize: "14px", color: "#4b5563", textDecoration: "none" }}>Hỗ trợ khách hàng</Link>

              {token && user ? (
                <UserDropdown user={user} onLogout={handleLogout} />
              ) : (
                <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
                  <Link to="/login" className="auth-link">Đăng nhập</Link>
                  <Link to="/register" className="auth-link">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className={`main-header ${isSticky ? "sticky" : ""}`}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          <div className={`logo-wrapper ${isSticky ? "hidden" : ""}`}>
            <div className="logo" style={{ margin: "20px auto 10px auto" }}>
              <Link to="/">
                <div className="logo-text">
                  <div className="logo-circle-wrap">
                    <div className="logo-circle" />
                    <div className="logo-circle-shadow" />
                  </div>
                  <span className="logo-name">
                    {"MY CINEMA".split("").map((ch, i) => (
                      <span
                        key={i}
                        className="logo-letter"
                        style={{
                          animationDelay: `${0.35 + i * 0.06}s`,
                          marginRight: ch === " " ? "0.35em" : undefined,
                        }}
                      >
                        {ch === " " ? "\u00A0" : ch}
                      </span>
                    ))}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <Navbar />
        </div>
      </header>
    </>
  );
}
