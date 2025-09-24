import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGenreApi, type Genre } from "../../services/adminGenreApi";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-table.css";

export default function GenreList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<
    "name" | "description" | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-genres", q, page],
    queryFn: async () => (await adminGenreApi.list({ q, page, size })).data,
  });

  const removeMut = useMutation({
    mutationFn: async (id: number) => adminGenreApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-genres"] }),
  });

  const updateMut = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: number;
      field: "name" | "description";
      value: string;
    }) => {
      // Always send both name and description to avoid backend issues
      const currentGenre = data?.items?.find((g: Genre) => g.id === id);
      const updateData = {
        name: field === "name" ? value : currentGenre?.name || "",
        description:
          field === "description" ? value : currentGenre?.description || "",
      };
      return adminGenreApi.update(id, updateData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-genres"] });
    },
    onError: () => {
      alert("Có lỗi khi cập nhật thể loại");
    },
  });

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
                height: "36px", // Match button height
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
              onClick={() => navigate("/admin/genres/create")}
            >
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
                    <td className="cell-strong">
                      {editingId === g.id && editingField === "name" ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              if (
                                editingValue.trim() &&
                                editingValue !== (g.name || "") &&
                                typeof g.id === "number"
                              ) {
                                updateMut.mutate({
                                  id: g.id,
                                  field: "name",
                                  value: editingValue.trim(),
                                });
                              }
                              setEditingId(null);
                              setEditingField(null);
                              setEditingValue("");
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingField(null);
                              setEditingValue("");
                            }
                          }}
                          onBlur={() => {
                            setEditingId(null);
                            setEditingField(null);
                            setEditingValue("");
                          }}
                          autoFocus
                          disabled={updateMut.isPending}
                          style={{
                            border: "1px solid #6366f1",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            width: "100%",
                            outline: "none",
                            opacity: updateMut.isPending ? 0.6 : 1,
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingId(typeof g.id === "number" ? g.id : null);
                            setEditingField("name");
                            setEditingValue(g.name || "");
                          }}
                          style={{
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f0f4ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {g.name}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === g.id && editingField === "description" ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              if (
                                editingValue !== (g.description || "") &&
                                typeof g.id === "number"
                              ) {
                                updateMut.mutate({
                                  id: g.id,
                                  field: "description",
                                  value: editingValue.trim(),
                                });
                              }
                              setEditingId(null);
                              setEditingField(null);
                              setEditingValue("");
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingField(null);
                              setEditingValue("");
                            }
                          }}
                          onBlur={() => {
                            setEditingId(null);
                            setEditingField(null);
                            setEditingValue("");
                          }}
                          placeholder="Nhập mô tả..."
                          disabled={updateMut.isPending}
                          style={{
                            border: "1px solid #6366f1",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            width: "100%",
                            outline: "none",
                            opacity: updateMut.isPending ? 0.6 : 1,
                          }}
                        />
                      ) : (
                        <div
                          className="cell-ellipsis-1-wide"
                          title={g.description || "Không có mô tả"}
                          onClick={() => {
                            setEditingId(typeof g.id === "number" ? g.id : null);
                            setEditingField("description");
                            setEditingValue(g.description || "");
                          }}
                          style={{
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f0f4ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {g.description || "Không có mô tả"}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-group">
                        {confirmDeleteId === g.id ? (
                          <>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => {
                                if (typeof g.id === "number") {
                                  removeMut.mutate(g.id);
                                }
                                setConfirmDeleteId(null);
                              }}
                              aria-label={`Xác nhận xóa thể loại ${g.name}`}
                            >
                              Xác nhận
                            </button>
                            <button
                              className="btn-action"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => setConfirmDeleteId(g.id ?? null)}
                            aria-label={`Xóa thể loại ${g.name}`}
                          >
                            Delete
                          </button>
                        )}
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
    </div>
  );
}
