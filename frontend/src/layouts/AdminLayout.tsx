import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { authApi } from "../services/authApi";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace(/^\/admin\/?/, "");
  const crumbs = ["admin", ...path.split("/").filter(Boolean)];
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${collapsed ? "72px" : "240px"} 1fr`,
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <aside
        style={{
          background: "#faf9f6",
          color: "#333",
          padding: 16,
          borderRight: "1px solid #e9ecef",
          transition: "width 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: 16,
          }}
        >
          {!collapsed && (
            <div style={{ fontWeight: 800 }}>
              <Link to="/" style={{ color: "#333", textDecoration: "none" }}>
                My Cinema Admin
              </Link>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 0 0 2px #d9d2b7";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              border: "none",
              background: "transparent",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "center",
              justifyContent: "center",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              style={{ width: "16px", height: "2px", background: "#666" }}
            ></div>
            <div
              style={{ width: "16px", height: "2px", background: "#666" }}
            ></div>
            <div
              style={{ width: "16px", height: "2px", background: "#666" }}
            ></div>
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #d9d2b7"
                : "3px solid transparent",
              background: isActive ? "#f5f3ef" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
            })}
          >
            <span aria-hidden>📊</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink
            to="/admin/genres"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #d9d2b7"
                : "3px solid transparent",
              background: isActive ? "#f5f3ef" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
            })}
          >
            <span aria-hidden>🏷️</span>
            {!collapsed && <span>Thể loại</span>}
          </NavLink>
          <NavLink
            to="/admin/theaters"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #d9d2b7"
                : "3px solid transparent",
              background: isActive ? "#f5f3ef" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
            })}
          >
            <span aria-hidden>🏢</span>
            {!collapsed && <span>Rạp</span>}
          </NavLink>
          <NavLink
            to="/admin/movies"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #d9d2b7"
                : "3px solid transparent",
              background: isActive ? "#f5f3ef" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
            })}
          >
            <span aria-hidden>🎞️</span>
            {!collapsed && <span>Movies</span>}
          </NavLink>
        </nav>
      </aside>
      <section style={{ background: "#f8f9fa", overflow: "hidden" }}>
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e9ecef",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 700, lineHeight: 1 }}>
              {(() => {
                const first = crumbs[1] || "";
                if (!first) return "Bảng điều khiển";
                switch (first) {
                  case "movies":
                    return "Quản lý phim";
                  case "genres":
                    return "Thể loại";
                  case "theaters":
                    return "Rạp";
                  default:
                    return "Bảng điều khiển";
                }
              })()}
            </div>
            <div style={{ fontSize: 12, color: "#8b7355", lineHeight: 1 }}>
              {(() => {
                const labels: Record<string, string> = {
                  admin: "Admin",
                  movies: "Phim",
                  genres: "Thể loại",
                  theaters: "Rạp",
                  create: "Tạo mới",
                  edit: "Chỉnh sửa",
                };
                const parts = crumbs.filter(Boolean);
                const acc: string[] = [];
                return (
                  <span>
                    {parts.map((seg, idx) => {
                      acc.push(seg);
                      const href = "/" + acc.join("/");
                      const label = labels[seg] || seg;
                      const isLast = idx === parts.length - 1;
                      return (
                        <span key={href}>
                          {isLast ? (
                            <span>{label}</span>
                          ) : (
                            <Link to={href.replace("/admin", "/admin")}>
                              {label}
                            </Link>
                          )}
                          {!isLast && <span> / </span>}
                        </span>
                      );
                    })}
                  </span>
                );
              })()}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleLogout}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                height: 36,
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <div
          style={{
            padding: "8px 16px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </div>
      </section>
    </div>
  );
}
