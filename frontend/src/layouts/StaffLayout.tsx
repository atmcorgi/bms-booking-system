import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { authApi } from "../services/authApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffNotificationApi } from "../services/staffNotificationApi";

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace(/^\/staff\/?/, "");
  const crumbs = ["Staff", ...path.split("/").filter(Boolean)];

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
        gridTemplateColumns: "220px 1fr",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          background: "#f6f8fa",
          color: "#333",
          padding: 16,
          borderRight: "1px solid #e9ecef",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 16 }}>
          <Link to="/" style={{ color: "#333", textDecoration: "none" }}>
            My Cinema Staff
          </Link>
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
                ? "3px solid #6ea8fe"
                : "3px solid transparent",
              background: isActive ? "#e7f1ff" : "transparent",
            })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/staff/scheduling"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #6ea8fe"
                : "3px solid transparent",
              background: isActive ? "#e7f1ff" : "transparent",
            })}
          >
            Auto scheduling
          </NavLink>
          <NavLink
            to="/staff/movies"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #6ea8fe"
                : "3px solid transparent",
              background: isActive ? "#e7f1ff" : "transparent",
            })}
          >
            Quản lý phim
          </NavLink>
          <NavLink
            to="/staff/showtimes"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #6ea8fe"
                : "3px solid transparent",
              background: isActive ? "#e7f1ff" : "transparent",
            })}
          >
            Suất chiếu
          </NavLink>
          <NavLink
            to="/staff/pos"
            style={({ isActive }) => ({
              color: "#333",
              textDecoration: "none",
              padding: "8px 10px",
              borderLeft: isActive
                ? "3px solid #6ea8fe"
                : "3px solid transparent",
              background: isActive ? "#e7f1ff" : "transparent",
            })}
          >
            Bán vé
          </NavLink>
        </nav>
      </aside>
      <section style={{ background: "#f8f9fa" }}>
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e9ecef",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 700 }}>Bảng điều khiển nhân viên</div>
            <div style={{ fontSize: 12, color: "#6c757d" }}>
              {crumbs.join(" / ")}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <details>
                <summary style={{ listStyle: "none", cursor: "pointer" }}>
                  <span
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    🔔
                    {notifQ.data?.unread && notifQ.data.unread > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -8,
                          background: "#dc3545",
                          color: "#fff",
                          borderRadius: 12,
                          padding: "0 6px",
                          fontSize: 12,
                          lineHeight: "18px",
                          minWidth: 18,
                          textAlign: "center",
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

            <button
              onClick={handleLogout}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <div style={{ padding: 16 }}>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
