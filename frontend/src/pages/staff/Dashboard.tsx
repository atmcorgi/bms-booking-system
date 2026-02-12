import { useQuery } from "@tanstack/react-query";
import { staffDashboardApi } from "../../services/staffDashboardApi";
import "../../styles/staff-booking.css"; // Modern CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBuilding, 
  faFilm, 
  faCalendarCheck, 
  faCalendarWeek, 
  faExclamationCircle, 
  faHistory,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";

export default function StaffDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => (await staffDashboardApi.get()).data,
  });

  if (isLoading) return (
      <div className="staff-container">
          <div className="staff-card" style={{textAlign: 'center', padding: 40}}>
              <div className="animate-spin" style={{ display: "inline-block", width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#4f46e5", borderRadius: "50%" }}></div>
              <p style={{marginTop: 12, color: "#6b7280"}}>Đang tải dashboard...</p>
          </div>
      </div>
  );
  
  if (error) return (
      <div className="staff-container">
          <div className="staff-alert staff-alert-error">
              <FontAwesomeIcon icon={faExclamationCircle} /> Lỗi tải dashboard. Vui lòng thử lại.
          </div>
      </div>
  );

  const theater = data?.theater;
  const assignments = data?.assignments || [];
  const today = data?.todayShowtimes || [];
  const week = data?.weekShowtimes || [];

  // Compute notifications from assignments
  const toDate = (s?: string) => (s ? new Date(s) : undefined);
  const isValid = (d?: Date) => d instanceof Date && !isNaN(d.getTime());
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  const todayDate = startOfDay(new Date());
  const sevenDaysAgo = addDays(todayDate, -7);
  const sevenDaysAfter = addDays(todayDate, 7);

  const recentAssigned = assignments
    .map((a: any) => ({ ...a, _from: toDate(a.activeFrom) }))
    .filter((a: any) => isValid(a._from))
    .filter((a: any) => {
      const fromDate = a._from as Date | undefined;
      return !!fromDate && fromDate >= sevenDaysAgo && fromDate <= todayDate;
    })
    .map((a: any) => ({
      movieCode: a.movieCode,
      movieTitle: a.movieTitle,
      activeFrom: a.activeFrom,
      daysAgo: Math.round(
        (todayDate.getTime() - (a._from as Date).getTime()) / 86400000
      ),
    }));

  const expiringSoon = assignments
    .map((a: any) => ({ ...a, _to: toDate(a.activeTo) }))
    .filter((a: any) => isValid(a._to))
    .filter((a: any) => {
      const toDateVal = a._to as Date | undefined;
      return (
        !!toDateVal && toDateVal >= todayDate && toDateVal <= sevenDaysAfter
      );
    })
    .map((a: any) => ({
      movieCode: a.movieCode,
      movieTitle: a.movieTitle,
      activeTo: a.activeTo,
      daysLeft: Math.round(
        ((a._to as Date).getTime() - todayDate.getTime()) / 86400000
      ),
    }));

  // Helper stats component
  const StatBox = ({ label, value, icon, colorClass }: any) => (
    <div className="staff-stat-card">
        <div className={`staff-stat-icon ${colorClass}`}>
            <FontAwesomeIcon icon={icon} />
        </div>
        <div className="staff-stat-info">
            <h4>{label}</h4>
            <span className="value">{value ?? 0}</span>
        </div>
    </div>
  );

  return (
    <div className="staff-container">
      {/* Header */}
      <div className="staff-header-section">
          <div>
            <h2 className="staff-title">
              <FontAwesomeIcon icon={faChartLine} className="text-primary-600" />
              Tổng quan
            </h2>
            <p className="staff-subtitle">
              <FontAwesomeIcon icon={faBuilding} /> 
              {theater ? `${theater.name} (${theater.code}) - ${theater.address}` : "Đang tải..."}
            </p>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="staff-stats-grid mb-6">
          <StatBox label="PHIM ĐÃ ASSIGN" value={assignments.length} icon={faFilm} colorClass="icon-blue" />
          <StatBox label="SUẤT HÔM NAY" value={today.length} icon={faCalendarCheck} colorClass="icon-green" />
          <StatBox label="SUẤT TRONG TUẦN" value={week.length} icon={faCalendarWeek} colorClass="icon-purple" />
      </div>

      {/* Notifications */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
          {/* New Assignments */}
          <div className="staff-card" style={{ marginBottom: 0 }}>
              <h3 style={{fontSize: 16, fontWeight: 600, paddingBottom: 12, borderBottom: "1px solid #eee", marginBottom: 12 }}>
                  <FontAwesomeIcon icon={faHistory} style={{ marginRight: 8, color: "#3b82f6" }} />
                  Phim mới được assign (7 ngày)
              </h3>
              {recentAssigned.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 13 }}>Không có thông báo mới</div>
              ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {recentAssigned.map((r: any, i: number) => (
                          <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                              <strong style={{ color: "#111827" }}>{r.movieTitle}</strong> 
                              <span style={{ color: "#6b7280" }}> ({r.movieCode})</span>
                              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                                  Từ: {r.activeFrom} • {r.daysAgo === 0 ? "Hôm nay" : `${r.daysAgo} ngày trước`}
                              </div>
                          </li>
                      ))}
                  </ul>
              )}
          </div>

          {/* Expiring Soon */}
          <div className="staff-card" style={{ marginBottom: 0 }}>
              <h3 style={{fontSize: 16, fontWeight: 600, paddingBottom: 12, borderBottom: "1px solid #eee", marginBottom: 12 }}>
                  <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: 8, color: "#f59e0b" }} />
                  Sắp hết hạn (7 ngày tới)
              </h3>
              {expiringSoon.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 13 }}>Không có phim nào sắp hết hạn</div>
              ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {expiringSoon.map((r: any, i: number) => (
                          <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                              <strong style={{ color: "#111827" }}>{r.movieTitle}</strong>
                              <span style={{ color: "#6b7280" }}> ({r.movieCode})</span>
                              <div style={{ fontSize: 12, color: "#ef4444", marginTop: 2 }}>
                                  Hết hạn: {r.activeTo} • Còn {r.daysLeft} ngày
                              </div>
                          </li>
                      ))}
                  </ul>
              )}
          </div>
      </div>

      {/* Tables Section */}
      <div className="staff-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Danh sách Phim đã Assign</h3>
          <div className="staff-table-wrap">
             <table className="staff-table">
                 <thead>
                     <tr>
                         <th>Code</th>
                         <th>Tiêu đề</th>
                         <th>Từ ngày</th>
                         <th>Đến ngày</th>
                     </tr>
                 </thead>
                 <tbody>
                     {assignments.length === 0 ? (
                         <tr><td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>Chưa có phim nào</td></tr>
                     ) : (
                         assignments.map((m: any, idx: number) => (
                             <tr key={idx}>
                                 <td className="text-mono" style={{fontWeight: 500}}>{m.movieCode}</td>
                                 <td style={{fontWeight: 600}}>{m.movieTitle}</td>
                                 <td>{m.activeFrom || "—"}</td>
                                 <td>{m.activeTo || "—"}</td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
          </div>
      </div>

      <div className="staff-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Lịch chiếu Hôm nay</h3>
          <div className="staff-table-wrap">
             <table className="staff-table">
                 <thead>
                     <tr>
                         <th>Giờ chiếu</th>
                         <th>Phòng</th>
                         <th>Phim</th>
                     </tr>
                 </thead>
                 <tbody>
                     {today.length === 0 ? (
                         <tr><td colSpan={3} style={{ textAlign: "center", color: "#6b7280" }}>Chưa có suất chiếu nào hôm nay</td></tr>
                     ) : (
                         today.map((s: any, idx: number) => (
                             <tr key={idx}>
                                 <td style={{fontWeight: 600, color: "#4f46e5"}}>{s.time}</td>
                                 <td><span className="staff-badge staff-badge-gray">{s.room}</span></td>
                                 <td style={{fontWeight: 500}}>{s.movie}</td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
          </div>
      </div>
    </div>
  );
}
