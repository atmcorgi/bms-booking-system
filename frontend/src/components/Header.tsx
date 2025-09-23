import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../services/authApi";

export default function Header() {
  const navigate = useNavigate();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const { data: user } = useQuery({
    queryKey: ["auth/me"],
    queryFn: async () => (await authApi.me()).data,
    enabled: !!token,
    retry: 0,
  });

  // Notification bell removed from global header; lives in StaffLayout

  const handleLogout = () => {
    authApi.logout();
    navigate("/", { replace: true });
    // Reload to clear any cached data
    window.location.reload();
  };

  return (
    <>
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
            {token && user ? (
              <>
                <span>Xin chào, {user.username}</span>
                {user.roles.includes("ADMIN") && (
                  <Link to="/admin" style={{ marginLeft: 8 }}>
                    Admin Panel
                  </Link>
                )}
                {user.roles.includes("STAFF") && (
                  <Link to="/staff" style={{ marginLeft: 8 }}>
                    Staff Panel
                  </Link>
                )}
                {/* Notification bell moved to StaffLayout */}
                <button
                  onClick={handleLogout}
                  style={{
                    marginLeft: 8,
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Đăng ký</Link>
              </>
            )}
            <a href="#">Hỗ trợ khách hàng</a>
            <button className="language-btn">
              ENGLISH <span className="arrow-down">▼</span>
            </button>
          </div>
        </div>
      </div>

      <header className="main-header">
        <div className="container">
          <div className="logo">
            <Link to="/">
              <div className="logo-text">
                <div className="logo-circle"></div>
                <span>MY CINEMA</span>
              </div>
            </Link>
          </div>
          <Navbar />
        </div>
      </header>
    </>
  );
}
