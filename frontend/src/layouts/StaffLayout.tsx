import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { authApi } from "../services/authApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffNotificationApi } from "../services/staffNotificationApi";
import { profileApi } from "../services/profileApi";
import UserDropdown from "../components/UserDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faCalendarAlt,
  faFilm,
  faClock,
  faCashRegister,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace(/^\/staff\/?/, "");
  const crumbs = ["staff", ...path.split("/").filter(Boolean)];
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    navigate("/", { replace: true });
    window.location.reload();
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const qc = useQueryClient();
  const notifQ = useQuery({
    queryKey: ["staff-notif-list"],
    queryFn: async () => (await staffNotificationApi.list()).data,
    enabled: !!token,
    refetchInterval: 30000,
  });

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await profileApi.getProfile()).data,
    enabled: !!token,
  });

  const markAllMut = useMutation({
    mutationFn: () => staffNotificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-notif-list"] }),
  });

  const markOneMut = useMutation({
    mutationFn: (id: number) => staffNotificationApi.markRead([id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-notif-list"] }),
  });

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
                My Cinema Staff
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
            to="/staff"
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
            <FontAwesomeIcon icon={faChartBar} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink
            to="/staff/scheduling"
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
            <FontAwesomeIcon icon={faCalendarAlt} />
            {!collapsed && <span>Lịch chiếu tự động</span>}
          </NavLink>
          <NavLink
            to="/staff/movies"
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
            <FontAwesomeIcon icon={faFilm} />
            {!collapsed && <span>Quản lý phim</span>}
          </NavLink>
          <NavLink
            to="/staff/showtimes"
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
            <FontAwesomeIcon icon={faClock} />
            {!collapsed && <span>Suất chiếu</span>}
          </NavLink>
          <NavLink
            to="/staff/bookings"
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
            <FontAwesomeIcon icon={faCashRegister} />
            {!collapsed && <span>Quản lý Vé</span>}
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
                  case "scheduling":
                    return "Lịch chiếu tự động";
                  case "movies":
                    return "Quản lý phim";
                  case "showtimes":
                    return "Suất chiếu";
                  case "pos":
                    return "Bán vé";
                  default:
                    return "Bảng điều khiển";
                }
              })()}
            </div>
            <div style={{ fontSize: 12, color: "#8b7355", lineHeight: 1 }}>
              {(() => {
                const labels: Record<string, string> = {
                  staff: "Staff",
                  scheduling: "Lịch chiếu",
                  movies: "Phim",
                  showtimes: "Suất chiếu",
                  pos: "Bán vé",
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
                            <Link to={href.replace("/staff", "/staff")}>
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
            <div style={{ position: "relative" }}>
              <details>
                <summary style={{ listStyle: "none", cursor: "pointer" }}>
                  <span
                    style={{ 
                      position: "relative", 
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={faBell} 
                      style={{ 
                        fontSize: 18,
                        color: "#8b7355"
                      }}
                    />
                    {notifQ.data?.unread != null && notifQ.data.unread > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "#dc3545",
                          color: "#fff",
                          borderRadius: 12,
                          padding: "0 6px",
                          fontSize: 10,
                          lineHeight: "16px",
                          minWidth: 16,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {notifQ.data.unread}
                      </span>
                    )}
                  </span>
                </summary>
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 8,
                    width: 360,
                    background: "#fff",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>Thông báo</div>
                    <button
                      onClick={() => markAllMut.mutate()}
                      disabled={markAllMut.isPending}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0d6efd",
                        cursor: "pointer",
                      }}
                    >
                      Đánh dấu đã đọc tất cả
                    </button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {(notifQ.data?.items || []).filter((n) => !n.isRead)
                      .length === 0 ? (
                      <div style={{ padding: 12, color: "#6c757d" }}>
                        Không có thông báo chưa đọc
                      </div>
                    ) : (
                      (notifQ.data?.items || [])
                        .filter((n) => !n.isRead)
                        .map((n) => (
                          <div
                            key={n.id}
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #f1f3f5",
                              background: n.isRead ? "#fff" : "#f8f9fa",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>
                              {n.title || n.type}
                            </div>
                            <div style={{ fontSize: 13 }}>{n.message}</div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 6,
                              }}
                            >
                              <small style={{ color: "#6c757d" }}>
                                {new Date(n.createdAt).toLocaleString()}
                              </small>
                              {!n.isRead && (
                                <button
                                  onClick={() => markOneMut.mutate(n.id)}
                                  disabled={markOneMut.isPending}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#0d6efd",
                                    cursor: "pointer",
                                  }}
                                >
                                  Đánh dấu đã đọc
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </details>
            </div>

            {user ? (
               <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
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
            )}
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
