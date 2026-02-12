import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminMovieApi } from "../../services/adminMovieApi";
import "../../styles/admin-table.css";

export default function MovieIntakeList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);
  // Column visibility + sorting
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [visibleCols, setVisibleCols] = useState<{
    code: boolean;
    title: boolean;
    description: boolean;
    director: boolean;
    actors: boolean;
    duration: boolean;
    releaseDate: boolean;
    ageRating: boolean;
    genres: boolean;
    poster: boolean;
    actions: boolean;
  }>({
    code: true,
    title: true,
    description: true,
    director: true,
    actors: true,
    duration: true,
    releaseDate: true,
    ageRating: true,
    genres: true,
    poster: true,
    actions: true,
  });
  const [sort, setSort] = useState<{ key: string | null; dir: "asc" | "desc" }>(
    {
      key: null,
      dir: "asc",
    }
  );
  const columnPanelRef = useRef<HTMLDivElement>(null);
  const showNotice = (n: {
    type: "success" | "error" | "info";
    text: string;
  }) => {
    setNotice(n);
    window.setTimeout(() => setNotice(null), 3500);
  };

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-movies", debouncedQ, page],
    queryFn: async () =>
      (await adminMovieApi.list({ q: debouncedQ, page, size })).data,
  });

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => window.clearTimeout(t);
  }, [q]);

  // Close column panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnPanelRef.current &&
        !columnPanelRef.current.contains(event.target as Node)
      ) {
        setShowColumnPanel(false);
      }
    };
    if (showColumnPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showColumnPanel]);

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
        {notice && (
          <div
            style={{
              marginBottom: 12,
              padding: "8px 12px",
              borderRadius: 6,
              border: `1px solid ${notice.type === "error" ? "#f5c2c7" : notice.type === "success" ? "#badbcc" : "#bcd0f7"}`,
              background:
                notice.type === "error"
                  ? "#f8d7da"
                  : notice.type === "success"
                    ? "#d1e7dd"
                    : "#cfe2ff",
              color: "#333",
            }}
          >
            {notice.text}
          </div>
        )}
        <div className="admin-toolbar">
          <h3 style={{ margin: 0, lineHeight: 1 }}>Movie Intake</h3>
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
                placeholder="Tìm theo mã, tiêu đề..."
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
              onClick={() => navigate("/admin/movies/create")}
            >
              + Thêm phim
            </button>

            <div style={{ position: "relative" }} ref={columnPanelRef}>
              <button
                className="fd-btn btn-secondary"
                onClick={() => setShowColumnPanel((s) => !s)}
                aria-expanded={showColumnPanel}
                aria-haspopup="true"
                title="Ẩn/hiện cột"
                style={{ marginTop: 0 }}
              >
                ⚙ Cột
                {Object.values(visibleCols).filter(Boolean).length <
                Object.keys(visibleCols).length
                  ? ` (${Object.keys(visibleCols).length - Object.values(visibleCols).filter(Boolean).length})`
                  : ""}
              </button>
              {showColumnPanel && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    background: "#fff",
                    border: "1px solid #e9ecef",
                    borderRadius: 8,
                    padding: 10,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                    zIndex: 10,
                    minWidth: 220,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottom: "1px solid #e9ecef",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="fd-btn btn-secondary"
                      style={{ fontSize: 12, padding: "4px 8px", height: 28 }}
                      onClick={() => {
                        const allVisible = Object.keys(visibleCols).reduce(
                          (acc, key) => ({ ...acc, [key]: true }),
                          {} as typeof visibleCols
                        );
                        setVisibleCols(allVisible);
                      }}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      className="fd-btn btn-secondary"
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        height: 28,
                      }}
                      onClick={() => {
                        const allHidden = Object.keys(visibleCols).reduce(
                          (acc, key) => ({ ...acc, [key]: false }),
                          {} as typeof visibleCols
                        );
                        setVisibleCols(allHidden);
                      }}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                  {(
                    [
                      ["code", "Mã"],
                      ["title", "Tiêu đề"],
                      ["description", "Mô tả"],
                      ["director", "Đạo diễn"],
                      ["actors", "Diễn viên"],
                      ["duration", "Thời lượng"],
                      ["releaseDate", "Phát hành"],
                      ["ageRating", "Độ tuổi"],
                      ["genres", "Thể loại"],
                      ["poster", "Poster"],
                      ["actions", "Hành động"],
                    ] as [keyof typeof visibleCols, string][]
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "4px 2px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols[key]}
                        onChange={(e) =>
                          setVisibleCols((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="fd-btn"
              style={{
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.7 : 1,
              }}
              title="Import CSV"
              onClick={() => {
                if (!uploading) fileRef.current?.click();
              }}
            >
              {uploading ? "Đang xử lý..." : "Import"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploading(true);
                  const data = await adminMovieApi.importPreview(file);
                  setPreview(data);
                  const valid = new Set<number>();
                  (data.rows || []).forEach((r: any) => {
                    if (!r.errors || r.errors.length === 0) valid.add(r.line);
                  });
                  setSelectedLines(valid);
                } catch (err) {
                  showNotice({
                    type: "error",
                    text: "Có lỗi khi preview CSV",
                  });
                } finally {
                  if (fileRef.current) fileRef.current.value = "";
                  setUploading(false);
                }
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {isLoading ? (
            <div>Đang tải...</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <colgroup>
                  <col width="72" />
                  {visibleCols.code && <col width="100" />}
                  {visibleCols.title && <col width="200" />}
                  {visibleCols.description && <col width="300" />}
                  {visibleCols.director && <col width="160" />}
                  {visibleCols.actors && <col width="220" />}
                  {visibleCols.duration && <col width="110" />}
                  {visibleCols.releaseDate && <col width="120" />}
                  {visibleCols.ageRating && <col width="90" />}
                  {visibleCols.genres && <col width="180" />}
                  {visibleCols.poster && <col width="66" />}
                  {visibleCols.actions && <col width="180" />}
                </colgroup>
                <thead>
                  <tr>
                    <th align="left" className="sticky-col-left">
                      ID
                    </th>
                    {visibleCols.code && (
                      <th
                        align="left"
                        className={`th-sortable ${sort.key === "code" ? "active" : ""}`}
                        onClick={() =>
                          setSort((s) => ({
                            key: "code",
                            dir:
                              s.key === "code" && s.dir === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Mã{" "}
                        <span className="sort-icon">
                          {sort.key === "code"
                            ? sort.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </th>
                    )}
                    {visibleCols.title && (
                      <th
                        align="left"
                        className={`th-sortable ${sort.key === "title" ? "active" : ""}`}
                        onClick={() =>
                          setSort((s) => ({
                            key: "title",
                            dir:
                              s.key === "title" && s.dir === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Tiêu đề{" "}
                        <span className="sort-icon">
                          {sort.key === "title"
                            ? sort.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </th>
                    )}
                    {visibleCols.description && <th align="left">Mô tả</th>}
                    {visibleCols.director && (
                      <th
                        align="left"
                        className={`th-sortable ${sort.key === "director" ? "active" : ""}`}
                        onClick={() =>
                          setSort((s) => ({
                            key: "director",
                            dir:
                              s.key === "director" && s.dir === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Đạo diễn{" "}
                        <span className="sort-icon">
                          {sort.key === "director"
                            ? sort.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </th>
                    )}
                    {visibleCols.actors && <th align="left">Diễn viên</th>}
                    {visibleCols.duration && (
                      <th
                        className={`text-right th-sortable ${sort.key === "duration" ? "active" : ""}`}
                        onClick={() =>
                          setSort((s) => ({
                            key: "duration",
                            dir:
                              s.key === "duration" && s.dir === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Thời lượng{" "}
                        <span className="sort-icon">
                          {sort.key === "duration"
                            ? sort.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </th>
                    )}
                    {visibleCols.releaseDate && (
                      <th
                        align="left"
                        className={`th-sortable ${sort.key === "releaseDate" ? "active" : ""}`}
                        onClick={() =>
                          setSort((s) => ({
                            key: "releaseDate",
                            dir:
                              s.key === "releaseDate" && s.dir === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Phát hành{" "}
                        <span className="sort-icon">
                          {sort.key === "releaseDate"
                            ? sort.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </th>
                    )}
                    {visibleCols.ageRating && (
                      <th
                        align="left"
                        className={`th-sortable ${sort.key === "ageRating" ? "active" : ""}`}
                        onClick={() =>
                          setSort((s) => ({
                            key: "ageRating",
                            dir:
                              s.key === "ageRating" && s.dir === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Độ tuổi{" "}
                        <span className="sort-icon">
                          {sort.key === "ageRating"
                            ? sort.dir === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </th>
                    )}
                    {visibleCols.genres && <th align="left">Thể loại</th>}
                    {visibleCols.poster && <th align="left">Poster</th>}
                    {visibleCols.actions && <th align="left">Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const items = (data?.items || []).slice();
                    if (sort.key) {
                      items.sort((a: any, b: any) => {
                        const va = a[sort.key as any];
                        const vb = b[sort.key as any];
                        if (va == null && vb == null) return 0;
                        if (va == null) return sort.dir === "asc" ? -1 : 1;
                        if (vb == null) return sort.dir === "asc" ? 1 : -1;
                        if (typeof va === "number" && typeof vb === "number") {
                          return sort.dir === "asc" ? va - vb : vb - va;
                        }
                        const sa = String(va).toLowerCase();
                        const sb = String(vb).toLowerCase();
                        if (sa < sb) return sort.dir === "asc" ? -1 : 1;
                        if (sa > sb) return sort.dir === "asc" ? 1 : -1;
                        return 0;
                      });
                    }
                    return items;
                  })().map((m: any) => (
                    <tr key={m.id}>
                      <td className="sticky-col-left">{m.id}</td>
                      {visibleCols.code && <td>{m.code}</td>}
                      {visibleCols.title && (
                        <td>
                          <div
                            className="cell-strong cell-ellipsis-1"
                            title={m.title}
                          >
                            {m.title}
                          </div>
                        </td>
                      )}
                      {visibleCols.description && (
                        <td className="cell-ellipsis-2" title={m.description}>
                          {m.description}
                        </td>
                      )}
                      {visibleCols.director && (
                        <td>
                          <div className="cell-ellipsis-1" title={m.director}>
                            {m.director}
                          </div>
                        </td>
                      )}
                      {visibleCols.actors && (
                        <td className="cell-ellipsis-1-wide" title={m.actors}>
                          {m.actors}
                        </td>
                      )}
                      {visibleCols.duration && (
                        <td
                          className="text-right cell-ellipsis-1"
                          title={`${m.duration} phút`}
                        >
                          {m.duration} phút
                        </td>
                      )}
                      {visibleCols.releaseDate && (
                        <td className="cell-ellipsis-1" title={m.releaseDate}>
                          {m.releaseDate}
                        </td>
                      )}
                      {visibleCols.ageRating && (
                        <td className="cell-ellipsis-1" title={m.ageRating}>
                          {m.ageRating}
                        </td>
                      )}
                      {visibleCols.genres && (
                        <td
                          className="cell-ellipsis-1-wide"
                          title={(m.genres || []).join(", ")}
                        >
                          {(m.genres || []).join(", ")}
                        </td>
                      )}
                      {visibleCols.poster && (
                        <td>
                          {m.posterUrl ? (
                            <img
                              src={m.posterUrl}
                              alt="poster"
                              style={{
                                width: 40,
                                height: 56,
                                objectFit: "contain",
                                borderRadius: 4,
                              }}
                            />
                          ) : (
                            <span style={{ color: "#888" }}>N/A</span>
                          )}
                        </td>
                      )}
                      {visibleCols.actions && (
                        <td>
                          <div className="action-group">
                            <button
                              className="btn-action btn-view"
                              onClick={() =>
                                navigate(`/admin/movies/${m.id}/view`)
                              }
                            >
                              View
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() =>
                                navigate(`/admin/movies/${m.id}/edit`)
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => setPendingDelete(m)}
                              aria-label={`Xóa phim ${m.title}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              {page + 1} / {data?.totalPages || 1}
            </div>

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
                  page + 1 >= (data?.totalPages || 1)
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
              Sau →
            </button>
          </div>
        </div>
      </div>
      {preview && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "24px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f1f3f4",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Preview import
            </h4>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                display: "flex",
                gap: "16px",
              }}
            >
              <span>
                Rows:{" "}
                <strong style={{ color: "#374151" }}>{preview.total}</strong>
              </span>
              <span>
                Errors:{" "}
                <strong
                  style={{
                    color: preview.errorCount > 0 ? "#dc2626" : "#059669",
                  }}
                >
                  {preview.errorCount}
                </strong>
              </span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              className="admin-table"
              style={{
                width: "100%",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                overflow: "hidden",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>
                    <input
                      type="checkbox"
                      checked={
                        (preview.rows || []).filter(
                          (r: any) => !r.errors || r.errors.length === 0
                        ).length > 0 &&
                        selectedLines.size ===
                          (preview.rows || []).filter(
                            (r: any) => !r.errors || r.errors.length === 0
                          ).length
                      }
                      onChange={(e) => {
                        const all = new Set<number>();
                        if (e.target.checked) {
                          (preview.rows || []).forEach((r: any) => {
                            if (!r.errors || r.errors.length === 0)
                              all.add(r.line);
                          });
                        }
                        setSelectedLines(all);
                      }}
                    />
                  </th>
                  <th style={{ width: "40px" }}>#</th>
                  <th style={{ width: "100px" }}>Mã</th>
                  <th style={{ width: "200px" }}>Tiêu đề</th>
                  <th style={{ width: "300px" }}>Mô tả</th>
                  <th style={{ width: "150px" }}>Đạo diễn</th>
                  <th style={{ width: "250px" }}>Diễn viên</th>
                  <th style={{ width: "120px" }}>Thời lượng</th>
                  <th style={{ width: "140px" }}>Ngày phát hành</th>
                  <th style={{ width: "80px" }}>Độ tuổi</th>
                  <th style={{ width: "100px" }}>Định dạng</th>
                  <th style={{ width: "100px" }}>Ngôn ngữ</th>
                  <th style={{ width: "80px" }}>Ưu tiên</th>
                  <th style={{ width: "120px" }}>Điểm nhu cầu</th>
                  <th style={{ width: "200px" }}>YouTube URL</th>
                  <th style={{ width: "180px" }}>Thể loại</th>
                  <th style={{ width: "250px" }}>Lỗi</th>
                  <th style={{ width: "250px" }}>Cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {(preview.rows || []).map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ width: "30px" }}>
                      <input
                        type="checkbox"
                        checked={selectedLines.has(r.line)}
                        disabled={
                          uploading || (r.errors && r.errors.length > 0)
                        }
                        onChange={(e) => {
                          setSelectedLines((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(r.line);
                            else next.delete(r.line);
                            return next;
                          });
                        }}
                      />
                    </td>
                    <td
                      style={{
                        width: "40px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {r.line}
                    </td>
                    <td
                      style={{
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.code}
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.title}
                    </td>
                    <td
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.description}
                    </td>
                    <td
                      style={{
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.director}
                    </td>
                    <td
                      style={{
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.actors}
                    </td>
                    <td
                      style={{
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {r.data?.duration}
                    </td>
                    <td
                      style={{
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {r.data?.releaseDate}
                    </td>
                    <td
                      style={{
                        maxWidth: "80px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {r.data?.ageRating}
                    </td>
                    <td
                      style={{
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.formats}
                    </td>
                    <td
                      style={{
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.languages}
                    </td>
                    <td
                      style={{
                        maxWidth: "80px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {r.data?.priority}
                    </td>
                    <td
                      style={{
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {r.data?.demandScore}
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.data?.youtubeUrl}
                    </td>
                    <td
                      style={{
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(r.data?.genres || []).join(", ")}
                    </td>
                    <td
                      style={{
                        color: "#dc3545",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(r.errors || []).join("; ")}
                    </td>
                    <td
                      style={{
                        color: "#856404",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(r.warnings || []).join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f3f4",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => {
                const validRows = (preview.rows || []).filter(
                  (r: any) => !r.errors || r.errors.length === 0
                );
                const allValid =
                  validRows.length > 0 &&
                  selectedLines.size === validRows.length;

                if (allValid) {
                  // Nếu đã chọn tất cả thì bỏ chọn tất cả
                  setSelectedLines(new Set());
                } else {
                  // Nếu chưa chọn tất cả thì chọn tất cả
                  const all = new Set<number>();
                  validRows.forEach((r: any) => all.add(r.line));
                  setSelectedLines(all);
                }
              }}
              disabled={uploading}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#ffffff",
                color: "#374151",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.15s ease",
                opacity: uploading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }
              }}
            >
              {(() => {
                const validRows = (preview.rows || []).filter(
                  (r: any) => !r.errors || r.errors.length === 0
                );
                const allValid =
                  validRows.length > 0 &&
                  selectedLines.size === validRows.length;
                return allValid ? "Bỏ chọn tất cả" : "Chọn tất cả";
              })()}
            </button>
            <button
              disabled={
                uploading ||
                selectedLines.size === 0 ||
                (preview.rows || []).filter((r: any) =>
                  selectedLines.has(r.line)
                ).length === 0
              }
              onClick={async () => {
                try {
                  setUploading(true);
                  const rows = (preview.rows || []).filter(
                    (r: any) =>
                      selectedLines.has(r.line) &&
                      (!r.errors || r.errors.length === 0)
                  );
                  const res = await adminMovieApi.importConfirm(rows);
                  showNotice({
                    type: "success",
                    text: `Imported: ${res.data?.imported ?? 0}, Updated: ${res.data?.updated ?? 0}, Skipped: ${res.data?.skipped ?? 0}`,
                  });
                  setPreview(null);
                  setSelectedLines(new Set());
                  await qc.invalidateQueries({ queryKey: ["admin-movies"] });
                } catch (e: any) {
                  const msg =
                    e?.response?.data?.error ||
                    e?.message ||
                    "Confirm import lỗi";
                  showNotice({ type: "error", text: msg });
                } finally {
                  setUploading(false);
                }
              }}
              style={{
                padding: "8px 16px",
                border: "1px solid #3b82f6",
                borderRadius: "6px",
                background: uploading ? "#9ca3af" : "#3b82f6",
                color: "#ffffff",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = "#2563eb";
                  e.currentTarget.style.borderColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.borderColor = "#3b82f6";
                }
              }}
            >
              {uploading ? "Đang import..." : "Confirm import"}
            </button>
            <button
              disabled={uploading}
              onClick={() => setPreview(null)}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#ffffff",
                color: "#374151",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.15s ease",
                opacity: uploading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
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
            zIndex: 50,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setPendingDelete(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "min(480px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              border: "1px solid #e5e7eb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px 16px",
                borderBottom: "1px solid #f1f3f4",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#dc2626",
                }}
              >
                ⚠
              </div>
              <div
                id="delete-title"
                style={{ fontWeight: 600, fontSize: 16, color: "#1f2937" }}
              >
                Xác nhận xoá phim
              </div>
            </div>
            <div
              style={{
                padding: "20px 24px",
                color: "#4b5563",
                lineHeight: 1.5,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                Bạn có chắc chắn muốn xoá phim này không?
              </div>
              <div
                style={{
                  background: "#f9fafb",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 500, color: "#374151" }}>
                  {pendingDelete.title}
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
                  border: "1px solid #fde68a",
                }}
              >
                ⚠ Hành động này không thể hoàn tác
              </div>
            </div>
            <div
              style={{
                padding: "16px 24px 20px",
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                borderTop: "1px solid #f1f3f4",
              }}
            >
              <button
                onClick={() => setPendingDelete(null)}
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "#f9fafb",
                  color: "#374151",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              >
                Huỷ
              </button>
              <button
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "1px solid #dc2626",
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: "6px",
                  cursor: "pointer",
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
                    await adminMovieApi.remove(pendingDelete.id);
                    await qc.invalidateQueries({ queryKey: ["admin-movies"] });
                    setPendingDelete(null);
                    showNotice({
                      type: "success",
                      text: "Xoá phim thành công",
                    });
                  } catch (e: any) {
                    showNotice({
                      type: "error",
                      text: e?.message || "Xoá phim thất bại",
                    });
                  }
                }}
              >
                Xoá phim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
