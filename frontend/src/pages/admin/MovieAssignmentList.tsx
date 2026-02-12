import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminMovieAssignmentApi, type MovieAssignment } from "../../services/adminMovieAssignmentApi";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import { adminMovieApi } from "../../services/adminMovieApi";
import ConfirmModal from "../../components/shared/ConfirmModal";
import ErrorModal from "../../components/shared/ErrorModal";
import CustomDropdown from "../../components/CustomDropdown";
import "../../styles/admin-table.css";

export default function MovieAssignmentList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const [theaterFilter, setTheaterFilter] = useState<number | null>(null);
  const size = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<MovieAssignment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: number | null }>({ 
    show: false, 
    id: null 
  });
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Thông báo" });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(timer);
  }, [q]);

  // Fetch assignments
  const { data, isLoading } = useQuery({
    queryKey: ["admin-assignments", { q: debouncedQ, page, theaterFilter }],
    queryFn: () => adminMovieAssignmentApi.list({ 
      q: debouncedQ, 
      page, 
      size,
      theaterId: theaterFilter || undefined,
      sortBy: "id",
      sortDir: "DESC"
    }),
  });

  // Fetch theaters for filter
  const { data: theatersData } = useQuery({
    queryKey: ["admin-theaters-all"],
    queryFn: () => adminTheaterApi.list({ size: 1000 }),
  });

  const assignments = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalItems = data?.data?.totalItems || 0;
  const theaters = theatersData?.data?.items || [];

  // Delete mutation
  const deleteMut = useMutation({
    mutationFn: (id: number) => adminMovieAssignmentApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-assignments"] });
      setConfirmDelete({ show: false, id: null });
    },
    onError: (err: any) => setErrorModal({ 
      show: true, 
      title: "Lỗi", 
      message: err.response?.data?.message || "Lỗi khi xóa gán phim." 
    }),
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setShowModal(true);
  };

  const handleEdit = (assignment: MovieAssignment) => {
    setEditingAssignment(assignment);
    setShowModal(true);
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
            <h3 style={{ margin: 0, lineHeight: 1 }}>Quản lý Gán Phim cho Rạp</h3>
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
                      transition: "all 0.15s ease",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

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

              {/* Create button */}
              <button className="fd-btn" onClick={handleCreate}>
                + Gán phim mới
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <colgroup>
                  <col width="60" />
                  <col width="200" />
                  <col width="180" />
                  <col width="120" />
                  <col width="120" />
                  <col width="150" />
                  <col width="150" />
                  <col width="140" />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Phim</th>
                    <th>Rạp</th>
                    <th>Từ ngày</th>
                    <th>Đến ngày</th>
                    <th>Formats</th>
                    <th>Languages</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                        {q || theaterFilter
                          ? "Không tìm thấy kết quả"
                          : "Chưa có phim nào được gán. Nhấn 'Gán phim mới' để bắt đầu."}
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment: MovieAssignment) => (
                      <tr key={assignment.id}>
                        <td>{assignment.id}</td>
                        <td>
                          <div className="cell-strong cell-ellipsis-1-wide" title={assignment.movieTitle}>
                            {assignment.movieTitle}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            {assignment.movieCode}
                          </div>
                        </td>
                        <td>
                          <div className="cell-ellipsis-1" title={assignment.theaterName}>
                            {assignment.theaterName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            {assignment.theaterCode}
                          </div>
                        </td>
                        <td>{formatDate(assignment.activeFrom)}</td>
                        <td>{formatDate(assignment.activeTo)}</td>
                        <td>
                          <div className="cell-ellipsis-1" title={assignment.formats || ""}>
                            {assignment.formats || "—"}
                          </div>
                        </td>
                        <td>
                          <div className="cell-ellipsis-1" title={assignment.languages || ""}>
                            {assignment.languages || "—"}
                          </div>
                        </td>
                        <td>
                          <div className="action-group">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(assignment)}
                              title="Chỉnh sửa"
                            >
                              Sửa
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => setConfirmDelete({ show: true, id: assignment.id })}
                              title="Xóa gán phim"
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
                ({totalItems} kết quả)
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

      {/* Create/Edit Modal */}
      {showModal && (
        <AssignmentModal
          assignment={editingAssignment}
          onClose={() => {
            setShowModal(false);
            setEditingAssignment(null);
          }}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["admin-assignments"] });
            setShowModal(false);
            setEditingAssignment(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="Xác nhận xóa gán phim"
        message="Bạn có chắc muốn xóa gán phim này? Hành động này không thể hoàn tác."
        onConfirm={() => confirmDelete.id && deleteMut.mutate(confirmDelete.id)}
        onClose={() => setConfirmDelete({ show: false, id: null })}
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

// Modal Component for Create/Edit Assignment
interface AssignmentModalProps {
  assignment: MovieAssignment | null;
  onClose: () => void;
  onSuccess: () => void;
}

function AssignmentModal({ assignment, onClose, onSuccess }: AssignmentModalProps) {
  const [formData, setFormData] = useState({
    activeFrom: assignment?.activeFrom || "",
    activeTo: assignment?.activeTo || "",
    formats: assignment?.formats || "",
    languages: assignment?.languages || "",
  });
  
  // Create mode states
  const [selectedTheaterId, setSelectedTheaterId] = useState<number>(assignment?.theaterId || 0);
  const [selectedMovieIds, setSelectedMovieIds] = useState<Set<number>>(
    new Set(assignment ? [assignment.movieId] : [])
  );
  
  const [movieSearch, setMovieSearch] = useState("");
  const [error, setError] = useState("");

  // Fetch movies and theaters
  const { data: moviesData } = useQuery({
    queryKey: ["admin-movies-all"],
    queryFn: () => adminMovieApi.list({ size: 1000 }),
  });

  const { data: theatersData } = useQuery({
    queryKey: ["admin-theaters-all"],
    queryFn: () => adminTheaterApi.list({ size: 1000 }),
  });

  const movies = moviesData?.data?.items || [];
  const theaters = theatersData?.data?.items || [];

  const saveMut = useMutation({
    mutationFn: async (payload: any) => {
      if (assignment) {
        return adminMovieAssignmentApi.update(assignment.id, {
          activeFrom: payload.activeFrom || undefined,
          activeTo: payload.activeTo || undefined,
          formats: payload.formats || undefined,
          languages: payload.languages || undefined,
        });
      } else {
        // Bulk assign
        // payloads: theaterId, movieCodes list, and other fields
        // We need to map selectedMovieIds to codes
        const selectedMovies = movies.filter((m: any) => selectedMovieIds.has(m.id));
        const codes = selectedMovies.map((m: any) => m.code);
        
        return adminMovieAssignmentApi.assignBulk(selectedTheaterId, {
          movieCodes: codes,
          activeFrom: payload.activeFrom || undefined,
          activeTo: payload.activeTo || undefined,
          formats: payload.formats || undefined,
          languages: payload.languages || undefined,
        });
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment && (selectedMovieIds.size === 0 || !selectedTheaterId)) {
      setError("Vui lòng chọn rạp và ít nhất một phim");
      return;
    }
    saveMut.mutate(formData);
  };

  const toggleMovie = (id: number) => {
    const next = new Set(selectedMovieIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMovieIds(next);
  };

  const filteredMovies = movies.filter((m: any) => 
    !movieSearch || 
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) || 
    m.code.toLowerCase().includes(movieSearch.toLowerCase())
  );

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
          maxWidth: "700px",
          width: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
          {assignment ? "Chỉnh sửa gán phim" : "Gán phim mới (Nhiều phim)"}
        </h3>

        <form onSubmit={handleSubmit}>
          {assignment ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px", color: "#6c757d" }}>
                  Phim
                </label>
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  {assignment.movieTitle}
                  <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px", fontWeight: "normal" }}>
                    {assignment.movieCode}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px", color: "#6c757d" }}>
                  Rạp
                </label>
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  {assignment.theaterName}
                  <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px", fontWeight: "normal" }}>
                    {assignment.theaterCode}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Theater Select */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
                  Chọn Rạp <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <CustomDropdown
                  value={selectedTheaterId}
                  onChange={(val) => setSelectedTheaterId(Number(val))}
                  options={[
                    { value: 0, label: "-- Chọn rạp --" },
                    ...theaters.map((t: any) => ({
                      value: t.id,
                      label: `${t.name} (${t.code})`,
                    })),
                  ]}
                  placeholder="-- Chọn rạp --"
                  width="100%"
                />
              </div>

              {/* Movie Bulk Select */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
                  Chọn Phim ({selectedMovieIds.size} đã chọn) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                
                {/* Search box for movies */}
                <input 
                  type="text" 
                  placeholder="Tìm kiếm phim..." 
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "8px",
                    boxSizing: 'border-box'
                  }}
                />

                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    background: "#fff",
                  }}
                >
                  {filteredMovies.length === 0 ? (
                    <div style={{ padding: "12px", color: "#6c757d", fontSize: "13px", textAlign: "center" }}>
                      Không tìm thấy phim
                    </div>
                  ) : (
                    filteredMovies.map((m: any) => {
                      const isSelected = selectedMovieIds.has(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMovie(m.id)}
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #f1f3f4",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: isSelected ? "#eff6ff" : "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{ cursor: "pointer" }}
                          />
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: "13px", fontWeight: isSelected ? "500" : "400", color: "#374151" }}>
                              {m.title}
                            </div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>
                              {m.code}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280", textAlign: "right" }}>
                   <span 
                     style={{ cursor: "pointer", color: "#3b82f6", marginRight: "12px" }}
                     onClick={() => {
                       const allIds = filteredMovies.map((m: any) => m.id);
                       setSelectedMovieIds(new Set([...Array.from(selectedMovieIds), ...allIds]));
                     }}
                   >
                     Chọn tất cả kết quả
                   </span>
                   <span 
                     style={{ cursor: "pointer", color: "#ef4444" }}
                     onClick={() => setSelectedMovieIds(new Set())}
                   >
                     Bỏ chọn tất cả
                   </span>
                </div>
              </div>
            </>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
                Từ ngày
              </label>
              <input
                type="date"
                value={formData.activeFrom}
                onChange={(e) => setFormData({ ...formData, activeFrom: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
                Đến ngày
              </label>
              <input
                type="date"
                value={formData.activeTo}
                onChange={(e) => setFormData({ ...formData, activeTo: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
              Formats (ví dụ: 2D|3D|IMAX)
            </label>
            <input
              type="text"
              value={formData.formats}
              onChange={(e) => setFormData({ ...formData, formats: e.target.value })}
              placeholder="2D|3D|IMAX"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
              Languages (ví dụ: VI|EN)
            </label>
            <input
              type="text"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="VI|EN"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#dc2626",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
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
              Hủy
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                background: saveMut.isPending ? "#9ca3af" : "#3b82f6",
                color: "#ffffff",
                cursor: saveMut.isPending ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {saveMut.isPending ? "Đang lưu..." : assignment ? "Cập nhật" : `Gán ${selectedMovieIds.size} phim`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
