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
      {!isSticky && (
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
              <a href="#" style={{ marginRight: 8, fontSize: "14px", color: "#4b5563", textDecoration: "none" }}>Hỗ trợ khách hàng</a>

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
      )}

      <header className={`main-header ${isSticky ? "sticky" : ""}`}>
        <div className="container">
          {!isSticky && (
            <div className="logo">
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
          )}

          <Navbar />
        </div>
      </header>
    </>
  );
}
