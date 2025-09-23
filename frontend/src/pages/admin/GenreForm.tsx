import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGenreApi, type Genre } from "../../services/adminGenreApi";

export default function GenreForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<Genre>({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      adminGenreApi.get(Number(id)).then((res) => setForm(res.data));
    }
  }, [id, isEdit]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) await adminGenreApi.update(Number(id), form);
      else await adminGenreApi.create(form);
      navigate("/admin/genres", { replace: true });
    } finally {
      setLoading(false);
    }
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
          <h3 style={{ margin: 0, lineHeight: 1 }}>
            {isEdit ? "Chỉnh sửa thể loại" : "Thêm thể loại"}
          </h3>
          <div className="admin-toolbar-actions">
            <button
              className="fd-btn"
              onClick={() => navigate("/admin/genres")}
            >
              ↩ Quay lại
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: 720,
            }}
          >
            <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  Tên thể loại
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    outline: "none",
                    fontSize: 14,
                    background: "#fff",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#6366f1")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#d1d5db")
                  }
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  Mô tả
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    outline: "none",
                    fontSize: 14,
                    background: "#fff",
                    resize: "vertical",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#6366f1")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#d1d5db")
                  }
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  className="fd-btn"
                  onClick={() => navigate("/admin/genres")}
                  style={{
                    background: "#fff",
                    color: "#64748b",
                    border: "1px solid #64748b",
                  }}
                >
                  Hủy
                </button>
                <button className="fd-btn" disabled={loading} type="submit">
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
