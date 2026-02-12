import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminMovieRequestApi, type MovieRequest } from "../../services/adminMovieRequestApi";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import ConfirmModal from "../../components/shared/ConfirmModal";
import ErrorModal from "../../components/shared/ErrorModal";
import CustomDropdown from "../../components/CustomDropdown";
import "../../styles/admin-table.css";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ lập lịch", color: "#ffc107" },
  { value: "SCHEDULED", label: "Đã lập lịch", color: "#28a745" },
];

export default function MovieRequestList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [theaterFilter, setTheaterFilter] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const size = 10;

  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    id: number | null;
    action: "delete" | null;
  }>({ show: false, id: null, action: null });

  const [selectedRequest, setSelectedRequest] = useState<MovieRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [errorModal, setErrorModal] = useState({ 
    show: false, 
    message: "", 
    title: "Thông báo" 
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(timer);
  }, [q]);

  // Fetch requests
  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", { q: debouncedQ, statusFilter, page, theaterFilter }],
    queryFn: () => {
      const params: any = { page, size };
      if (debouncedQ) params.q = debouncedQ;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (theaterFilter) params.theaterId = theaterFilter;
      return adminMovieRequestApi.list(params);
    },
  });

  // Fetch theaters for filter
  const { data: theatersData } = useQuery({
    queryKey: ["admin-theaters-all"],
    queryFn: () => adminTheaterApi.list({ size: 1000 }),
  });

  const requests = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalItems = data?.data?.totalItems || 0;
  const theaters = theatersData?.data?.items || [];

  // Delete mutation
  const deleteMut = useMutation({
    mutationFn: (id: number) => adminMovieRequestApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-requests"] });
      setConfirmAction({ show: false, id: null, action: null });
    },
    onError: (err: any) =>
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: err.response?.data?.message || "Lỗi khi xóa.",
      }),
  });

  const handleDelete = (id: number) => {
    setConfirmAction({ show: true, id, action: "delete" });
  };

  const getStatusChip = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find((opt) => opt.value === status);
    const background = statusConfig?.color || "#999";
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "12px",
          background,
          color: "#fff",
          fontSize: "12px",
          fontWeight: "500",
        }}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetail = (request: MovieRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  if (isLoading) return <div className="admin-list-container">Đang tải...</div>;

  return (
    <>
      <div style={{ padding: "16px", maxWidth: "100%", boxSizing: "border-box" }}>
        <div
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <div className="admin-toolbar">
            <h3 style={{ margin: 0, lineHeight: 1 }}>Quản lý Yêu cầu Phim</h3>
            <div className="admin-toolbar-actions">
              {/* Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: 0,
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  overflow: "hidden",
                  height: "36px",
                }}
              >
                <input
                  placeholder="Tìm theo phim, rạp..."
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(0);
                  }}
                  style={{
                    border: "none",
                    borderRadius: 0,
                    borderRight: q ? "1px solid #dee2e6" : "none",
                    height: "100%",
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
                    style={{
                      border: "none",
                      borderRadius: 0,
                      minWidth: "auto",
                      padding: "0 12px",
                      height: "100%",
                      boxSizing: "border-box",
                      background: "#f1f5f9",
                      color: "#475569",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status filter */}
              <CustomDropdown
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(String(val));
                  setPage(0);
                }}
                options={STATUS_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                placeholder="Trạng thái"
                width="180px"
              />

              {/* Theater filter */}
              <CustomDropdown
                value={theaterFilter || ""}
                onChange={(val) => {
                  setTheaterFilter(val ? Number(val) : null);
                  setPage(0);
                }}
                options={[
                  { value: "", label: "Tất cả rạp" },
                  ...theaters.map((t: any) => ({
                    value: t.id,
                    label: t.name,
                  })),
                ]}
                placeholder="Tất cả rạp"
                width="200px"
              />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <colgroup>
                  <col width="60" />
                  <col width="220" />
                  <col width="180" />
                  <col width="100" />
                  <col width="80" />
                  <col width="80" />
                  <col width="100" />
                  <col width="160" />
                  <col width="160" />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Phim</th>
                    <th>Rạp</th>
                    <th>Trạng thái</th>
                    <th>Priority</th>
                    <th>Demand</th>
                    <th>Người tạo</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                        {q || statusFilter !== "ALL" || theaterFilter
                          ? "Không tìm thấy kết quả"
                          : "Chưa có yêu cầu nào."}
                      </td>
                    </tr>
                  ) : (
                    requests.map((req: MovieRequest) => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>
                          <div className="cell-strong cell-ellipsis-1-wide" title={req.movieTitle}>
                            {req.movieTitle}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            {req.movieCode}
                          </div>
                        </td>
                        <td>
                          <div className="cell-ellipsis-1" title={req.theaterName}>
                            {req.theaterName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            {req.theaterCode}
                          </div>
                        </td>
                        <td>{getStatusChip(req.status)}</td>
                        <td style={{ textAlign: "center" }}>{req.priority || 0}</td>
                        <td style={{ textAlign: "center" }}>
                          {req.demandScore ? req.demandScore.toFixed(1) : "0.0"}
                        </td>
                        <td>
                          <div className="cell-ellipsis-1" title={req.createdBy}>
                            {req.createdBy}
                          </div>
                        </td>
                        <td>{formatDate(req.createdAt)}</td>
                        <td>
                          <div className="action-group">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewDetail(req)}
                              title="Xem chi tiết"
                            >
                              Chi tiết
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(req.id)}
                              title="Xóa yêu cầu"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="admin-pagination">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              className="admin-pagination-btn"
            >
              ← Trước
            </button>

            <div className="admin-pagination-info">
              Trang {page + 1} / {totalPages}
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                ({totalItems} yêu cầu)
              </div>
            </div>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="admin-pagination-btn"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <DetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmAction.show}
        title="Xác nhận Xóa"
        message="Bạn có chắc muốn xóa yêu cầu này? Hành động này không thể hoàn tác."
        onConfirm={() => confirmAction.id && deleteMut.mutate(confirmAction.id)}
        onClose={() => setConfirmAction({ show: false, id: null, action: null })}
      />

      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Thông báo" })}
      />
    </>
  );
}

// Detail Modal Component
interface DetailModalProps {
  request: MovieRequest;
  onClose: () => void;
}

function DetailModal({ request, onClose }: DetailModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
          Chi tiết Yêu cầu Phim
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
              ID
            </label>
            <div style={{ fontSize: "14px", fontWeight: "500" }}>{request.id}</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
              Phim
            </label>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>{request.movieTitle}</div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>Code: {request.movieCode}</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
              Rạp
            </label>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>{request.theaterName}</div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>Code: {request.theaterCode}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
                Trạng thái
              </label>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                {request.status}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
                Priority
              </label>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>{request.priority || 0}</div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
                Demand Score
              </label>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                {request.demandScore ? request.demandScore.toFixed(2) : "0.00"}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
              Người tạo
            </label>
            <div style={{ fontSize: "14px", fontWeight: "500" }}>{request.createdBy}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
                Ngày tạo
              </label>
              <div style={{ fontSize: "14px" }}>
                {new Date(request.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#6c757d", marginBottom: "4px" }}>
                Ngày cập nhật
              </label>
              <div style={{ fontSize: "14px" }}>
                {new Date(request.updatedAt).toLocaleString("vi-VN")}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#374151",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
