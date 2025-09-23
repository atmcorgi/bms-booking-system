import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import "../../styles/admin-table.css";

// Theater Action Menu Component
const TheaterActionMenu = ({
  theater,
  onDelete,
  onNavigate,
}: {
  theater: any;
  onDelete: () => void;
  onNavigate: (path: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          background: "linear-gradient(135deg, #8b7355 0%, #a68b5b 100%)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minWidth: "100px",
          justifyContent: "center",
          boxShadow: "0 2px 4px rgba(139, 115, 85, 0.2)",
          transition: "all 0.2s ease",
          outline: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #5d4e37 0%, #8b7355 100%)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(139, 115, 85, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #8b7355 0%, #a68b5b 100%)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(139, 115, 85, 0.2)";
        }}
      >
        <span style={{ fontSize: "12px", flexShrink: 0 }}>⚙️</span>
        <span style={{ flexShrink: 0, lineHeight: 1 }}>Hành động</span>
        <span style={{ fontSize: "8px", flexShrink: 0 }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "4px",
              background: "#fff",
              border: "1px solid #d9d2b7",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(139, 115, 85, 0.15)",
              zIndex: 20,
              minWidth: "200px",
              overflow: "hidden",
            }}
          >
            {/* Main Actions */}
            <div style={{ padding: "8px 0" }}>
              <button
                onClick={() => {
                  onNavigate(`/admin/theaters/${theater.id}/detail`);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#faf9f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "16px" }}>🎬</span>
                Quản lý rạp
              </button>
              <button
                onClick={() => {
                  onNavigate(`/admin/theaters/${theater.id}/edit`);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#faf9f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "16px" }}>✏️</span>
                Chỉnh sửa
              </button>
            </div>

            {/* Divider */}
            <div
              style={{ height: "1px", background: "#d9d2b7", margin: "4px 0" }}
            />

            {/* Quick Actions */}
            <div style={{ padding: "8px 0" }}>
              <button
                onClick={() => {
                  onNavigate(`/admin/theaters/${theater.id}/view`);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#8b7355",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#faf9f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "14px" }}>👁️</span>
                Xem thông tin
              </button>
            </div>

            {/* Divider */}
            <div
              style={{ height: "1px", background: "#d9d2b7", margin: "4px 0" }}
            />

            {/* Danger Zone */}
            <div style={{ padding: "8px 0" }}>
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "14px" }}>🗑️</span>
                Xóa rạp
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function TheaterList() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-theaters", { q: debouncedQ, page }],
    queryFn: () => adminTheaterApi.list({ q: debouncedQ, page, size: 10 }),
  });

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => window.clearTimeout(t);
  }, [q]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Có lỗi khi tải dữ liệu</div>;

  return (
    <div style={{ padding: "0", maxWidth: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          padding: "12px",
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="admin-toolbar">
          <h3 style={{ margin: 0, lineHeight: 1 }}>Quản lý Rạp chiếu phim</h3>
          <div className="admin-toolbar-actions">
            {/* Search group */}
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 0,
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                overflow: "hidden",
                height: "36px", // Match button height
              }}
            >
              <input
                placeholder="Tìm theo mã, tên rạp..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                style={{
                  border: "none",
                  borderRadius: 0,
                  borderRight: q ? "1px solid #dee2e6" : "none",
                  height: "100%", // Fill container height
                  boxSizing: "border-box",
                  padding: "0 12px",
                  background: "#ffffff",
                  outline: "none",
                  fontSize: "14px",
                  lineHeight: "1",
                  minWidth: "260px",
                  flex: 1,
                }}
              />
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    setPage(0);
                  }}
                  aria-label="Xóa tìm kiếm"
                  title="Xóa tìm kiếm"
                  style={{
                    border: "none",
                    borderRadius: 0,
                    borderLeft: "1px solid #dee2e6",
                    minWidth: "auto",
                    padding: "0 12px",
                    height: "100%", // Fill container height
                    boxSizing: "border-box",
                    background: "#f1f5f9",
                    color: "#475569",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action buttons */}
            <button
              className="fd-btn"
              onClick={() => navigate("/admin/theaters/create")}
            >
              + Thêm rạp
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <colgroup>
                <col width="60" />
                <col width="80" />
                <col width="180" />
                <col width="220" />
                <col width="100" />
                <col width="100" />
                <col width="120" />
                <col width="80" />
                <col width="80" />
                <col width="140" />
              </colgroup>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Mã rạp</th>
                  <th align="left">Tên rạp</th>
                  <th align="left">Địa chỉ</th>
                  <th align="left">Tỉnh/TP</th>
                  <th align="left">Quận/Huyện</th>
                  <th align="left">Số điện thoại</th>
                  <th align="left">Mở cửa</th>
                  <th align="left">Đóng cửa</th>
                  <th align="left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data?.items || []).map((t: any) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td className="cell-strong">{t.code}</td>
                    <td>
                      <div
                        className="cell-strong cell-ellipsis-1"
                        title={t.name}
                      >
                        {t.name}
                      </div>
                    </td>
                    <td>
                      <div className="cell-ellipsis-1-wide" title={t.address}>
                        {t.address}
                      </div>
                    </td>
                    <td className="cell-ellipsis-1" title={t.province?.name}>
                      {t.province?.name}
                    </td>
                    <td className="cell-ellipsis-1" title={t.district?.name}>
                      {t.district?.name}
                    </td>
                    <td className="cell-ellipsis-1" title={t.phone}>
                      {t.phone}
                    </td>
                    <td className="text-right" title={t.openTime || "N/A"}>
                      {t.openTime || "N/A"}
                    </td>
                    <td className="text-right" title={t.closeTime || "N/A"}>
                      {t.closeTime || "N/A"}
                    </td>
                    <td>
                      <TheaterActionMenu
                        theater={t}
                        onDelete={() => setPendingDelete(t)}
                        onNavigate={(path) => navigate(path)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: page <= 0 ? "#f9fafb" : "#ffffff",
              color: page <= 0 ? "#9ca3af" : "#374151",
              cursor: page <= 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (page > 0) {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#9ca3af";
              }
            }}
            onMouseLeave={(e) => {
              if (page > 0) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5db";
              }
            }}
          >
            ← Trước
          </button>

          <div
            style={{
              padding: "8px 16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#475569",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {page + 1} / {data?.data?.totalPages || 1}
          </div>

          <button
            disabled={page + 1 >= (data?.data?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background:
                page + 1 >= (data?.data?.totalPages || 1)
                  ? "#f9fafb"
                  : "#ffffff",
              color:
                page + 1 >= (data?.data?.totalPages || 1)
                  ? "#9ca3af"
                  : "#374151",
              cursor:
                page + 1 >= (data?.data?.totalPages || 1)
                  ? "not-allowed"
                  : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (page + 1 < (data?.data?.totalPages || 1)) {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#9ca3af";
              }
            }}
            onMouseLeave={(e) => {
              if (page + 1 < (data?.data?.totalPages || 1)) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5db";
              }
            }}
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h3
              id="delete-title"
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "16px",
              }}
            >
              Xác nhận xóa rạp
            </h3>
            <div
              style={{
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: 14,
              }}
            >
              <div style={{ fontWeight: 500, color: "#374151" }}>
                {pendingDelete.name}
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                ID: {pendingDelete.id}
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                padding: 8,
                background: "#fef3c7",
                borderRadius: 6,
                fontSize: 13,
                color: "#92400e",
                border: "1px solid #fbbf24",
              }}
            >
              ⚠️ Hành động này không thể hoàn tác. Rạp và tất cả dữ liệu liên
              quan sẽ bị xóa vĩnh viễn.
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setPendingDelete(null)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              >
                Hủy
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  border: "1px solid #dc2626",
                  borderRadius: "6px",
                  background: "#dc2626",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b91c1c";
                  e.currentTarget.style.borderColor = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                  e.currentTarget.style.borderColor = "#dc2626";
                }}
                onClick={async () => {
                  try {
                    await adminTheaterApi.remove(pendingDelete.id);
                    await qc.invalidateQueries({
                      queryKey: ["admin-theaters"],
                    });
                    setPendingDelete(null);
                  } catch (e: any) {
                    console.error("Error deleting theater:", e);
                    alert(
                      "Lỗi xóa rạp: " + (e?.message || "Không thể xóa rạp")
                    );
                  }
                }}
              >
                Xóa rạp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
