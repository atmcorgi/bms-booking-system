import { useQuery } from "@tanstack/react-query";
import { staffDashboardApi } from "../../services/staffDashboardApi";
// Dashboard notifications are derived locally from assignments

export default function StaffDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => (await staffDashboardApi.get()).data,
  });

  // no external notification fetch for dashboard

  if (isLoading) return <div className="section-box">Đang tải...</div>;
  if (error) return <div className="section-box">Lỗi tải dashboard</div>;

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
      code: a.code,
      title: a.title,
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
      code: a.code,
      title: a.title,
      activeTo: a.activeTo,
      daysLeft: Math.round(
        ((a._to as Date).getTime() - todayDate.getTime()) / 86400000
      ),
    }));

  const Box = ({ label, value }: { label: string; value: number }) => (
    <div className="section-box" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12, color: "#6c757d" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value ?? 0}</div>
    </div>
  );

  return (
    <main className="container" style={{ padding: 16 }}>
      <section className="section-box">
        <h3 style={{ margin: 0 }}>Staff Dashboard</h3>
        {theater && (
          <div style={{ marginTop: 8 }}>
            <div>
              <strong>Rạp:</strong> {theater.name} ({theater.code})
            </div>
            <div>
              <strong>Địa chỉ:</strong> {theater.address}
            </div>
          </div>
        )}
      </section>
      <section className="section-box" style={{ marginTop: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <Box label="Phim đã assign" value={assignments.length} />
          <Box label="Suất hôm nay" value={today.length} />
          <Box label="Suất trong tuần" value={week.length} />
        </div>
      </section>
      <section className="section-box" style={{ marginTop: 12 }}>
        <h4 style={{ margin: 0 }}>Thông báo</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 8,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Phim mới được assign (7 ngày)
            </div>
            {recentAssigned.length === 0 ? (
              <div style={{ color: "#6c757d" }}>Không có</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {recentAssigned.map((r: any, i: number) => (
                  <li key={i}>
                    <strong>{r.title}</strong> ({r.code}) - {r.activeFrom} (
                    {r.daysAgo} ngày trước)
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Phim sắp hết hạn (7 ngày tới)
            </div>
            {expiringSoon.length === 0 ? (
              <div style={{ color: "#6c757d" }}>Không có</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {expiringSoon.map((r: any, i: number) => (
                  <li key={i}>
                    <strong>{r.title}</strong> ({r.code}) - hết hạn {r.activeTo}{" "}
                    (còn {r.daysLeft} ngày)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <section className="section-box" style={{ marginTop: 12 }}>
        <h4 style={{ margin: 0 }}>Phim đã assign</h4>
        <table
          width="100%"
          cellPadding={8}
          style={{
            background: "#fff",
            border: "1px solid #e9ecef",
            marginTop: 8,
          }}
        >
          <thead>
            <tr>
              <th align="left">Code</th>
              <th align="left">Tiêu đề</th>
              <th align="left">Từ</th>
              <th align="left">Đến</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((m: any, idx: number) => (
              <tr key={idx}>
                <td>{m.code}</td>
                <td>{m.title}</td>
                <td>{m.activeFrom || ""}</td>
                <td>{m.activeTo || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="section-box" style={{ marginTop: 12 }}>
        <h4 style={{ margin: 0 }}>Suất hôm nay</h4>
        <table
          width="100%"
          cellPadding={8}
          style={{
            background: "#fff",
            border: "1px solid #e9ecef",
            marginTop: 8,
          }}
        >
          <thead>
            <tr>
              <th align="left">Giờ</th>
              <th align="left">Phòng</th>
              <th align="left">Phim</th>
            </tr>
          </thead>
          <tbody>
            {today.map((s: any, idx: number) => (
              <tr key={idx}>
                <td>{s.time}</td>
                <td>{s.room}</td>
                <td>{s.movie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
