import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { staffSchedulingApi } from "../../services/staffSchedulingApi";
import api from "../../services/apiClient";

// Progress bar styles are now handled inline with dynamic width

// Timeline View Component
function TimelineView({
  rows,
  selectedCodes,
  onToggleCode,
  onDeleteRow,
}: {
  rows: any[];
  selectedCodes: Set<string>;
  onToggleCode: (code: string) => void;
  onDeleteRow: (id: string) => void;
}) {
  // Fixed time slot width for precise alignment
  const timeSlotWidth = 40; // Fixed width in pixels

  // Group by date and room
  const timelineData = useMemo(() => {
    const grouped: Record<string, Record<string, any[]>> = {};

    rows.forEach((row) => {
      const date = row.showDate;
      const room = row.roomName;

      if (!grouped[date]) grouped[date] = {};
      if (!grouped[date][room]) grouped[date][room] = [];

      grouped[date][room].push(row);
    });

    return grouped;
  }, [rows]);

  // Get all unique dates and rooms
  const dates = Object.keys(timelineData).sort();
  const allRooms = useMemo(() => {
    const rooms = new Set<string>();
    Object.values(timelineData).forEach((dayData) => {
      Object.keys(dayData).forEach((room) => rooms.add(room));
    });
    return Array.from(rooms).sort();
  }, [timelineData]);

  // Time slots from 8:00 to 23:00 (every 30 minutes)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  // Get showtime color based on movie code
  const getMovieColor = (movieCode: string) => {
    const colors = [
      "#e3f2fd",
      "#f3e5f5",
      "#e8f5e8",
      "#fff3e0",
      "#fce4ec",
      "#e0f2f1",
      "#f1f8e9",
      "#fff8e1",
      "#e3f2fd",
      "#f3e5f5",
    ];
    const hash = movieCode.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Calculate showtime position and width
  const getShowtimeStyle = (row: any) => {
    const startTime = row.showTime;
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    // Duration from row data (default 120 minutes if not available)
    const duration = row.duration || 120;

    // Position: 8:00 = 0, each 30min = 1 unit
    const startPosition = (startMinutes - 8 * 60) / 30;

    // Calculate width based on actual duration in minutes
    // Each 30-minute slot = 40px, so 1 minute = 40/30 = 1.33px
    const widthInMinutes = duration;
    const contentWidthPx = Math.round((widthInMinutes / 30) * timeSlotWidth);

    // Add border (1px each side = 2px total) and padding (4px each side = 8px total)
    // Total width = content + border + padding = contentWidth + 2 + 8 = contentWidth + 10
    const widthPx = contentWidthPx + 10;

    // Use measured time slot width instead of hardcoded value
    // For 10:00, this should be: (600 - 480) / 30 = 120 / 30 = 4
    // So left should be 4 * timeSlotWidth, which should align with 10:00 column

    // Ensure position is within bounds and round to avoid floating point errors
    const clampedPosition = Math.max(0, Math.round(startPosition * 100) / 100);
    const leftPx = Math.round(clampedPosition * timeSlotWidth);

    return {
      position: "absolute" as const,
      left: `${leftPx}px`, // Use rounded pixel value
      width: `${widthPx}px`,
      height: "28px",
      backgroundColor: getMovieColor(row.movieCode),
      border: "1px solid #ccc",
      borderRadius: "3px",
      fontSize: "10px",
      padding: "2px 4px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      zIndex: 1,
      top: "3px",
      transition: "all 0.2s ease",
      cursor: "pointer",
      boxSizing: "border-box" as const, // Ensure border/padding included in width
      minWidth: `${widthPx}px`, // Force minimum width
      maxWidth: `${widthPx}px`, // Force maximum width
    };
  };

  // Get unique movies for legend
  const uniqueMovies = useMemo(() => {
    const movies = new Map();
    rows.forEach((row) => {
      if (!movies.has(row.movieCode)) {
        movies.set(row.movieCode, {
          code: row.movieCode,
          title: row.movie?.title || "N/A",
          color: getMovieColor(row.movieCode),
        });
      }
    });
    return Array.from(movies.values());
  }, [rows]);

  if (dates.length === 0) {
    return <div style={{ color: "#6c757d" }}>Không có dữ liệu để hiển thị</div>;
  }

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          marginBottom: "12px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {uniqueMovies.map((movie) => (
          <button
            key={movie.code}
            type="button"
            onClick={() => onToggleCode(movie.code)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              border: selectedCodes.has(movie.code)
                ? "1px solid #8b7355"
                : "1px solid #e9ecef",
              borderRadius: "4px",
              background: selectedCodes.has(movie.code) ? "#fff7e6" : "#fff",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: movie.color,
                border: "1px solid #ccc",
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>
              {movie.code}
            </span>
            <span style={{ fontSize: "11px", color: "#6c757d" }}>
              {movie.title}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline Table */}
      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e9ecef",
          borderRadius: "6px",
        }}
      >
        <table style={{ borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #e9ecef",
                  padding: "8px",
                  background: "#f8f9fa",
                  position: "sticky",
                  left: 0,
                  zIndex: 10,
                }}
              >
                Ngày / Phòng
              </th>
              {timeSlots.map((time) => (
                <th
                  key={time}
                  style={{
                    border: "none",
                    borderRight: "1px solid #e9ecef",
                    padding: "4px 0",
                    background: "#f8f9fa",
                    fontSize: "10px",
                    width: "40px",
                    minWidth: "40px",
                    maxWidth: "40px",
                    textAlign: "center",
                    boxSizing: "border-box",
                    flexShrink: 0,
                  }}
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr key={date}>
                <td
                  style={{
                    border: "1px solid #e9ecef",
                    padding: "6px",
                    background: "#f8f9fa",
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    fontWeight: "bold",
                    minWidth: "180px",
                  }}
                >
                  <div style={{ fontSize: "12px" }}>{date}</div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#6c757d",
                      fontWeight: "normal",
                    }}
                  >
                    {new Date(date).toLocaleDateString("vi-VN", {
                      weekday: "long",
                    })}
                  </div>
                </td>
                <td
                  colSpan={timeSlots.length}
                  style={{
                    border: "1px solid #e9ecef",
                    padding: 0,
                    position: "relative",
                    height: `${allRooms.length * 35}px`,
                  }}
                >
                  {allRooms.map((room) => (
                    <div
                      key={room}
                      style={{
                        position: "relative",
                        height: "35px",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "-120px",
                          top: "6px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          width: "110px",
                          textAlign: "right",
                          color: "#495057",
                          zIndex: 10,
                          background: "#f8f9fa",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          transition:
                            "background-color 0.2s ease, color 0.2s ease",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#e9ecef";
                          e.currentTarget.style.color = "#343a40";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f8f9fa";
                          e.currentTarget.style.color = "#495057";
                        }}
                      >
                        {room}
                      </div>
                      {timelineData[date]?.[room]
                        ?.filter(
                          (row: any) =>
                            selectedCodes.size === 0 ||
                            selectedCodes.has(row.movieCode)
                        )
                        .map((row, idx) => {
                          const [startHour, startMinute] = row.showTime
                            .split(":")
                            .map(Number);
                          const movieDuration = row.duration || 120; // Use actual duration from row
                          const endTime = new Date(
                            0,
                            0,
                            0,
                            startHour,
                            startMinute + movieDuration
                          );
                          const endTimeStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

                          return (
                            <div
                              key={idx}
                              style={getShowtimeStyle(row)}
                              title={`${row.movieCode} - ${row.showTime} → ${endTimeStr} (${row.movie?.title || "N/A"})${row.errors && row.errors.length ? "\nClick để xoá (invalid)" : ""}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.zIndex = "10";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(0,0,0,0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.zIndex = "1";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                              onClick={() => {
                                if (
                                  row.errors &&
                                  row.errors.length &&
                                  row.__id
                                ) {
                                  onDeleteRow(row.__id as string);
                                }
                              }}
                            >
                              <div
                                style={{ fontSize: "9px", fontWeight: "bold" }}
                              >
                                {row.movieCode}
                              </div>
                              <div style={{ fontSize: "8px" }}>
                                {row.showTime}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StaffScheduling() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // CSV input removed; selection UI will drive codes. If không chọn mã → coi như tất cả
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<string>("");
  const [commitErrors, setCommitErrors] = useState<string[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<number>>(
    new Set()
  );
  // Movie code filter controlled by Legend chips
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [onlyValid, setOnlyValid] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  // Fetch pending movie requests for this staff/theater
  const requestsQ = useQuery({
    queryKey: ["staff-pending-requests"],
    queryFn: async () =>
      (
        await api.get("/api/staff/movie-requests", {
          params: { status: "PENDING" },
        })
      ).data,
  });
  const requestOptions: any[] = useMemo(
    () => requestsQ.data?.items || [],
    [requestsQ.data]
  );

  const previewMut = useMutation({
    mutationFn: (payload: {
      startDate: string;
      endDate: string;
      codes?: string;
    }) => staffSchedulingApi.preview(payload).then((r) => r.data),
    onMutate: () => {
      // Reset progress when starting
      setProgress(0);
      // Start polling real progress from backend
      const interval = setInterval(async () => {
        try {
          const response = await api.get("/api/staff/scheduling/progress");
          const data = response.data;
          setProgress(data.percentage || 0);

          // Stop polling when completed
          if (data.status === "completed") {
            clearInterval(interval);
            setProgressInterval(null);
          }
        } catch (error) {
          console.error("Failed to fetch progress:", error);
        }
      }, 1000); // Poll every 1 second

      setProgressInterval(interval);
    },
    onSuccess: (data) => {
      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      setProgress(100);

      const now = Date.now();
      const list = (data?.rows || []).map((r: any, idx: number) => ({
        __id:
          r.__id || `${now}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
        ...r,
      }));
      setRows(list);
      setStats(data?.stats || {});
      setNotice(`Preview: ${data?.total ?? list.length} hàng`);
      setSelected(new Set());

      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);
    },
    onError: (e: any) => {
      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      setProgress(0);
      setNotice(e?.response?.data?.error || e?.message || "Preview lỗi");
    },
  });

  const commitMut = useMutation({
    mutationFn: (payload: any[]) =>
      staffSchedulingApi.commit(payload).then((r) => r.data),
    onSuccess: (data) => {
      setNotice(
        `Created: ${data.created ?? data.successCount ?? 0}, Errors: ${data.errorCount ?? data.errors?.length ?? 0}`
      );
      setCommitErrors(data.errors || []);
      setRows([]);
      setSelected(new Set());
    },
    onError: (e: any) =>
      setNotice(e?.response?.data?.error || e?.message || "Commit lỗi"),
  });

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    return rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => (onlyValid ? !(r.errors && r.errors.length) : true))
      .filter(({ r }) =>
        selectedCodes.size === 0 ? true : selectedCodes.has(r.movieCode)
      )
      .map(({ r }) => r);
  }, [rows, selectedCodes, onlyValid]);

  // Build codesCsv from selected requests (movieCode)
  const selectedCodesCsv = useMemo(() => {
    if (selectedRequestIds.size === 0) return undefined;
    const codeList = requestOptions
      .filter((r) => selectedRequestIds.has(r.id))
      .map((r) => r.movieCode)
      .filter(Boolean);
    return codeList.length > 0 ? codeList.join(",") : undefined;
  }, [selectedRequestIds, requestOptions]);

  const deleteRowById = (id: string) => {
    setRows((prev) => prev.filter((r: any) => r.__id !== id));
    setSelected(new Set());
  };

  return (
    <main className="container" style={{ padding: 16 }}>
      <section className="section-box">
        <h3 style={{ margin: 0 }}>Staff Auto-scheduling</h3>
      </section>
      <section className="section-box" style={{ marginTop: 12 }}>
        {notice && (
          <div style={{ marginBottom: 8, color: "#333" }}>{notice}</div>
        )}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Week presets */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="fd-btn"
              type="button"
              onClick={() => {
                const today = new Date();
                const start = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                setStartDate(start.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}
            >
              Tuần này
            </button>
            <button
              className="fd-btn"
              type="button"
              onClick={() => {
                const today = new Date();
                const next = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate() + 7
                );
                const end = new Date(next);
                end.setDate(next.getDate() + 6);
                setStartDate(next.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}
            >
              Tuần sau
            </button>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            className="fd-btn"
            disabled={previewMut.isPending || !startDate || !endDate}
            onClick={() =>
              previewMut.mutate({
                startDate,
                endDate,
                codes: selectedCodesCsv, // nếu không chọn request → preview tất cả PENDING
              })
            }
          >
            {previewMut.isPending
              ? "Đang preview..."
              : selectedRequestIds.size > 0
                ? `Preview (${selectedRequestIds.size} request)`
                : "Preview"}
          </button>
        </div>

        {/* Progress Bar */}
        {previewMut.isPending && (
          <div
            style={{
              marginTop: 12,
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, progress)}%`,
                    height: "100%",
                    backgroundColor: "#007bff",
                    borderRadius: "4px",
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6c757d",
                textAlign: "center",
              }}
            >
              Đang tạo lịch chiếu... OptaPlanner đang tối ưu hóa (
              {Math.round(Math.min(100, progress))}%)
            </div>
          </div>
        )}
      </section>

      <section className="section-box" style={{ marginTop: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ margin: 0 }}>Chọn Movie Request (PENDING)</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="fd-btn"
              onClick={() =>
                setSelectedRequestIds(
                  new Set(requestOptions.map((r: any) => r.id))
                )
              }
              disabled={requestsQ.isLoading || requestOptions.length === 0}
            >
              Chọn tất cả
            </button>
            <button
              className="fd-btn"
              onClick={() => setSelectedRequestIds(new Set())}
              disabled={selectedRequestIds.size === 0}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
        {requestsQ.isLoading ? (
          <div style={{ marginTop: 8, color: "#6c757d" }}>
            Đang tải danh sách...
          </div>
        ) : requestOptions.length === 0 ? (
          <div style={{ marginTop: 8, color: "#6c757d" }}>
            Không có yêu cầu PENDING
          </div>
        ) : (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}
          >
            {requestOptions.map((r: any) => (
              <label
                key={r.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #e9ecef",
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: selectedRequestIds.has(r.id) ? "#e7f7e7" : "#fff",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRequestIds.has(r.id)}
                  onChange={() =>
                    setSelectedRequestIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(r.id)) next.delete(r.id);
                      else next.add(r.id);
                      return next;
                    })
                  }
                />
                <span style={{ fontFamily: "monospace" }}>{r.movieCode}</span>
                <span>— {r.movie?.title}</span>
                <span style={{ color: "#6c757d" }}>
                  (Ưu tiên: {r.priority ?? "-"}, Nhu cầu: {r.demandScore ?? "-"}
                  )
                </span>
              </label>
            ))}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: "#6c757d" }}>
          {selectedRequestIds.size > 0
            ? `Sẽ preview theo ${selectedRequestIds.size} request`
            : "Không chọn request → preview tất cả request PENDING"}
        </div>
      </section>

      {rows.length > 0 && (
        <section className="section-box" style={{ marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Hàng: {rows.length}</span>
              <label
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <input
                  type="checkbox"
                  checked={onlyValid}
                  onChange={(e) => setOnlyValid(e.target.checked)}
                />
                Chỉ hiện hàng hợp lệ
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="fd-btn"
                type="button"
                onClick={() =>
                  setSelected(
                    new Set(filteredRows.map((_r: any, i: number) => i))
                  )
                }
              >
                Chọn tất cả đang hiển thị
              </button>
              <button
                className="fd-btn"
                type="button"
                onClick={() => setSelected(new Set())}
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          {/* Timeline View */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Timeline View</h4>
            <TimelineView
              rows={filteredRows}
              selectedCodes={selectedCodes}
              onToggleCode={(code) =>
                setSelectedCodes((prev) => {
                  const next = new Set(prev);
                  if (next.has(code)) next.delete(code);
                  else next.add(code);
                  return next;
                })
              }
              onDeleteRow={deleteRowById}
            />
          </div>
          <table
            width="100%"
            cellPadding={8}
            style={{ background: "#fff", border: "1px solid #e9ecef" }}
          >
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === rows.length}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? new Set(rows.map((_r, i) => i))
                          : new Set()
                      )
                    }
                  />
                </th>
                <th>Rạp</th>
                <th>Phòng</th>
                <th>Phim</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Giá</th>
                <th>Lỗi</th>
                <th>Xoá</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r: any, idx: number) => (
                <tr
                  key={idx}
                  style={{
                    background:
                      r.errors && r.errors.length
                        ? "#ffeaea"
                        : selected.has(idx)
                          ? "#e7f7e7"
                          : "#fff",
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      disabled={r.errors && r.errors.length > 0}
                      onChange={() => toggle(idx)}
                    />
                  </td>
                  <td>{r.theaterName}</td>
                  <td>{r.roomName}</td>
                  <td>{r.movieCode}</td>
                  <td>{r.showDate}</td>
                  <td>{r.showTime}</td>
                  <td>{r.priceStandard}</td>
                  <td style={{ color: "#a00" }}>
                    {(r.errors || []).join("; ")}
                  </td>
                  <td>
                    {r.errors && r.errors.length ? (
                      <button
                        className="fd-btn"
                        style={{ background: "#e03131", color: "#fff" }}
                        onClick={() => deleteRowById(r.__id)}
                      >
                        Xoá
                      </button>
                    ) : (
                      <span style={{ color: "#6c757d" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8 }}>
            <button
              className="fd-btn"
              disabled={commitMut.isPending || selected.size === 0}
              onClick={() => {
                const payload = filteredRows
                  .filter((_r: any, i: number) => selected.has(i))
                  .map((r: any) => {
                    // Debug log
                    console.log("DEBUG: Original row data:", r);

                    return {
                      // Include IDs first (preferred)
                      theaterId: r.theaterId ?? null,
                      roomId: r.roomId ?? null,
                      movieId: r.movieId ?? null,
                      movieRequestId: r.movieRequestId ?? null,
                      // Include names as fallback
                      theaterName: r.theaterName ?? null,
                      roomName: r.roomName ?? null,
                      movieCode: r.movieCode ?? null,
                      date: r.showDate ?? null,
                      showtime: r.showTime ?? null,
                      priceStandard: r.priceStandard ?? null,
                      duration: r.duration ?? null,
                    };
                  });
                commitMut.mutate(payload);
              }}
            >
              {commitMut.isPending
                ? "Đang commit..."
                : `Commit (${selected.size})`}
            </button>
          </div>
        </section>
      )}

      {commitErrors.length > 0 && (
        <section className="section-box" style={{ marginTop: 12 }}>
          <h4 style={{ margin: 0, marginBottom: 8 }}>Commit errors</h4>
          <div
            style={{
              maxHeight: 240,
              overflowY: "auto",
              border: "1px solid #e9ecef",
              padding: 8,
            }}
          >
            <ol style={{ margin: 0, paddingLeft: 16 }}>
              {commitErrors.map((msg, i) => (
                <li key={i} style={{ color: "#a00", fontSize: 12 }}>
                  {msg}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <section className="section-box" style={{ marginTop: 12 }}>
          <h4 style={{ margin: 0, marginBottom: 8 }}>Thống kê</h4>
          {stats && Object.keys(stats).length > 0 ? (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Tổng quan
                </div>
                <div>Tổng suất: {stats.totalShows ?? 0}</div>
                {stats.score && <div>Score: {String(stats.score)}</div>}
                {typeof stats.primeTimeCount !== "undefined" && (
                  <div>
                    Prime-time: {stats.primeTimeCount} (
                    {Math.round(((stats.primeTimeRatio || 0) as number) * 100)}
                    %)
                  </div>
                )}
                {typeof stats.roomBalanceStddev !== "undefined" && (
                  <div>
                    Độ cân bằng phòng (σ):{" "}
                    {Number(stats.roomBalanceStddev).toFixed(2)}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Theo phòng
                </div>
                <table
                  width="100%"
                  cellPadding={6}
                  style={{ background: "#fff", border: "1px solid #e9ecef" }}
                >
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Số suất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byRoom || {}).map(
                      ([room, cnt]: any) => (
                        <tr key={room}>
                          <td>{room}</td>
                          <td>{cnt as any}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Theo phim
                </div>
                <table
                  width="100%"
                  cellPadding={6}
                  style={{ background: "#fff", border: "1px solid #e9ecef" }}
                >
                  <thead>
                    <tr>
                      <th>Mã phim</th>
                      <th>Số suất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byMovie || {}).map(
                      ([code, cnt]: any) => (
                        <tr key={code}>
                          <td>{code}</td>
                          <td>{cnt as any}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Theo ngày
                </div>
                <table
                  width="100%"
                  cellPadding={6}
                  style={{ background: "#fff", border: "1px solid #e9ecef" }}
                >
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Số suất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byDay || {}).map(
                      ([day, cnt]: any) => (
                        <tr key={day}>
                          <td>{day}</td>
                          <td>{cnt as any}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ color: "#6c757d" }}>Không có thống kê</div>
          )}
        </section>
      )}
    </main>
  );
}
