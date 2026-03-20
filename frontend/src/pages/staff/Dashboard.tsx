import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffDashboardApi } from "../../services/staffDashboardApi";
import "../../styles/staff-booking.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBuilding, 
  faFilm, 
  faCalendarCheck, 
  faCalendarWeek, 
  faExclamationCircle, 
  faHistory,
  faChartLine,
  faInfoCircle,
  faMapMarkerAlt,
  faPhone
} from "@fortawesome/free-solid-svg-icons";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "dashboard">("dashboard");

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

  return (
    <div className="staff-container">
      {/* Header */}
      <div className="staff-header-section" style={{ paddingBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
            <div>
              <h2 className="staff-title" style={{ fontSize: 24, marginBottom: 4 }}>
                <FontAwesomeIcon icon={faBuilding} className="text-primary-600" />
                {theater ? ` ${theater.name}` : "Đang tải rạp..."}
              </h2>
              <p className="staff-subtitle" style={{ fontSize: 13, color: "#6b7280" }}>
                Mã: {theater?.code} • {theater?.address}
              </p>
            </div>
            
            {/* Tabs */}
            <div style={{ display: "flex", background: "#f3f4f6", padding: 4, borderRadius: 8 }}>
              <button
                onClick={() => setActiveTab("overview")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  background: activeTab === "overview" ? "#fff" : "transparent",
                  color: activeTab === "overview" ? "#4f46e5" : "#6b7280",
                  cursor: "pointer",
                  borderRadius: 6,
                  fontWeight: activeTab === "overview" ? 600 : 500,
                  fontSize: 14,
                  transition: "all 0.2s",
                  boxShadow: activeTab === "overview" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                }}
              >
                <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: 6 }} />
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  background: activeTab === "dashboard" ? "#fff" : "transparent",
                  color: activeTab === "dashboard" ? "#4f46e5" : "#6b7280",
                  cursor: "pointer",
                  borderRadius: 6,
                  fontWeight: activeTab === "dashboard" ? 600 : 500,
                  fontSize: 14,
                  transition: "all 0.2s",
                  boxShadow: activeTab === "dashboard" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                }}
              >
                <FontAwesomeIcon icon={faChartLine} style={{ marginRight: 6 }} />
                Lịch chiếu & Phim
              </button>
            </div>
          </div>
      </div>

      {/* Content */}
      {activeTab === "overview" ? <OverviewTab theater={theater} /> : <DashboardTab data={data} />}
    </div>
  );
}

const OverviewTab = ({ theater }: { theater: any }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
      {/* Theater Info Card */}
      <div className="staff-card" style={{ margin: 0 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, borderBottom: "1px solid #f3f4f6", paddingBottom: 12, marginBottom: 16 }}>
          <FontAwesomeIcon icon={faInfoCircle} style={{ color: "#4f46e5", marginRight: 8 }} />
          Chi tiết Rạp
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
           <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", flexShrink: 0 }}>
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Tên rạp / Mã rạp</p>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{theater?.name} ({theater?.code})</p>
              </div>
           </div>

           <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Địa chỉ</p>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{theater?.address}</p>
                {theater?.province && (
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                    {theater?.district?.name}, {theater?.province?.name}
                  </p>
                )}
              </div>
           </div>

           <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0 }}>
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Hotline hỗ trợ</p>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{theater?.phone || "1900 1234"}</p>
              </div>
           </div>
           
           <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", flexShrink: 0 }}>
                <FontAwesomeIcon icon={faFilm} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Cơ sở vật chất</p>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>
                  {theater?.roomCount || 0} phòng chiếu • {theater?.seatCount || 0} ghế ngồi
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Theater Images - Placeholder for showcase */}
      <div className="staff-card" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
         <div style={{ height: "100%", minHeight: 250, background: "#f8fafc", position: "relative" }}>
            <img 
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop" 
              alt="Cinema exterior"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "40px 20px 20px" }}>
              <h4 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 600 }}>Không gian Rạp chiếu</h4>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Mang đến trải nghiệm phim ảnh đỉnh cao</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const DashboardTab = ({ data }: { data: any }) => {
  const assignments = data?.assignments || [];
  const today = data?.todayShowtimes || [];
  const week = data?.weekShowtimes || [];

  const toDate = (s?: string) => (s ? new Date(s) : undefined);
  const isValid = (d?: Date) => d instanceof Date && !isNaN(d.getTime());
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

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
      daysAgo: Math.round((todayDate.getTime() - (a._from as Date).getTime()) / 86400000),
    }));

  const expiringSoon = assignments
    .map((a: any) => ({ ...a, _to: toDate(a.activeTo) }))
    .filter((a: any) => isValid(a._to))
    .filter((a: any) => {
      const toDateVal = a._to as Date | undefined;
      return !!toDateVal && toDateVal >= todayDate && toDateVal <= sevenDaysAfter;
    })
    .map((a: any) => ({
      movieCode: a.movieCode,
      movieTitle: a.movieTitle,
      activeTo: a.activeTo,
      daysLeft: Math.round(((a._to as Date).getTime() - todayDate.getTime()) / 86400000),
    }));

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
    <div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Tables Section */}
          <div className="staff-card" style={{ margin: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Danh sách Phim đã Assign</h3>
              <div className="staff-table-wrap">
                  <table className="staff-table">
                      <thead>
                          <tr>
                              <th>Code</th>
                              <th>Tiêu đề</th>
                              <th>Đến ngày</th>
                          </tr>
                      </thead>
                      <tbody>
                          {assignments.length === 0 ? (
                              <tr><td colSpan={3} style={{ textAlign: "center", color: "#6b7280" }}>Chưa có phim nào</td></tr>
                          ) : (
                              assignments.map((m: any, idx: number) => (
                                  <tr key={idx}>
                                      <td className="text-mono" style={{fontWeight: 500}}>{m.movieCode}</td>
                                      <td style={{fontWeight: 600}}>{m.movieTitle}</td>
                                      <td>{m.activeTo || "—"}</td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="staff-card" style={{ margin: 0 }}>
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
                                      <td style={{fontWeight: 500, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}} title={s.movie}>{s.movie}</td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};
