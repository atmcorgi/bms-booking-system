import { useQuery } from "@tanstack/react-query";
import { adminStatsApi } from "../../services/adminStatsApi";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await adminStatsApi.totals()).data,
  });

  const Box = ({ label, value }: { label: string; value: number }) => (
    <div
      className="section-box"
      style={{ textAlign: "center", padding: 16, background: "#fff" }}
    >
      <div style={{ fontSize: 12, color: "#6c757d" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value ?? 0}</div>
    </div>
  );

  return (
    <main className="container" style={{ padding: 16 }}>
      <section className="section-box">
        <h3 style={{ margin: 0 }}>Dashboard</h3>
      </section>
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <Box label="Phim" value={data?.movies ?? 0} />
          <Box label="Thể loại" value={data?.genres ?? 0} />
          <Box label="Rạp" value={data?.theaters ?? 0} />
          <Box label="Phòng" value={data?.rooms ?? 0} />
        </div>
      )}
    </main>
  );
}
