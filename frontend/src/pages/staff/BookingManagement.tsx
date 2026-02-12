import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffDashboardApi } from "../../services/staffDashboardApi";
import { bookingApi } from "../../services/bookingApi";
import CustomDropdown from "../../components/CustomDropdown";
import "../../styles/staff-booking.css"; // Used new CSS
import { 
  Ticket, 
  Building2, 
  Calendar, 
  Film, 
  Clock, 
  Armchair, 
  Banknote, 
  Sofa, 
  Layers, 
  Loader2 
} from "lucide-react";

export default function BookingManagement() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMovie, setSelectedMovie] = useState<string | number>("");
  const [selectedShowtime, setSelectedShowtime] = useState<string | number>("");

  // Fetch theater info
  const dashboardQ = useQuery({
    queryKey: ["staffDashboard"],
    queryFn: async () => {
      const resp = await staffDashboardApi.get();
      return resp.data;
    },
  });

  // Fetch showtimes for selected date and movie
  const showtimesQ = useQuery({
    queryKey: ["staffBookingShowtimes", selectedDate, selectedMovie],
    queryFn: async () => {
      const theaterId = dashboardQ.data?.theater?.id;
      if (!theaterId) return [];
      const resp = await bookingApi.getShowtimes({
        theaterId,
        movieId: selectedMovie ? Number(selectedMovie) : undefined,
        showDate: selectedDate,
      });
      return resp.data;
    },
    enabled: !!dashboardQ.data?.theater?.id,
  });

  // Fetch seats/bookings for selected showtime
  const seatsQ = useQuery({
    queryKey: ["staffBookingSeats", selectedShowtime],
    queryFn: async () => {
      if (!selectedShowtime) return null;
      const theaterId = dashboardQ.data?.theater?.id;
      if (!theaterId) return null;
      const resp = await bookingApi.getSeats({
        theaterId,
        showtimeId: selectedShowtime,
      });
      return resp.data;
    },
    enabled: !!selectedShowtime && !!dashboardQ.data?.theater?.id,
  });

  const theater = dashboardQ.data?.theater;
  const assignments = dashboardQ.data?.assignments || [];
  const showtimes = showtimesQ.data || [];
  const seats = seatsQ.data || [];

  // Count bookings
  const bookedSeats = seats.filter((s: any) => s.booked);
  const totalSeats = seats.length;
  const bookedCount = bookedSeats.length;
  const availableCount = totalSeats - bookedCount;

  // Calculate revenue
  const selectedShowtimeData = showtimes.find(
    (s: any) => String(s.id) === String(selectedShowtime)
  );
  const priceStandard = selectedShowtimeData?.priceStandard || 75000;
  const priceVip = selectedShowtimeData?.priceVip || 120000;
  
  let totalRevenue = 0;
  bookedSeats.forEach((seat: any) => {
    totalRevenue += seat.seatType === "VIP" ? priceVip : priceStandard;
  });

  // Prepare dropdown options
  const movieOptions = [
    { value: "", label: "-- Tất cả phim --" },
    ...assignments.map((a: any) => ({
      value: String(a.movieId),
      label: a.movieTitle,
    })),
  ];

  const showtimeOptions = [
    { value: "", label: "-- Chọn suất chiếu --" },
    ...showtimes.map((s: any) => ({
      value: String(s.id),
      label: `${s.showTime} - ${s.movieTitle} - ${s.roomName}`,
    })),
  ];

  // Group seats by row
  const seatsByRow = seats.reduce((acc: any, seat: any) => {
    const seatNum = seat.seatNumber || "";
    const row = seatNum.charAt(0) || "?";
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(seatsByRow).sort();

  return (
    <div className="staff-container">
      {/* Header Section */}
      <div className="staff-header-section">
        <div>
          <h2 className="staff-title flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary-600" />
            Quản lý Vé & Doanh thu
          </h2>
          <p className="staff-subtitle flex items-center gap-2">
            <Building2 className="w-4 h-4" /> 
            {theater?.name || "Đang tải thông tin rạp..."}
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="staff-card">
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#374151" }}>
          Bộ lọc tìm kiếm
        </h3>
        <div className="staff-filter-grid">
          <div>
            <label className="staff-label flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" /> <span>Ngày chiếu</span>
            </label>
            <input
              type="date"
              className="staff-input"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedShowtime("");
              }}
            />
          </div>
          <div>
            <label className="staff-label flex items-center justify-center gap-2">
              <Film className="w-4 h-4 text-gray-500" /> <span>Phim chiếu</span>
            </label>
            <CustomDropdown
              options={movieOptions}
              value={String(selectedMovie)}
              onChange={(val) => {
                setSelectedMovie(val === "" ? "" : Number(val));
                setSelectedShowtime("");
              }}
            />
          </div>
          <div>
            <label className="staff-label flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> <span>Suất chiếu</span>
            </label>
            {showtimes.length === 0 ? (
              <select className="staff-select" disabled>
                <option>-- Không có suất chiếu --</option>
              </select>
            ) : (
              <CustomDropdown
                options={showtimeOptions}
                value={String(selectedShowtime)}
                onChange={(val) => setSelectedShowtime(val === "" ? "" : Number(val))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedShowtime ? (
        <>
          {/* Stats Cards */}
          <div className="staff-stats-grid">
            <div className="staff-stat-card">
              <div className="staff-stat-icon icon-blue">
                <Armchair />
              </div>
              <div className="staff-stat-info">
                <h4>TỔNG SỐ GHẾ</h4>
                <span className="value">{totalSeats}</span>
              </div>
            </div>
            
            <div className="staff-stat-card">
              <div className="staff-stat-icon icon-purple">
                 <Ticket />
              </div>
              <div className="staff-stat-info">
                <h4>VÉ ĐÃ BÁN</h4>
                <span className="value">{bookedCount}</span>
              </div>
            </div>

            <div className="staff-stat-card">
              <div className="staff-stat-icon icon-green">
                 <Layers />
              </div>
              <div className="staff-stat-info">
                 <h4>CÒN TRỐNG</h4>
                 <span className="value">{availableCount}</span>
              </div>
            </div>

            <div className="staff-stat-card">
              <div className="staff-stat-icon icon-orange">
                 <Banknote />
              </div>
              <div className="staff-stat-info">
                 <h4>DOANH THU (TẠM TÍNH)</h4>
                 <span className="value">{(totalRevenue / 1000).toLocaleString()}K</span>
              </div>
            </div>
          </div>

          {/* Seat Map Card */}
          <div className="staff-card" style={{ marginTop: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151" }}>Sơ đồ ghế chi tiết</h3>
            </div>

            {seatsQ.isLoading ? (
               <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                   <Loader2 className="w-8 h-8 text-indigo-600 animate-spin inline-block" />
                   <p style={{ marginTop: 12 }}>Đang tải dữ liệu...</p>
               </div>
            ) : (
                <>
                {/* Screen */}
                <div className="screen-display">MÀN HÌNH</div>

                 {/* Seats */}
                 <div style={{ maxWidth: 1100, margin: "0 auto", overflowX: "auto" }}>
                  {sortedRows.map((row: string) => {
                    const rowSeats = seatsByRow[row].sort((a: any, b: any) => {
                        const numA = parseInt(a.seatNumber.slice(1)) || 0;
                        const numB = parseInt(b.seatNumber.slice(1)) || 0;
                        return numA - numB;
                    });

                    // Logic for chunks (same as before)
                    const chunks: any[][] = [];
                    let currentChunk: any[] = [];
                    let seatCount = 0;

                    rowSeats.forEach((seat: any) => {
                        const isCouple = seat.seatType === "COUPLE";
                        const seatSize = isCouple ? 2 : 1;
                        if (seatCount + seatSize > 20) {
                            chunks.push(currentChunk);
                            currentChunk = [];
                            seatCount = 0;
                        }
                        currentChunk.push(seat);
                        seatCount += seatSize;
                    });
                    if (currentChunk.length > 0) chunks.push(currentChunk);

                    return chunks.map((chunk, chunkIndex) => (
                        <div key={`${row}-${chunkIndex}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                             <div className="seat-row-label">{row}</div>
                             <div style={{ display: "flex", gap: 6 }}>
                                {chunk.map((seat: any) => {
                                    const isBooked = seat.booked;
                                    const isVip = seat.seatType === "VIP";
                                    const isCouple = seat.seatType === "COUPLE";
                                    const seatNum = seat.seatNumber.slice(1);

                                    // Modern Colors
                                    let bg = "#e5e7eb"; // Default Standard
                                    let color = "#374151";
                                    let border = "#d1d5db";

                                    if(isBooked) {
                                        bg = "#ef4444"; // Red
                                        color = "white";
                                        border = "#dc2626";
                                    } else if (isCouple) {
                                        bg = "#fce7f3"; // Pink
                                        color = "#be185d";
                                        border = "#fbcfe8";
                                    } else if (isVip) {
                                        bg = "#fef3c7"; // Amber
                                        color = "#b45309";
                                        border = "#fde68a";
                                    }

                                    return (
                                        <div
                                            key={seat.id}
                                            className="seat-cell"
                                            style={{
                                                width: isCouple ? 80 : 36,
                                                height: 36,
                                                background: bg,
                                                color: color,
                                                border: `1px solid ${border}`,
                                            }}
                                            title={`${seat.seatNumber} - ${seat.seatType}`}
                                        >
                                           {isCouple && <Sofa style={{ marginRight: 4, width: 12, height: 12 }} />}
                                           {seatNum}
                                        </div>
                                    )
                                })}
                             </div>
                        </div>
                    ))
                  })}
                 </div>

                 {/* Legend */}
                 <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40, flexWrap: "wrap", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
                    {[
                        { label: "Thường (Trống)", color: "#e5e7eb", border: "#d1d5db" },
                        { label: "VIP", color: "#fef3c7", border: "#fde68a" },
                        { label: "Ghế đôi", color: "#fce7f3", border: "#fbcfe8" },
                        { label: "Đã bán", color: "#ef4444", border: "#dc2626" }
                    ].map(l => (
                        <div key={l.label} className="legend-item">
                            <div className="legend-box" style={{ background: l.color, border: `1px solid ${l.border}` }}></div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{l.label}</span>
                        </div>
                    ))}
                 </div>
                </>
            )}
          </div>
        </>
      ) : (
         <div className="staff-card" style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 80, height: 80, background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Film style={{ width: 32, height: 32, color: "#9ca3af" }} />
            </div>
            <h3 style={{ fontSize: 18, color: "#374151", marginBottom: 8 }}>Chưa chọn suất chiếu</h3>
            <p style={{ color: "#6b7280" }}>Vui lòng chọn ngày và suất chiếu để xem dữ liệu vé & doanh thu.</p>
         </div>
      )}
    </div>
  );
}
