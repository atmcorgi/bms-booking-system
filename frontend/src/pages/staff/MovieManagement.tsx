import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../services/apiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClipboardList, 
  faCalendarCheck, 
  faCircleCheck, 
  faEdit, 
  faSave, 
  faTimes, 
  faTrash, 
  faCalendarPlus, 
  faEye, 
  faEyeSlash, 
  faLightbulb,
  faBuilding,
  faCheck 
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/staff-booking.css"; // Modern Staff CSS

export default function MovieManagement() {
  const [notice, setNotice] = useState<string>("");
  const [editRow, setEditRow] = useState<{
    id: number;
    priority: number;
    demandScore: number;
  } | null>(null);
  const [selectedScheduledIds, setSelectedScheduledIds] = useState<number[]>([]);

  // Fetch theater info
  const { data: dashboardData } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => (await api.get("/api/staff/dashboard")).data,
  });

  const theater = dashboardData?.theater;

  // Fetch all movie requests
  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ["staff-movie-requests-pending"],
    queryFn: async () =>
      (await api.get(`/api/staff/movie-requests`, { params: { status: "PENDING" } })).data,
  });

  const {
    data: scheduledData,
    isLoading: loadingScheduled,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: ["staff-movie-requests-scheduled"],
    queryFn: async () =>
      (await api.get(`/api/staff/movie-requests`, { params: { status: "SCHEDULED" } })).data,
  });

  const {
    data: publishedData,
    isLoading: loadingPublished,
    refetch: refetchPublished,
  } = useQuery({
    queryKey: ["staff-movie-requests-published"],
    queryFn: async () =>
      (await api.get(`/api/staff/movie-requests`, { params: { status: "PUBLISHED" } })).data,
  });

  const pendingRequests = pendingData?.items || [];
  const scheduledRequests = scheduledData?.items || [];
  const publishedRequests = publishedData?.items || [];

  const refetchAll = () => {
    refetchPending();
    refetchScheduled();
    refetchPublished();
  };

  // Update request mutation
  const updateReqMut = useMutation({
    mutationFn: (payload: { id: number; priority?: number; demandScore?: number }) =>
      api.patch(`/api/staff/movie-requests/${payload.id}`, {
        priority: payload.priority,
        demandScore: payload.demandScore,
      }),
    onSuccess: () => {
      setNotice("Đã cập nhật yêu cầu");
      setEditRow(null);
      refetchAll();
      setTimeout(() => setNotice(""), 3000);
    },
    onError: (e: any) =>
      setNotice(`Lỗi: ${e?.response?.data?.error || e?.message || "Lỗi khi cập nhật"}`),
  });

  // Delete request mutation
  const deleteReqMut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/staff/movie-requests/${id}`),
    onSuccess: () => {
      setNotice("Đã xóa yêu cầu");
      refetchAll();
      setTimeout(() => setNotice(""), 3000);
    },
    onError: (e: any) =>
      setNotice(`Lỗi: ${e?.response?.data?.error || e?.message || "Lỗi khi xóa"}`),
  });

  // Publish mutation (SCHEDULED → PUBLISHED)
  const publishMut = useMutation({
    mutationFn: (requestId: number) =>
      api.post(`/api/staff/movie-requests/${requestId}/publish`),
    onSuccess: () => {
      setNotice("Đã publish phim thành công");
      refetchAll();
      setTimeout(() => setNotice(""), 3000);
    },
    onError: (e: any) =>
      setNotice(`Lỗi: ${e?.response?.data?.error || e?.message || "Lỗi khi publish"}`),
  });

  // Bulk Publish mutation
  const bulkPublishMut = useMutation({
    mutationFn: (requestIds: number[]) =>
      Promise.all(requestIds.map(id => api.post(`/api/staff/movie-requests/${id}/publish`))),
    onSuccess: () => {
      setNotice(`Đã publish ${selectedScheduledIds.length} phim thành công`);
      setSelectedScheduledIds([]);
      refetchAll();
      setTimeout(() => setNotice(""), 3000);
    },
    onError: (e: any) =>
      setNotice(`Lỗi: ${e?.response?.data?.error || e?.message || "Lỗi khi publish hàng loạt"}`),
  });

  // Unpublish mutation (PUBLISHED → SCHEDULED)
  const unpublishMut = useMutation({
    mutationFn: (requestId: number) =>
      api.post(`/api/staff/movie-requests/${requestId}/unpublish`),
    onSuccess: () => {
      setNotice("Đã unpublish phim thành công");
      refetchAll();
      setTimeout(() => setNotice(""), 3000);
    },
    onError: (e: any) =>
      setNotice(`Lỗi: ${e?.response?.data?.error || e?.message || "Lỗi khi unpublish"}`),
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      deleteReqMut.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleSelectAllScheduled = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedScheduledIds(scheduledRequests.map((r: any) => r.id));
    } else {
      setSelectedScheduledIds([]);
    }
  };

  const handleSelectOneScheduled = (checked: boolean, id: number) => {
    if (checked) {
      setSelectedScheduledIds(prev => [...prev, id]);
    } else {
      setSelectedScheduledIds(prev => prev.filter(item => item !== id));
    }
  };

  const renderRequestTable = (
    requests: any[],
    status: "PENDING" | "SCHEDULED" | "PUBLISHED",
    isLoading: boolean
  ) => {
    const isPending = status === "PENDING";
    const isScheduled = status === "SCHEDULED";
    const isPublished = status === "PUBLISHED";

    const colSpan = isPending ? 5 : (isScheduled ? 5 : 4);

    return (
      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              {isScheduled && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={requests.length > 0 && selectedScheduledIds.length === requests.length}
                    onChange={handleSelectAllScheduled}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              <th>Mã phim</th>
              <th>Tiêu đề</th>
              {isPending && <th>Ưu tiên</th>}
              {isPending && <th>Điểm nhu cầu</th>}
              {(isScheduled || isPublished) && <th>Trạng thái</th>}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                  <FontAwesomeIcon icon={faCircleCheck} spin={true} /> Đang tải...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                  Chưa có yêu cầu nào
                </td>
              </tr>
            ) : (
              requests.map((r: any) => {
                const isEditing = editRow?.id === r.id;
                return (
                  <tr key={r.id}>
                    {isScheduled && (
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedScheduledIds.includes(r.id)}
                          onChange={(e) => handleSelectOneScheduled(e.target.checked, r.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    <td className="text-mono">{r.movieCode}</td>
                    <td><strong>{r.movieTitle || r.movie?.title}</strong></td>
                    
                    {isPending && (
                      <>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editRow?.priority ?? 0}
                              className="staff-input staff-input-sm"
                              style={{ width: 72 }}
                              onChange={(e) =>
                                setEditRow((prev) =>
                                  prev ? { ...prev, priority: Number(e.target.value) } : prev
                                )
                              }
                            />
                          ) : (
                            r.priority ?? 0
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={editRow?.demandScore ?? 0}
                              className="staff-input staff-input-sm"
                              style={{ width: 72 }}
                              onChange={(e) =>
                                setEditRow((prev) =>
                                  prev ? { ...prev, demandScore: Number(e.target.value) } : prev
                                )
                              }
                            />
                          ) : (
                            (r.demandScore ?? 0).toFixed(1)
                          )}
                        </td>
                      </>
                    )}

                    {(isScheduled || isPublished) && (
                      <td>
                        <span className={`staff-badge ${isPublished ? "staff-badge-green" : "staff-badge-yellow"}`}>
                          {isPublished ? "Đã publish" : "Đã lập lịch"}
                        </span>
                      </td>
                    )}

                    <td>
                      <div className="staff-action-group">
                        {isPending && (
                          <>
                            {isEditing ? (
                              <>
                                <button
                                  className="staff-btn staff-btn-success staff-btn-sm"
                                  onClick={() =>
                                    updateReqMut.mutate({
                                      id: r.id,
                                      priority: editRow?.priority,
                                      demandScore: editRow?.demandScore,
                                    })
                                  }
                                >
                                  <FontAwesomeIcon icon={faSave} /> Lưu
                                </button>
                                <button
                                  className="staff-btn staff-btn-secondary staff-btn-sm"
                                  onClick={() => setEditRow(null)}
                                >
                                  <FontAwesomeIcon icon={faTimes} /> Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="staff-btn staff-btn-secondary staff-btn-sm"
                                  onClick={() =>
                                    setEditRow({
                                      id: r.id,
                                      priority: r.priority ?? 0,
                                      demandScore: r.demandScore ?? 0,
                                    })
                                  }
                                >
                                  <FontAwesomeIcon icon={faEdit} /> Sửa
                                </button>
                              </>
                            )}
                              <button
                                className="staff-btn staff-btn-danger staff-btn-sm"
                                onClick={() => setDeleteId(r.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} /> Xóa
                              </button>
                          </>
                        )}

                        {isScheduled && (
                          <button
                            className="staff-btn staff-btn-success staff-btn-sm"
                            onClick={() => publishMut.mutate(r.id)}
                            disabled={publishMut.isPending}
                          >
                            <FontAwesomeIcon icon={faEye} /> Publish
                          </button>
                        )}

                        {isPublished && (
                          <button
                            className="staff-btn staff-btn-secondary staff-btn-sm"
                            onClick={() => unpublishMut.mutate(r.id)}
                            disabled={unpublishMut.isPending}
                          >
                            <FontAwesomeIcon icon={faEyeSlash} /> Unpublish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="staff-container">
      <div className="staff-header-section">
          <div>
            <h2 className="staff-title">
                Quản lý Yêu cầu Phim
            </h2>
             <p className="staff-subtitle">
                <FontAwesomeIcon icon={faBuilding} /> {theater ? `${theater.name} (${theater.code})` : "Loading..."}
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/staff/scheduling"}
            className="staff-btn staff-btn-primary"
          >
            <FontAwesomeIcon icon={faCalendarPlus} />
            Lập lịch
          </button>
        </div>

        {notice && (
          <div className={`staff-alert ${notice.includes("Lỗi") ? "staff-alert-error" : "staff-alert-success"}`}>
             <FontAwesomeIcon icon={notice.includes("Lỗi") ? faTimes : faCheck} className="mr-2"/>
             {notice}
          </div>
        )}

        {/* Block 1: PENDING */}
        <div style={{ marginBottom: 32 }} className="staff-card">
          <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 600, color: "#d97706" }}>
            <FontAwesomeIcon icon={faClipboardList} style={{ marginRight: "8px" }} />
            Chờ lập lịch (PENDING)
          </h4>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
            Các phim mới được Admin assign, chưa tạo suất chiếu. Hãy cập nhật độ ưu tiên và điểm nhu cầu, sau đó chuyển sang Lập lịch.
          </div>
          {renderRequestTable(pendingRequests, "PENDING", loadingPending)}
        </div>

        {/* Block 2: SCHEDULED */}
        <div style={{ marginBottom: 32 }} className="staff-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600, color: "#1e40af" }}>
                <FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: "8px" }} />
                Đã lập lịch (SCHEDULED)
              </h4>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Các phim đã có suất chiếu nhưng chưa publish. Click "Publish" từng phim hoặc chọn nhiều phim để publish đồng loạt.
              </div>
            </div>
            {selectedScheduledIds.length > 0 && (
              <button
                className="staff-btn staff-btn-success"
                onClick={() => bulkPublishMut.mutate(selectedScheduledIds)}
                disabled={bulkPublishMut.isPending}
              >
                <FontAwesomeIcon icon={faCheck} /> Publish ({selectedScheduledIds.length}) phim đã chọn
              </button>
            )}
          </div>
          {renderRequestTable(scheduledRequests, "SCHEDULED", loadingScheduled)}
        </div>

        {/* Block 3: PUBLISHED */}
        <div style={{ marginBottom: 32 }} className="staff-card">
          <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 600, color: "#15803d" }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: "8px" }} />
            Đã publish (PUBLISHED)
          </h4>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
            Các phim đang hiển thị công khai, customer có thể đặt vé. Click "Unpublish" để tạm ẩn khỏi danh sách.
          </div>
          {renderRequestTable(publishedRequests, "PUBLISHED", loadingPublished)}
        </div>

        {/* Hướng dẫn */}
        <div className="staff-card" style={{background: '#f9fafb'}}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 600 }}>
            <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: "8px", color: "#f59e0b" }} />
            Workflow
          </h4>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#4b5563" }}>
            <p style={{ marginBottom: "8px" }}>
              <strong>1. PENDING:</strong> Admin assign phim → tự động tạo MovieRequest với status PENDING
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>2. SCHEDULED:</strong> Staff lập lịch (tạo Showtimes) → status chuyển sang SCHEDULED
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>3. PUBLISHED:</strong> Staff publish → status chuyển sang PUBLISHED, customer thấy được
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>4. Unpublish:</strong> Nếu cần tạm ẩn, click Unpublish để chuyển về SCHEDULED
            </p>
          </div>
        </div>
      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="staff-modal-overlay">
          <div className="staff-modal">
            <div className="staff-modal-content">
              <div className="staff-modal-icon">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <h3 className="staff-modal-title">
                Xác nhận xóa
              </h3>
              <p className="staff-modal-text">
                Bạn có chắc chắn muốn xóa yêu cầu này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="staff-modal-actions">
              <button
                type="button"
                className="staff-btn staff-btn-danger"
                onClick={confirmDelete}
                disabled={deleteReqMut.isPending}
              >
                {deleteReqMut.isPending ? "Đang xóa..." : "Xóa bỏ"}
              </button>
              <button
                type="button"
                className="staff-btn staff-btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

