import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGenreApi, type Genre } from "../../services/adminGenreApi";
import ConfirmModal from "../../components/shared/ConfirmModal";
import ErrorModal from "../../components/shared/ErrorModal";
import "../../styles/admin-table.css";

// Genre Modal Component
const GenreModal = ({
  isOpen,
  onClose,
  genre,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  genre: Genre | null;
  onSave: (data: Genre) => void;
}) => {
  const [formData, setFormData] = useState<Genre>({ name: "", description: "" });

  // Update formData when genre prop changes
  useEffect(() => {
    if (isOpen) {
      setFormData(genre || { name: "", description: "" });
    }
  }, [isOpen, genre]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return; // Will be handled by parent component
    }
    onSave(formData);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: 0,
              color: "#1f2937",
            }}
          >
            {genre ? "✏️ Sửa thể loại" : "➕ Thêm thể loại mới"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.color = "#1f2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Tên thể loại <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Hành động, Kinh dị, Hài..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Mô tả
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả cho thể loại..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              background: "#f9fafb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "#fff",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#6366f1";
              }}
            >
              {genre ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function GenreList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    id: number | null;
    name: string;
  }>({ show: false, id: null, name: "" });
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Thông báo" });

  const { data } = useQuery({
    queryKey: ["admin-genres", q, page],
    queryFn: async () => (await adminGenreApi.list({ q, page, size })).data,
  });

  const createMut = useMutation({
    mutationFn: async (genre: Genre) => adminGenreApi.create(genre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-genres"] });
      setShowModal(false);
      setEditingGenre(null);
    },
    onError: () => {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Có lỗi khi tạo thể loại. Có thể tên đã tồn tại."
      });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, genre }: { id: number; genre: Genre }) =>
      adminGenreApi.update(id, genre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-genres"] });
      setShowModal(false);
      setEditingGenre(null);
    },
    onError: () => {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Có lỗi khi cập nhật thể loại"
      });
    },
  });

  const removeMut = useMutation({
    mutationFn: async (id: number) => adminGenreApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-genres"] });
      setConfirmDelete({ show: false, id: null, name: "" });
    },
  });

  const handleSave = (genre: Genre) => {
    if (!genre.name.trim()) {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Vui lòng nhập tên thể loại!"
      });
      return;
    }
    if (editingGenre && editingGenre.id) {
      updateMut.mutate({ id: editingGenre.id, genre });
    } else {
      createMut.mutate(genre);
    }
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingGenre(null);
    setShowModal(true);
  };

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
          <h3 style={{ margin: 0, lineHeight: 1 }}>Quản lý Thể loại</h3>
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
                height: "36px",
              }}
            >
              <input
                placeholder="Tìm theo tên thể loại..."
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
                  title="Xóa tìm kiếm"
                  style={{
                    border: "none",
                    borderRadius: 0,
                    borderLeft: "1px solid #dee2e6",
                    minWidth: "auto",
                    padding: "0 12px",
                    height: "100%",
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
            <button className="fd-btn" onClick={handleAdd}>
              + Thêm thể loại
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <colgroup>
                <col width="60" />
                <col width="200" />
                <col width="300" />
                <col width="140" />
              </colgroup>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Tên thể loại</th>
                  <th align="left">Mô tả</th>
                  <th align="left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map((g: Genre, idx: number) => (
                  <tr key={g.id ?? `g-${idx}`}>
                    <td>{g.id ?? "-"}</td>
                    <td className="cell-strong">{g.name}</td>
                    <td>
                      <div
                        className="cell-ellipsis-1-wide"
                        title={g.description || "Không có mô tả"}
                      >
                        {g.description || "Không có mô tả"}
                      </div>
                    </td>
                    <td>
                      <div className="action-group">
                        <button
                          className="btn-action"
                          onClick={() => handleEdit(g)}
                          aria-label={`Sửa thể loại ${g.name}`}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            setConfirmDelete({
                              show: true,
                              id: g.id ?? null,
                              name: g.name,
                            })
                          }
                          aria-label={`Xóa thể loại ${g.name}`}
                        >
                          Xóa
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
            Trước
          </button>
          <span
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Trang {page + 1}/{data?.totalPages || 1}
          </span>
          <button
            disabled={page + 1 >= (data?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background:
                page + 1 >= (data?.totalPages || 1) ? "#f9fafb" : "#ffffff",
              color:
                page + 1 >= (data?.totalPages || 1) ? "#9ca3af" : "#374151",
              cursor:
                page + 1 >= (data?.totalPages || 1) ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (page + 1 < (data?.totalPages || 1)) {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#9ca3af";
              }
            }}
            onMouseLeave={(e) => {
              if (page + 1 < (data?.totalPages || 1)) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5db";
              }
            }}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modals */}
      <GenreModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGenre(null);
        }}
        genre={editingGenre}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={confirmDelete.show}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa thể loại "${confirmDelete.name}"?`}
        onConfirm={() => {
          if (confirmDelete.id) {
            removeMut.mutate(confirmDelete.id);
          }
        }}
        onClose={() => setConfirmDelete({ show: false, id: null, name: "" })}
        confirmText="Xóa"
        cancelText="Hủy"
      />

      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Thông báo" })}
      />
    </div>
  );
}
