import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { staffSchedulingApi, type SchedulingConfig } from "../../services/staffSchedulingApi";
import { staffDashboardApi } from "../../services/staffDashboardApi";
import api from "../../services/apiClient";
import "../../styles/staff-booking.css"; // Modern CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faFilm,
  faMapMarkerAlt,
  faDoorOpen,
  faInfoCircle,
  faCalendarWeek,
  faSpinner,
  faCalendarDay,
  faCalendarPlus,
  faArrowRight,
  faCheckSquare,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

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
  const timeSlotWidth = 40;

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

  const dates = Object.keys(timelineData).sort();
  const allRooms = useMemo(() => {
    const rooms = new Set<string>();
    Object.values(timelineData).forEach((dayData) => {
      Object.keys(dayData).forEach((room) => rooms.add(room));
    });
    return Array.from(rooms).sort();
  }, [timelineData]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 23; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        );
      }
    }
    return slots;
  }, []);

  const calculatePosition = (showTime: string) => {
    const [hour, minute] = showTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60;
    const offsetMinutes = totalMinutes - startMinutes;
    return (offsetMinutes / 30) * timeSlotWidth;
  };

  // Generate a consistent pastel color from string
  const getMovieColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Brighter Pastel palette: High Lightness (85-95%), Clean Saturation (70-90%)
    const h = Math.abs(hash) % 360;
    const s = 70 + (Math.abs(hash >> 8) % 20); // 70-90% (Clean)
    const l = 85 + (Math.abs(hash >> 16) % 10); // 85-95% (Very Bright)

    // Flat color for clean look
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const getShowtimeStyle = (row: any): React.CSSProperties => {
    const leftPos = calculatePosition(row.showTime);
    const duration = row.duration || 120;
    const widthPx = (duration / 30) * timeSlotWidth;
    const hasError = row.errors && row.errors.length > 0;

    // Use movie code specific color if no error, otherwise red
    const bg = hasError ? "#fee2e2" : getMovieColor(row.movieCode || "Unknown");
    const border = hasError ? "1px solid #ef4444" : "1px solid rgba(0,0,0,0.1)";
    const color = hasError ? "#b91c1c" : "#334155";

    return {
      position: "absolute",
      left: `${leftPos}px`,
      width: `${widthPx}px`,
      minWidth: `${widthPx}px`,
      height: "32px",
      background: bg,
      border: border,
      borderRadius: "6px",
      padding: "2px 4px",
      fontSize: "11px",
      color: color,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      cursor: hasError ? "pointer" : "default",
      transition: "all 0.2s ease",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      zIndex: 1,
    };
  };

  const allUniqueCodes = useMemo(() => {
    const codes = new Set<string>();
    rows.forEach((r) => {
      if (r.movieCode) codes.add(r.movieCode);
    });
    return Array.from(codes).sort();
  }, [rows]);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          className="staff-btn staff-btn-secondary staff-btn-sm"
          onClick={() => {
            if (selectedCodes.size === allUniqueCodes.length) {
              allUniqueCodes.forEach((c) => onToggleCode(c));
            } else {
              allUniqueCodes.forEach((c) => {
                if (!selectedCodes.has(c)) onToggleCode(c);
              });
            }
          }}
        >
          <FontAwesomeIcon icon={faCheckSquare} className="mr-2" />
          {selectedCodes.size === allUniqueCodes.length ? "Bỏ chọn" : "Chọn"} tất cả
        </button>
        {allUniqueCodes.map((code) => (
          <button
            key={code}
            className={`staff-btn staff-btn-sm ${selectedCodes.has(code) ? "staff-btn-primary" : "staff-btn-secondary"}`}
            onClick={() => onToggleCode(code)}
            style={{ minWidth: 80 }}
          >
            {code}
          </button>
        ))}
      </div>

      <div className="staff-table-wrap">
        <table className="staff-table" style={{ minWidth: 1200 }}>
          <thead>
            <tr>
              <th
                style={{
                  position: "sticky",
                  left: 0,
                  zIndex: 20,
                  minWidth: 100,
                  background: "#f9fafb"
                }}
              >
                Ngày
              </th>
              <th
                style={{
                  position: "sticky",
                  left: 100,
                  zIndex: 20,
                  minWidth: 80,
                  background: "#f9fafb"
                }}
              >
                Phòng
              </th>
              <th
                style={{
                  minWidth: timeSlotWidth * timeSlots.length,
                  padding: "0"
                }}
              >
                <div style={{ display: "flex", position: "relative", height: "45px", alignItems: "center" }}>
                  {timeSlots.map((slot, i) => (
                    <div
                      key={slot}
                      style={{
                        width: timeSlotWidth,
                        minWidth: timeSlotWidth,
                        fontSize: 11,
                        color: "#6b7280",
                        textAlign: "center",
                        borderLeft: i % 2 === 0 ? "1px solid #e5e7eb" : "none",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 500
                      }}
                    >
                      {i % 2 === 0 ? slot.split(":")[0] + "h" : ""}
                    </div>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <>
                {allRooms.map((room, roomIdx) => (
                  <tr key={`${date}-${room}`}>
                    {roomIdx === 0 && (
                      <td
                        rowSpan={allRooms.length}
                        style={{
                          position: "sticky",
                          left: 0,
                          background: "#fff",
                          zIndex: 10,
                          verticalAlign: "top",
                          fontWeight: 600,
                          borderRight: "1px solid #e5e7eb",
                        }}
                      >
                        {date}
                      </td>
                    )}
                    <td
                      style={{
                        position: "sticky",
                        left: 100,
                        background: "#fff",
                        zIndex: 10,
                        borderRight: "1px solid #e5e7eb",
                        padding: "8px 12px"
                      }}
                    >
                      <span className="staff-badge staff-badge-gray">{room}</span>
                    </td>
                    <td
                      style={{
                        padding: "8px 0",
                        position: "relative",
                        height: 50,
                        minWidth: timeSlotWidth * timeSlots.length,
                      }}
                    >
                      <div style={{ position: "relative", height: "100%" }}>
                        {timelineData[date]?.[room]
                          ?.filter(
                            (row: any) =>
                              selectedCodes.size === 0 ||
                              selectedCodes.has(row.movieCode)
                          )
                          .map((row, idx) => {
                            const [startHour, startMinute] = row.showTime.split(":").map(Number);
                            const movieDuration = row.duration || 120;
                            const endTime = new Date(0, 0, 0, startHour, startMinute + movieDuration);
                            const endTimeStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

                            return (
                              <div
                                key={idx}
                                style={getShowtimeStyle(row)}
                                title={`${row.movieCode} - ${row.showTime} → ${endTimeStr} (${row.movie?.title || "N/A"})${row.errors && row.errors.length ? "\nClick để xoá (invalid)" : ""}`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.05)";
                                  e.currentTarget.style.zIndex = "10";
                                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.zIndex = "1";
                                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                                }}
                                onClick={() => {
                                  if (row.errors && row.errors.length && row.__id) {
                                    onDeleteRow(row.__id as string);
                                  }
                                }}
                              >
                                <div style={{ fontSize: "10px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {row.movieCode}
                                </div>
                                <div style={{ fontSize: "9px", opacity: 0.8 }}>
                                  {row.showTime}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </td>
                  </tr>
                ))}
              </>
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
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [notice, setNotice] = useState<string>("");
  const [commitErrors, setCommitErrors] = useState<string[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<number>>(
    new Set()
  );
  const [onlyValid, setOnlyValid] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "timeline">("timeline");
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [schedConfig, setSchedConfig] = useState<SchedulingConfig>({
    openHour: 8, openMinute: 0,
    closeHour: 23, closeMinute: 0,
    bufferMinutes: 5,
    timeGrainMinutes: 30,
    maxShowsPerMoviePerDay: 8,
    primeTimeWeight: 3,
    roomBalanceWeight: 2,
  });

  const dashboardQ = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => {
      const resp = await staffDashboardApi.get();
      return resp.data;
    },
  });

  const theaterData = dashboardQ.data?.theater;

  const requestsQ = useQuery({
    queryKey: ["staff-movie-requests-pending"],
    queryFn: async () => {
      const resp = await api.get("/api/staff/movie-requests", {
        params: { status: "PENDING" },
      });
      return resp.data;
    },
  });

  const requestOptions = requestsQ.data?.items || [];

  const previewMut = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) {
        throw new Error("Vui lòng chọn khoảng ngày");
      }

      setNotice("Đang gọi solver...");
      setRows([]);
      setStats(null);
      setSelected(new Set());
      setCommitErrors([]);
      setProgress(1); // Start at 1% to show progress bar
      setProgressMessage("Khởi tạo solver...");

      let pollInterval: ReturnType<typeof setInterval> | null = null;

      // Delay polling slightly to let backend start
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Simulate progress 0-99% over 2 minutes (120s)
      // Step per second = 100 / 120 ≈ 0.8
      pollInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99;
          return prev + 0.8;
        });
        setProgressMessage("AI đang sắp xếp lịch tối ưu...");
      }, 1000);

      const payload: any = {
        startDate,
        endDate,
        config: schedConfig,
      };
      if (selectedCodesCsv) {
        payload.codes = selectedCodesCsv;
      }

      try {
        const resp = await staffSchedulingApi.preview(payload);
        if (pollInterval) clearInterval(pollInterval);
        return resp.data;
      } catch (err) {
        if (pollInterval) clearInterval(pollInterval);
        throw err;
      }
    },
    onSuccess: (data) => {
      setNotice("");
      setProgress(100);
      setProgressMessage("Hoàn thành!");

      if (data.rows && data.rows.length > 0) {
        // Add unique ID for frontend tracking
        const rowsWithId = data.rows.map((r: any) => ({
          ...r,
          __id: r.__id || `${r.movieCode}_${r.showDate}_${r.showTime}_${Math.random().toString(36).substr(2, 9)}`
        }));
        setRows(rowsWithId);
        setStats(data.stats || null);
      } else {
        setNotice("Không có kết quả từ solver");
      }

      // Reset progress after 2s
      setTimeout(() => {
        setProgress(0);
        setProgressMessage("");
      }, 2000);
    },
    onError: (err: any) => {
      setNotice("");
      setProgress(0);
      setProgressMessage("");
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi gọi preview solver";
      setCommitErrors([msg]);
    },
  });

  const commitMut = useMutation({
    mutationFn: async (payload: any[]) => {
      console.log("Committing payload:", payload);
      const resp = await staffSchedulingApi.commit(payload);
      return resp.data;
    },
    onSuccess: (data) => {
      console.log("Commit success:", data);
      setNotice("✓ Commit thành công!");
      setRows([]);
      setStats(null);
      setSelected(new Set());
      setCommitErrors([]);
      if (data.errors && data.errors.length) {
        setCommitErrors(data.errors);
      }
    },
    onError: (err: any) => {
      console.error("Commit error:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi commit";
      const details =
        err?.response?.data?.error || err?.response?.data?.details || "";
      setCommitErrors([msg, details].filter(Boolean));
    },
  });

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const selectedCodesCsv = useMemo(() => {
    if (selectedRequestIds.size === 0) return undefined;
    const codeList = requestOptions
      .filter((r: any) => selectedRequestIds.has(r.id))
      .map((r: any) => r.movieCode)
      .filter(Boolean);
    return codeList.length > 0 ? codeList.join(",") : undefined;
  }, [selectedRequestIds, requestOptions]);

  const deleteRowById = (id: string) => {
    setRows((prev) => prev.filter((r: any) => r.__id !== id));
    setSelected(new Set());
  };

  return (
    <div className="staff-container">
      {/* Header */}
      <div className="staff-header-section">
        <div>
          <h2 className="staff-title">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-600" />
            Lập lịch chiếu tự động
          </h2>
          <p className="staff-subtitle">
            Sử dụng AI OptaPlanner để tối ưu hóa lịch chiếu phim
          </p>
        </div>
      </div>

      {/* Theater Info Card */}
      {theaterData && (
         <div className="staff-card mb-4" style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div className="staff-stat-icon icon-blue">
                <FontAwesomeIcon icon={faFilm} />
            </div>
            <div>
              <h3 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{theaterData.name || "N/A"}</h3>
              <p style={{margin: "4px 0 0", color: "#6b7280", fontSize: 13}}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" /> {theaterData.address || "—"}
                  <span style={{margin: "0 8px"}}>|</span>
                  <FontAwesomeIcon icon={faDoorOpen} className="mr-1" /> {dashboardQ.data?.rooms?.length || 0} phòng chiếu
              </p>
            </div>
         </div>
      )}

      {/* Instructions Card */}
      <div className="staff-card mb-4">
        <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" /> Hướng dẫn sử dụng
        </h4>
        <ol style={{ margin: 0, paddingLeft: 20, color: "#4b5563", fontSize: 14, lineHeight: 1.6 }}>
          <li>Chọn khoảng thời gian cần lập lịch (hoặc dùng preset "Tuần này"/"Tuần sau")</li>
          <li>Chọn các MovieRequest PENDING muốn đưa vào lịch (không chọn = tất cả)</li>
          <li>Nhấn <strong className="text-primary-600">Preview</strong> để AI tạo lịch chiếu tự động</li>
          <li>Xem kết quả trên Timeline hoặc Table, kiểm tra lỗi (dòng đỏ)</li>
          <li>Chọn các suất chiếu hợp lệ và nhấn <strong className="text-green-600">Commit</strong> để lưu vào hệ thống</li>
        </ol>
      </div>

      {/* Date Range Selection */}
      <div className="staff-card mb-4">
        <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faCalendarWeek} className="text-purple-600" /> Chọn khoảng thời gian
        </h4>

        {(notice || progress > 0) && (
          <div className="staff-alert staff-alert-success mb-4" style={{justifyContent: 'space-between', flexDirection: 'column', alignItems: 'stretch'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                 <FontAwesomeIcon icon={progress > 0 && progress < 100 ? faSpinner : faInfoCircle} spin={progress > 0 && progress < 100} />
                 {notice || progressMessage}
            </div>
            {progress > 0 && (
                <div style={{marginTop: 8}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4}}>
                         <span>{progressMessage}</span>
                         <span>{Math.floor(progress)}%</span>
                    </div>
                    <div style={{width: '100%', height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden'}}>
                         <div style={{width: `${progress}%`, height: '100%', background: 'currentColor', transition: 'width 0.3s ease'}}></div>
                    </div>
                </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="staff-action-group">
            <button
              className="staff-btn staff-btn-secondary"
              type="button"
              onClick={() => {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                setStartDate(start.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}
            >
              <FontAwesomeIcon icon={faCalendarDay} /> Tuần này
            </button>
            <button
              className="staff-btn staff-btn-secondary"
              type="button"
              onClick={() => {
                const today = new Date();
                const next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
                const end = new Date(next);
                end.setDate(next.getDate() + 6);
                setStartDate(next.toISOString().slice(0, 10));
                setEndDate(end.toISOString().slice(0, 10));
              }}
            >
              <FontAwesomeIcon icon={faCalendarPlus} /> Tuần sau
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              className="staff-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 140 }}
            />
            <FontAwesomeIcon icon={faArrowRight} style={{ color: "#9ca3af", fontSize: 12 }} />
            <input
              type="date"
              className="staff-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          {/* Advanced Config Panel */}
          <div style={{ width: "100%", marginTop: 12 }}>
            <button
              className="staff-btn staff-btn-secondary"
              type="button"
              onClick={() => setShowAdvancedConfig(v => !v)}
              style={{ fontSize: 13 }}
            >
              ⚙️ {showAdvancedConfig ? "Ẩn" : "Hiện"} Cấu hình Nâng cao
            </button>

            {showAdvancedConfig && (
              <div style={{
                marginTop: 12,
                padding: "16px",
                background: "#f8f9fc",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}>
                {/* Open Time */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    🕗 Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    className="staff-input"
                    value={`${String(schedConfig.openHour ?? 8).padStart(2,'0')}:${String(schedConfig.openMinute ?? 0).padStart(2,'0')}`}
                    onChange={e => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      setSchedConfig(prev => ({ ...prev, openHour: h, openMinute: m }));
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Mặc định: 08:00</span>
                </div>

                {/* Close Time */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    🕦 Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    className="staff-input"
                    value={`${String(schedConfig.closeHour ?? 23).padStart(2,'0')}:${String(schedConfig.closeMinute ?? 0).padStart(2,'0')}`}
                    onChange={e => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      setSchedConfig(prev => ({ ...prev, closeHour: h, closeMinute: m }));
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Mặc định: 23:00</span>
                </div>

                {/* Buffer Minutes */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    ⏱ Buffer giữa 2 suất (phút): <strong>{schedConfig.bufferMinutes}</strong>
                  </label>
                  <input
                    type="range" min={0} max={30} step={5}
                    value={schedConfig.bufferMinutes ?? 5}
                    onChange={e => setSchedConfig(prev => ({ ...prev, bufferMinutes: Number(e.target.value) }))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                    <span>0</span><span>Mặc định: 5</span><span>30</span>
                  </div>
                </div>

                {/* Time Grain */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    🔢 Độ phân giải (phút)
                  </label>
                  <select
                    className="staff-input"
                    value={schedConfig.timeGrainMinutes ?? 30}
                    onChange={e => setSchedConfig(prev => ({ ...prev, timeGrainMinutes: Number(e.target.value) }))}
                  >
                    <option value={15}>15 phút (chi tiết hơn)</option>
                    <option value={30}>30 phút (mặc định)</option>
                    <option value={60}>60 phút (nhanh hơn)</option>
                  </select>
                </div>

                {/* Max Shows Per Day */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    🎬 Tối đa suất/phim/ngày: <strong>{schedConfig.maxShowsPerMoviePerDay}</strong>
                  </label>
                  <input
                    type="range" min={1} max={12} step={1}
                    value={schedConfig.maxShowsPerMoviePerDay ?? 8}
                    onChange={e => setSchedConfig(prev => ({ ...prev, maxShowsPerMoviePerDay: Number(e.target.value) }))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                    <span>1</span><span>Mặc định: 8</span><span>12</span>
                  </div>
                </div>

                {/* Prime Time Weight */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    🌟 Ưu tiên giờ vàng (18-21h): <strong>{schedConfig.primeTimeWeight}/5</strong>
                  </label>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={schedConfig.primeTimeWeight ?? 3}
                    onChange={e => setSchedConfig(prev => ({ ...prev, primeTimeWeight: Number(e.target.value) }))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                    <span>Thấp</span><span>Mặc định: 3</span><span>Cao</span>
                  </div>
                </div>

                {/* Room Balance */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    ⚖️ Cân bằng phòng chiếu: <strong>{schedConfig.roomBalanceWeight}/5</strong>
                  </label>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={schedConfig.roomBalanceWeight ?? 2}
                    onChange={e => setSchedConfig(prev => ({ ...prev, roomBalanceWeight: Number(e.target.value) }))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                    <span>Thấp</span><span>Mặc định: 2</span><span>Cao</span>
                  </div>
                </div>

                {/* Reset button */}
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    className="staff-btn staff-btn-secondary"
                    type="button"
                    onClick={() => setSchedConfig({
                      openHour: 8, openMinute: 0,
                      closeHour: 23, closeMinute: 0,
                      bufferMinutes: 5,
                      timeGrainMinutes: 30,
                      maxShowsPerMoviePerDay: 8,
                      primeTimeWeight: 3,
                      roomBalanceWeight: 2,
                    })}
                    style={{ fontSize: 12 }}
                  >
                    ↺ Đặt lại mặc định
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
              className="staff-btn staff-btn-primary"
              onClick={() => previewMut.mutate()}
              disabled={previewMut.isPending || !startDate || !endDate}
          >
              <FontAwesomeIcon icon={faPlay} /> Preview (AI Solver)
          </button>
        </div>
      </div>

      {/* Movie Requests Selection */}
      <div className="admin-card" style={{ marginTop: 20 }}>
        <h4
          style={{
            margin: "0 0 16px",
            color: "#5a5c69",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i className="fas fa-film"></i> Chọn MovieRequest (PENDING)
        </h4>
        {requestsQ.isLoading ? (
          <div style={{ padding: 16, textAlign: "center", color: "#858796" }}>
            <i className="fas fa-spinner fa-spin"></i> Đang tải danh sách...
          </div>
        ) : requestOptions.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "#858796",
              background: "#f8f9fc",
              borderRadius: 6,
              border: "1px dashed #e3e6f0",
            }}
          >
            <i
              className="fas fa-inbox"
              style={{ fontSize: 32, marginBottom: 8, display: "block" }}
            ></i>
            Không có yêu cầu PENDING
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {requestOptions.map((r: any) => (
                <label
                  key={r.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    border: selectedRequestIds.has(r.id)
                      ? "2px solid #4e73df"
                      : "1px solid #e3e6f0",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: selectedRequestIds.has(r.id)
                      ? "#eef2ff"
                      : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedRequestIds.has(r.id)) {
                      e.currentTarget.style.borderColor = "#d1d3e2";
                      e.currentTarget.style.background = "#f8f9fc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedRequestIds.has(r.id)) {
                      e.currentTarget.style.borderColor = "#e3e6f0";
                      e.currentTarget.style.background = "#fff";
                    }
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
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#4e73df",
                    }}
                  >
                    {r.movieCode}
                  </span>
                  <span style={{ color: "#5a5c69" }}>
                    — {r.movieTitle || "N/A"}
                  </span>
                  <span
                    style={{
                      color: "#858796",
                      fontSize: 12,
                      padding: "2px 8px",
                      background: "#f8f9fc",
                      borderRadius: 4,
                    }}
                  >
                    P: {r.priority ?? "-"} | D: {r.demandScore ?? "-"}
                  </span>
                </label>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#858796",
                padding: "8px 12px",
                background: "#f8f9fc",
                borderRadius: 6,
                border: "1px solid #e3e6f0",
              }}
            >
              <i className="fas fa-info-circle"></i>{" "}
              {selectedRequestIds.size > 0
                ? `Đã chọn ${selectedRequestIds.size} request`
                : "Không chọn request → AI sẽ xử lý tất cả request PENDING"}
            </div>
          </>
        )}
      </div>

      {/* Preview Results */}
      {rows.length > 0 && (
        <>
          {/* Stats Overview */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="admin-card" style={{ marginTop: 20 }}>
              <h4
                style={{
                  margin: "0 0 16px",
                  color: "#5a5c69",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i className="fas fa-chart-bar"></i> Thống kê kết quả
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                {/* Total Shows */}
                <div
                  style={{
                    padding: 16,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 8,
                    color: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
                    Tổng suất chiếu
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {stats.totalShows ?? 0}
                  </div>
                </div>

                {/* Score */}
                {stats.score && (
                  <div
                    style={{
                      padding: 16,
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      borderRadius: 8,
                      color: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}
                    >
                      Điểm tối ưu
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {String(stats.score)}
                    </div>
                  </div>
                )}

                {/* Prime Time */}
                {typeof stats.primeTimeCount !== "undefined" && (
                  <div
                    style={{
                      padding: 16,
                      background:
                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      borderRadius: 8,
                      color: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}
                    >
                      Suất prime-time
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {stats.primeTimeCount}
                      <span style={{ fontSize: 14, marginLeft: 4 }}>
                        (
                        {Math.round(
                          ((stats.primeTimeRatio || 0) as number) * 100
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                )}

                {/* Room Balance */}
                {typeof stats.roomBalanceStddev !== "undefined" && (
                  <div
                    style={{
                      padding: 16,
                      background:
                        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      borderRadius: 8,
                      color: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}
                    >
                      Độ cân bằng phòng (σ)
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {Number(stats.roomBalanceStddev).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Stats Tables */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                  marginTop: 20,
                }}
              >
                {/* By Room */}
                {stats.byRoom && Object.keys(stats.byRoom).length > 0 && (
                  <div>
                    <h5
                      style={{
                        margin: "0 0 12px",
                        color: "#5a5c69",
                        fontSize: 14,
                      }}
                    >
                      <i className="fas fa-door-open"></i> Theo phòng
                    </h5>
                    <table className="admin-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Phòng</th>
                          <th>Số suất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.byRoom).map(
                          ([room, cnt]: any) => (
                            <tr key={room}>
                              <td>{room}</td>
                              <td>
                                <strong>{cnt as any}</strong>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* By Movie */}
                {stats.byMovie && Object.keys(stats.byMovie).length > 0 && (
                  <div>
                    <h5
                      style={{
                        margin: "0 0 12px",
                        color: "#5a5c69",
                        fontSize: 14,
                      }}
                    >
                      <i className="fas fa-film"></i> Theo phim
                    </h5>
                    <table className="admin-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Mã phim</th>
                          <th>Số suất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.byMovie).map(
                          ([code, cnt]: any) => (
                            <tr key={code}>
                              <td style={{ fontFamily: "monospace" }}>
                                {code}
                              </td>
                              <td>
                                <strong>{cnt as any}</strong>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* By Day */}
                {stats.byDay && Object.keys(stats.byDay).length > 0 && (
                  <div>
                    <h5
                      style={{
                        margin: "0 0 12px",
                        color: "#5a5c69",
                        fontSize: 14,
                      }}
                    >
                      <i className="fas fa-calendar"></i> Theo ngày
                    </h5>
                    <table className="admin-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Ngày</th>
                          <th>Số suất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.byDay).map(([day, cnt]: any) => (
                          <tr key={day}>
                            <td>{day}</td>
                            <td>
                              <strong>{cnt as any}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="admin-card" style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    color: "#5a5c69",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <i className="fas fa-list-ul"></i> Kết quả lập lịch
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "#858796",
                      background: "#f8f9fc",
                      padding: "4px 10px",
                      borderRadius: 4,
                    }}
                  >
                    {rows.length} hàng
                  </span>
                </h4>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`admin-btn ${viewMode === "timeline" ? "admin-btn-primary" : "admin-btn-secondary"}`}
                  onClick={() => setViewMode("timeline")}
                >
                  <i className="fas fa-stream"></i> Timeline
                </button>
                <button
                  className={`admin-btn ${viewMode === "table" ? "admin-btn-primary" : "admin-btn-secondary"}`}
                  onClick={() => setViewMode("table")}
                >
                  <i className="fas fa-table"></i> Table
                </button>
              </div>
            </div>

            {/* Filters */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 16px",
                background: "#f8f9fc",
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyValid}
                  onChange={(e) => setOnlyValid(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ color: "#5a5c69", fontSize: 14 }}>
                  <i className="fas fa-filter"></i> Chỉ hiện hàng hợp lệ
                </span>
              </label>
            </div>

            {/* Timeline View */}
            {viewMode === "timeline" && (
              <TimelineView
                rows={filteredRows}
                selectedCodes={selectedCodes}
                onToggleCode={toggleCode}
                onDeleteRow={deleteRowById}
              />
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() =>
                        setSelected(
                          new Set(filteredRows.map((r: any) => r.__id))
                        )
                      }
                    >
                      <i className="fas fa-check-square"></i> Chọn tất cả
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => setSelected(new Set())}
                    >
                      <i className="fas fa-square"></i> Bỏ chọn
                    </button>
                  </div>

                  {/* Page Size Selector - Custom Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        const el = document.getElementById('pageSizeDropdown');
                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        border: "1px solid #d1d3e2",
                        background: "#fff",
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 140,
                        justifyContent: "space-between"
                      }}
                    >
                      <span>{pageSize} hàng/trang</span>
                      <i className="fas fa-chevron-down" style={{ fontSize: 10, color: "#858796" }}></i>
                    </button>
                    
                    <div 
                      id="pageSizeDropdown"
                      style={{
                        display: "none",
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: 4,
                        background: "#fff",
                        border: "1px solid #e3e6f0",
                        borderRadius: 4,
                        boxShadow: "0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)",
                        zIndex: 100,
                        minWidth: 140
                      }}
                    >
                      {[10, 20, 50, 100].map(size => (
                        <div
                          key={size}
                          onClick={() => {
                            setPageSize(size);
                            setPage(0);
                            const el = document.getElementById('pageSizeDropdown');
                            if (el) el.style.display = 'none';
                          }}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: 14,
                            color: size === pageSize ? "#4e73df" : "#3a3b45",
                            fontWeight: size === pageSize ? "bold" : "normal",
                            background: size === pageSize ? "#f8f9fc" : "transparent"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = size === pageSize ? "#f8f9fc" : "transparent"}
                        >
                          {size} hàng/trang
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 50 }}>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelected(
                                  new Set(
                                    filteredRows.map((r: any) => r.__id)
                                  )
                                );
                              } else {
                                setSelected(new Set());
                              }
                            }}
                            checked={
                              selected.size === filteredRows.length &&
                              filteredRows.length > 0
                            }
                          />
                        </th>
                        <th>Rạp</th>
                        <th>Phòng</th>
                        <th>Mã phim</th>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Giá</th>
                        <th>Lỗi / Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows
                        .slice(page * pageSize, (page + 1) * pageSize)
                        .map((r: any) => (
                        <tr
                          key={r.__id}
                          style={{
                            background:
                              r.errors && r.errors.length
                                ? "#fff5f5"
                                : selected.has(r.__id)
                                  ? "#f0fff4"
                                  : "#fff",
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={selected.has(r.__id)}
                              disabled={r.errors && r.errors.length > 0}
                              onChange={() => toggle(r.__id)}
                            />
                          </td>
                          <td>{r.theaterName}</td>
                          <td>{r.roomName}</td>
                          <td
                            style={{ fontFamily: "monospace", fontWeight: 600 }}
                          >
                            {r.movieCode}
                          </td>
                          <td>{r.showDate}</td>
                          <td>{r.showTime}</td>
                          <td>{r.priceStandard?.toLocaleString() || "—"}</td>
                          <td>
                            {r.errors && r.errors.length ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span
                                  style={{
                                    color: "#e03131",
                                    fontSize: 12,
                                    flex: 1,
                                  }}
                                >
                                  {(r.errors || []).join("; ")}
                                </span>
                                <button
                                  className="admin-btn admin-btn-danger"
                                  onClick={() => deleteRowById(r.__id)}
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: 11,
                                    whiteSpace: "nowrap",
                                  }}
                                  title="Xoá dòng lỗi"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: "#1cc88a", fontSize: 12 }}>
                                <i className="fas fa-check-circle"></i> Hợp lệ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredRows.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                            Không có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredRows.length > 0 && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "flex-end", 
                    alignItems: "center", 
                    marginTop: 16,
                    gap: 12 
                  }}>
                     <span style={{ fontSize: 14, color: "#858796" }}>
                       Hiển thị {(page * pageSize) + 1} - {Math.min((page + 1) * pageSize, filteredRows.length)} trong tổng số {filteredRows.length}
                     </span>
                     
                     <div style={{ display: "flex", gap: 4 }}>
                       <button
                         className="admin-btn admin-btn-secondary"
                         disabled={page === 0}
                         onClick={() => setPage(p => Math.max(0, p - 1))}
                         style={{ opacity: page === 0 ? 0.5 : 1 }}
                       >
                         <i className="fas fa-chevron-left"></i>
                       </button>
                       <button
                         className="admin-btn admin-btn-secondary"
                         disabled={(page + 1) * pageSize >= filteredRows.length}
                         onClick={() => setPage(p => p + 1)}
                         style={{ opacity: (page + 1) * pageSize >= filteredRows.length ? 0.5 : 1 }}
                       >
                         <i className="fas fa-chevron-right"></i>
                       </button>
                     </div>
                  </div>
                )}
              </>
            )}

            {/* Commit Button */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #e3e6f0",
              }}
            >
              <button
                className="admin-btn admin-btn-success"
                disabled={commitMut.isPending || selected.size === 0}
                onClick={() => {
                  console.log("Selected indices:", Array.from(selected));
                  console.log("Filtered rows count:", filteredRows.length);
                  console.log(
                    "First 3 filtered rows:",
                    filteredRows.slice(0, 3)
                  );

                  const selectedRows = filteredRows.filter(
                    (r: any) => selected.has(r.__id) && (!r.errors || r.errors.length === 0)
                  );
                  console.log(
                    "Selected rows after filter:",
                    selectedRows.length,
                    selectedRows.slice(0, 3)
                  );

                  const payload = selectedRows.map((r: any) => ({
                    theaterId: r.theaterId ?? null,
                    roomId: r.roomId ?? null,
                    movieId: r.movieId ?? null,
                    movieRequestId: r.movieRequestId ?? null,
                    theaterName: r.theaterName ?? null,
                    roomName: r.roomName ?? null,
                    movieCode: r.movieCode ?? null,
                    date: r.showDate ?? null,
                    showtime: r.showTime ?? null,
                    priceStandard: r.priceStandard ?? null,
                    duration: r.duration ?? null,
                  }));

                  console.log("Final payload:", payload.slice(0, 3));
                  commitMut.mutate(payload);
                }}
              >
                <i className="fas fa-check-circle"></i>
                {commitMut.isPending
                  ? "Đang commit..."
                  : `Commit (${selected.size} suất)`}
              </button>
              {selected.size === 0 && (
                <span
                  style={{ marginLeft: 12, color: "#858796", fontSize: 13 }}
                >
                  <i className="fas fa-info-circle"></i> Vui lòng chọn ít nhất 1
                  suất chiếu
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Commit Errors */}
      {commitErrors.length > 0 && (
        <div
          className="admin-card"
          style={{
            marginTop: 20,
            border: "1px solid #f5c6cb",
            background: "#f8d7da",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px",
              color: "#721c24",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="fas fa-exclamation-triangle"></i> Lỗi commit
          </h4>
          <div
            style={{
              maxHeight: 240,
              overflowY: "auto",
              padding: 12,
              background: "#fff",
              borderRadius: 6,
              border: "1px solid #f5c6cb",
            }}
          >
            <ol
              style={{
                margin: 0,
                paddingLeft: 20,
                color: "#721c24",
                lineHeight: 1.8,
              }}
            >
              {commitErrors.map((msg, i) => (
                <li key={i} style={{ fontSize: 13 }}>
                  {msg}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
