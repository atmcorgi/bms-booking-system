import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import ErrorModal from "../../components/shared/ErrorModal";
import "../../styles/admin-table.css";

export default function TheaterList() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Lỗi" });
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
                      <div className="action-group">
                        <button
                          className="btn-action btn-view"
                          onClick={() =>
                            navigate(`/admin/theaters/${t.id}/detail`)
                          }
                        >
                          View
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            navigate(`/admin/theaters/${t.id}/edit`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => setPendingDelete(t)}
                          aria-label={`Xóa rạp ${t.name}`}
                        >
                          Delete
                        </button>
                      </div>
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
              ⚠ Hành động này không thể hoàn tác. Rạp và tất cả dữ liệu liên
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
                    setErrorModal({
                      show: true,
                      title: "Lỗi",
                      message: "Lỗi xóa rạp: " + (e?.message || "Không thể xóa rạp")
                    });
                  }
                }}
              >
                Xóa rạp
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Lỗi" })}
      />
    </div>
  );
}
