import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../services/apiClient";

export default function MovieManagement() {
  const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string>("");
  const [reqStatus, setReqStatus] = useState<
    "PENDING" | "SCHEDULED" | "APPROVED" | "REJECTED"
  >("PENDING");

  // New UI states: inline edit + modals
  const [editRow, setEditRow] = useState<{
    id: number;
    priority: number;
    demandScore: number;
  } | null>(null);
  const [createModal, setCreateModal] = useState<{
    movieId: number;
    title: string;
    priority: number;
    demandScore: number;
  } | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  // Fetch dashboard data to get assigned movies
  const {
    data: assignedMoviesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["staff-assigned-movies"],
    queryFn: async () => (await api.get("/api/staff/movies/assigned")).data,
  });

  // Publish movies mutation
  const publishMut = useMutation({
    mutationFn: (movieCodes: string[]) =>
      api.post("/api/staff/movies/publish", { movieCodes }).then((r) => r.data),
    onSuccess: (data) => {
      setNotice(`✅ ${data.message}`);
      setSelectedMovies(new Set());
      refetch(); // Refresh dashboard data
    },
    onError: (e: any) =>
      setNotice(
        `❌ ${e?.response?.data?.error || e?.message || "Lỗi khi publish phim"}`
      ),
  });

  // Create Movie Request mutation
  const createReqMut = useMutation({
    mutationFn: (payload: {
      movieId: number;
      priority?: number;
      demandScore?: number;
    }) => api.post("/api/staff/movies/requests", payload).then((r) => r.data),
    onSuccess: () => {
      setNotice("✅ Đã gửi yêu cầu chiếu phim");
      setCreateModal(null);
      refetchReqs();
    },
    onError: (e: any) =>
      setNotice(
        `❌ ${e?.response?.data?.error || e?.message || "Lỗi khi gửi yêu cầu"}`
      ),
  });

  const assignments = assignedMoviesData?.movies || [];
  const theater = assignedMoviesData?.theater;

  // Group movies by status (we'll need to check movie status)

  // Movies already have status from the API, no need to fetch separately

  const handlePublish = () => {
    if (selectedMovies.size === 0) {
      setNotice("❌ Vui lòng chọn ít nhất một phim để publish");
      return;
    }
    publishMut.mutate(Array.from(selectedMovies));
  };

  const toggleMovie = (movieCode: string) => {
    setSelectedMovies((prev) => {
      const next = new Set(prev);
      if (next.has(movieCode)) {
        next.delete(movieCode);
      } else {
        next.add(movieCode);
      }
      return next;
    });
  };

  const selectAllScheduled = () => {
    const scheduledMovies = assignments
      .filter((a: any) => a.status === "SCHEDULED")
      .map((a: any) => a.code);
    setSelectedMovies(new Set(scheduledMovies));
  };

  const clearSelection = () => {
    setSelectedMovies(new Set());
  };

  // Load requests by status
  const {
    data: requestsData,
    isLoading: loadingReqs,
    refetch: refetchReqs,
  } = useQuery({
    queryKey: ["staff-movie-requests", reqStatus],
    queryFn: async () =>
      (
        await api.get(`/api/staff/movie-requests`, {
          params: { status: reqStatus },
        })
      ).data,
  });

  // Update & Delete request mutations
  const updateReqMut = useMutation({
    mutationFn: (payload: {
      id: number;
      priority?: number;
      demandScore?: number;
    }) =>
      api
        .patch(`/api/staff/movies/requests/${payload.id}`, {
          priority: payload.priority,
          demandScore: payload.demandScore,
        })
        .then((r) => r.data),
    onSuccess: () => {
      setNotice("✅ Đã cập nhật yêu cầu");
      setEditRow(null);
      refetchReqs();
    },
    onError: (e: any) =>
      setNotice(
        `❌ ${e?.response?.data?.error || e?.message || "Lỗi khi cập nhật yêu cầu"}`
      ),
  });

  const deleteReqMut = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/staff/movies/requests/${id}`).then((r) => r.data),
    onSuccess: () => {
      setNotice("✅ Đã xoá yêu cầu");
      setDeleteModalId(null);
      refetchReqs();
    },
    onError: (e: any) =>
      setNotice(
        `❌ ${e?.response?.data?.error || e?.message || "Lỗi khi xoá yêu cầu"}`
      ),
  });

  if (isLoading) return <div className="section-box">Đang tải...</div>;
  if (error) return <div className="section-box">Lỗi tải dữ liệu</div>;

  return (
    <main className="container" style={{ padding: 16 }}>
      <section className="section-box">
        <h3 style={{ margin: 0 }}>Quản lý Movie Request</h3>
        {theater && (
          <div style={{ marginTop: 8, color: "#6c757d" }}>
            <strong>Rạp:</strong> {theater.name} ({theater.code})
          </div>
        )}
      </section>

      <section className="section-box" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(["PENDING", "SCHEDULED", "APPROVED", "REJECTED"] as const).map(
            (s) => (
              <button
                key={s}
                className="fd-btn"
                style={{
                  background: reqStatus === s ? "#8b7355" : "#fff",
                  color: reqStatus === s ? "#fff" : "#333",
                  border: "1px solid #d9d2b7",
                }}
                onClick={() => setReqStatus(s)}
              >
                {s}
              </button>
            )
          )}
        </div>
        {loadingReqs ? (
          <div>Đang tải yêu cầu...</div>
        ) : (
          <table
            width="100%"
            cellPadding={10}
            style={{
              background: "#fff",
              border: "1px solid #e9ecef",
              borderRadius: 6,
            }}
          >
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th align="left">Mã phim</th>
                <th align="left">Tiêu đề</th>
                <th align="left">Trạng thái</th>
                <th align="left">Ưu tiên</th>
                <th align="left">Điểm nhu cầu</th>
                <th align="left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(requestsData?.items || []).map((r: any) => {
                const isPending = r.status === "PENDING";
                const isEditing = editRow?.id === r.id;
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ fontFamily: "monospace" }}>{r.movieCode}</td>
                    <td>{r.movie?.title}</td>
                    <td>{r.status}</td>
                    <td>
                      {isPending ? (
                        isEditing ? (
                          <input
                            type="number"
                            value={editRow?.priority ?? 0}
                            style={{ width: 72 }}
                            onChange={(e) =>
                              setEditRow((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      priority: Number(e.target.value),
                                    }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          (r.priority ?? "-")
                        )
                      ) : (
                        (r.priority ?? "-")
                      )}
                    </td>
                    <td>
                      {isPending ? (
                        isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={editRow?.demandScore ?? 0}
                            style={{ width: 72 }}
                            onChange={(e) =>
                              setEditRow((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      demandScore: Number(e.target.value),
                                    }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          (r.demandScore ?? "-")
                        )
                      ) : (
                        (r.demandScore ?? "-")
                      )}
                    </td>
                    <td>
                      {isPending ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          {isEditing ? (
                            <>
                              <button
                                className="fd-btn"
                                style={{ padding: "4px 8px", fontSize: 12 }}
                                onClick={() =>
                                  updateReqMut.mutate({
                                    id: r.id,
                                    priority: editRow?.priority ?? r.priority,
                                    demandScore:
                                      editRow?.demandScore ?? r.demandScore,
                                  })
                                }
                                disabled={updateReqMut.isPending}
                              >
                                Lưu
                              </button>
                              <button
                                className="fd-btn"
                                style={{ padding: "4px 8px", fontSize: 12 }}
                                onClick={() => setEditRow(null)}
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <button
                              className="fd-btn"
                              style={{ padding: "4px 8px", fontSize: 12 }}
                              onClick={() =>
                                setEditRow({
                                  id: r.id,
                                  priority: r.priority ?? 0,
                                  demandScore: r.demandScore ?? 0,
                                })
                              }
                            >
                              Sửa
                            </button>
                          )}
                          <button
                            className="fd-btn"
                            style={{
                              padding: "4px 8px",
                              fontSize: 12,
                              color: "#a00",
                              borderColor: "#f1c0c0",
                            }}
                            onClick={() => setDeleteModalId(r.id)}
                            disabled={deleteReqMut.isPending}
                          >
                            Xoá
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#6c757d", fontSize: 12 }}>
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(requestsData?.items || []).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      color: "#6c757d",
                      padding: 16,
                    }}
                  >
                    Chưa có yêu cầu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {notice && (
        <section className="section-box" style={{ marginTop: 12 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 6,
              background: notice.includes("✅") ? "#e7f7e7" : "#ffeaea",
              color: notice.includes("✅") ? "#2d5a2d" : "#a00",
            }}
          >
            {notice}
          </div>
        </section>
      )}

      <section className="section-box" style={{ marginTop: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h4 style={{ margin: 0 }}>Phim đã assign (phục vụ publish)</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="fd-btn"
              onClick={selectAllScheduled}
              disabled={assignments.length === 0}
            >
              Chọn phim SCHEDULED
            </button>
            <button
              className="fd-btn"
              onClick={clearSelection}
              disabled={selectedMovies.size === 0}
            >
              Bỏ chọn tất cả
            </button>
            <button
              className="fd-btn"
              onClick={handlePublish}
              disabled={publishMut.isPending || selectedMovies.size === 0}
              style={{
                background: "#28a745",
                color: "white",
                border: "1px solid #28a745",
              }}
            >
              {publishMut.isPending
                ? "Đang publish..."
                : `Publish (${selectedMovies.size})`}
            </button>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div style={{ color: "#6c757d", textAlign: "center", padding: 24 }}>
            Không có phim nào được assign cho rạp này
          </div>
        ) : (
          <table
            width="100%"
            cellPadding={12}
            style={{
              background: "#fff",
              border: "1px solid #e9ecef",
              borderRadius: 6,
            }}
          >
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th align="left" style={{ padding: "12px 8px" }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedMovies.size > 0 &&
                      selectedMovies.size === assignments.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMovies(
                          new Set(assignments.map((a: any) => a.code))
                        );
                      } else {
                        setSelectedMovies(new Set());
                      }
                    }}
                  />
                </th>
                <th align="left">Mã phim</th>
                <th align="left">Tiêu đề</th>
                <th align="left">Trạng thái</th>
                <th align="left">Từ ngày</th>
                <th align="left">Đến ngày</th>
                <th align="left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment: any, idx: number) => {
                const status = assignment.status || "UNKNOWN";
                const isScheduled = status === "SCHEDULED";
                const isPublished = status === "PUBLISHED";

                return (
                  <tr
                    key={idx}
                    style={{
                      background: selectedMovies.has(assignment.code)
                        ? "#e7f7e7"
                        : "#fff",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <td style={{ padding: "12px 8px" }}>
                      <input
                        type="checkbox"
                        checked={selectedMovies.has(assignment.code)}
                        disabled={!isScheduled}
                        onChange={() => toggleMovie(assignment.code)}
                      />
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {assignment.code}
                    </td>
                    <td>{assignment.title}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: isScheduled
                            ? "#fff3cd"
                            : isPublished
                              ? "#d4edda"
                              : "#f8d7da",
                          color: isScheduled
                            ? "#856404"
                            : isPublished
                              ? "#155724"
                              : "#721c24",
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td>{assignment.activeFrom || "N/A"}</td>
                    <td>{assignment.activeTo || "N/A"}</td>
                    <td>
                      {isScheduled && (
                        <button
                          className="fd-btn"
                          style={{
                            background: "#28a745",
                            color: "white",
                            border: "1px solid #28a745",
                            padding: "4px 8px",
                            fontSize: 12,
                          }}
                          onClick={() => {
                            setSelectedMovies(new Set([assignment.code]));
                            handlePublish();
                          }}
                        >
                          Publish
                        </button>
                      )}
                      {!isScheduled && !isPublished && (
                        <button
                          className="fd-btn"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          onClick={() =>
                            setCreateModal({
                              movieId: assignment.id,
                              title: assignment.title,
                              priority: 0,
                              demandScore: 0,
                            })
                          }
                          disabled={createReqMut.isPending}
                        >
                          {createReqMut.isPending
                            ? "Đang gửi..."
                            : "Yêu cầu chiếu"}
                        </button>
                      )}
                      {isPublished && (
                        <span style={{ color: "#28a745", fontSize: 12 }}>
                          ✅ Đã publish
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Create Request Modal */}
      {createModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              width: 360,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: 8 }}>Yêu cầu chiếu</h4>
            <div style={{ color: "#6c757d", marginBottom: 12 }}>
              {createModal.title}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6c757d" }}>Ưu tiên</div>
                <input
                  type="number"
                  value={createModal.priority}
                  style={{ width: 120 }}
                  onChange={(e) =>
                    setCreateModal((m) =>
                      m ? { ...m, priority: Number(e.target.value) } : m
                    )
                  }
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6c757d" }}>
                  Điểm nhu cầu
                </div>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={1}
                  value={createModal.demandScore}
                  style={{ width: 120 }}
                  onChange={(e) =>
                    setCreateModal((m) =>
                      m ? { ...m, demandScore: Number(e.target.value) } : m
                    )
                  }
                />
              </div>
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="fd-btn" onClick={() => setCreateModal(null)}>
                Hủy
              </button>
              <button
                className="fd-btn"
                style={{
                  background: "#8b7355",
                  color: "#fff",
                  borderColor: "#8b7355",
                }}
                onClick={() =>
                  createReqMut.mutate({
                    movieId: createModal.movieId,
                    priority: createModal.priority,
                    demandScore: createModal.demandScore,
                  })
                }
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModalId !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              width: 360,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: 8 }}>Xoá yêu cầu</h4>
            <div style={{ color: "#6c757d", marginBottom: 12 }}>
              Bạn có chắc chắn muốn xoá yêu cầu này? Hành động không thể hoàn
              tác.
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button className="fd-btn" onClick={() => setDeleteModalId(null)}>
                Hủy
              </button>
              <button
                className="fd-btn"
                style={{
                  background: "#a00",
                  color: "#fff",
                  borderColor: "#a00",
                }}
                onClick={() => deleteReqMut.mutate(deleteModalId)}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="section-box" style={{ marginTop: 12 }}>
        <h4 style={{ margin: 0, marginBottom: 12 }}>Hướng dẫn</h4>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#6c757d" }}>
          <p>
            <strong>1. SCHEDULED:</strong> Phim đã được assign và có thể tạo
            showtime, chưa publish
          </p>
          <p>
            <strong>2. PUBLISHED:</strong> Phim đã được publish và xuất hiện
            trong "Phim đang chiếu"
          </p>
          <p>
            <strong>3. Publish:</strong> Chuyển phim từ SCHEDULED → PUBLISHED để
            customer có thể booking
          </p>
          <p>
            <strong>4. Lưu ý:</strong> Chỉ có thể publish phim ở trạng thái
            SCHEDULED
          </p>
        </div>
      </section>
    </main>
  );
}
