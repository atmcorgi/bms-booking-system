import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import "../../styles/admin-table.css";

interface TheaterDetailProps {}

const TheaterDetail: React.FC<TheaterDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "rooms" | "seats" | "movies" | "staff"
  >("overview");

  // Fetch theater details
  const {
    data: theater,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["theater", id],
    queryFn: async () => {
      const res = await adminTheaterApi.getById(Number(id!));
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch rooms for this theater - use theater data instead of separate API call
  const rooms = theater?.rooms || [];

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>⏳ Đang tải thông tin rạp...</div>
      </div>
    );
  }

  if (error || !theater) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>❌ Không tìm thấy thông tin rạp</div>
        <button
          onClick={() => navigate("/admin/theaters")}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            background: "#fff",
            color: "#6366f1",
            border: "1px solid #6366f1",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: "📊" },
    { id: "rooms", label: "Phòng chiếu", icon: "🎬" },
    { id: "seats", label: "Ghế ngồi", icon: "🪑" },
    { id: "movies", label: "Phim", icon: "🎭" },
    { id: "staff", label: "Nhân viên", icon: "👥" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* Minimal Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "20px",
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: 0,
              color: "#1f2937",
            }}
          >
            🎬 {theater.name}
          </h1>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Mã rạp: {theater.code} • {theater.address}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/theaters")}
          style={{
            padding: "8px 16px",
            background: "#fff",
            color: "#6366f1",
            border: "1px solid #6366f1",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
        >
          ← Quay lại
        </button>
      </div>

      {/* Minimal Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          background: "#f8fafc",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 20px",
              border: "none",
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "#6366f1" : "#64748b",
              cursor: "pointer",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "600" : "500",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow:
                activeTab === tab.id ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "400px" }}>
        {activeTab === "overview" && <OverviewTab theater={theater} />}
        {activeTab === "rooms" && <RoomsTab theater={theater} rooms={rooms} />}
        {activeTab === "seats" && <SeatsTab rooms={rooms} />}
        {activeTab === "movies" && <MoviesTab theater={theater} />}
        {activeTab === "staff" && <StaffTab />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ theater: any }> = ({ theater }) => {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
    >
      {/* Basic Info */}
      <div
        style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{ margin: "0 0 16px 0", color: "#1f2937", fontSize: "18px" }}
        >
          📋 Thông tin cơ bản
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Tên rạp:</span>
            <span style={{ fontWeight: "500" }}>{theater.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Mã rạp:</span>
            <span style={{ fontWeight: "500" }}>{theater.code}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Địa chỉ:</span>
            <span
              style={{
                fontWeight: "500",
                textAlign: "right",
                maxWidth: "200px",
              }}
            >
              {theater.address}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Điện thoại:</span>
            <span style={{ fontWeight: "500" }}>
              {theater.phone || "Chưa có"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Giờ hoạt động:</span>
            <span style={{ fontWeight: "500" }}>
              {theater.openTime} - {theater.closeTime}
            </span>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div
        style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{ margin: "0 0 16px 0", color: "#1f2937", fontSize: "18px" }}
        >
          📍 Thông tin địa lý
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Tỉnh/TP:</span>
            <span style={{ fontWeight: "500" }}>{theater.province?.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Quận/Huyện:</span>
            <span style={{ fontWeight: "500" }}>{theater.district?.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Tọa độ:</span>
            <span
              style={{
                fontWeight: "500",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            >
              {theater.latitude}, {theater.longitude}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          gridColumn: "1 / -1",
        }}
      >
        <h3
          style={{ margin: "0 0 16px 0", color: "#1f2937", fontSize: "18px" }}
        >
          📊 Thống kê
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#3b82f6" }}
            >
              {theater.rooms?.length || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              Phòng chiếu
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#10b981" }}
            >
              {theater.seats?.length || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Ghế ngồi</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#f59e0b" }}
            >
              {theater.showtimes?.length || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Suất chiếu</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#ef4444" }}
            >
              {theater.bookings?.length || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Đặt vé</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rooms Tab Component
const RoomsTab: React.FC<{ theater: any; rooms: any[] }> = ({
  theater,
  rooms,
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0, color: "#1f2937" }}>🎬 Quản lý phòng chiếu</h3>
        <button
          onClick={() => navigate(`/admin/theaters/${theater.id}/rooms/create`)}
          style={{
            padding: "8px 16px",
            background: "#fff",
            color: "#059669",
            border: "1px solid #059669",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
        >
          + Thêm phòng
        </button>
      </div>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Tên phòng
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Định dạng
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Số ghế
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Suất chiếu
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Chưa có phòng chiếu nào
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px" }}>
                    <div style={{ fontWeight: "500" }}>{room.name}</div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        background: "#f0f4ff",
                        color: "#4338ca",
                        border: "1px solid #6366f1",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {room.supportedFormats || "2D"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{room.seats?.length || 0}</td>
                  <td style={{ padding: "12px" }}>
                    {room.showtimes?.length || 0}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/theaters/${theater.id}/rooms/${room.id}/edit`
                        )
                      }
                      style={{
                        padding: "4px 8px",
                        background: "#fff",
                        color: "#6366f1",
                        border: "1px solid #6366f1",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        marginRight: "4px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      style={{
                        padding: "4px 8px",
                        background: "#fff",
                        color: "#dc2626",
                        border: "1px solid #dc2626",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Seats Tab Component
const SeatsTab: React.FC<{ rooms: any[] }> = ({ rooms }) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
    rooms?.[0]?.id
  );
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  return (
    <div>
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        🪑 Quản lý ghế ngồi
      </h3>

      {/* Room selector */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <label style={{ color: "#374151", fontWeight: 500 }}>Chọn phòng:</label>
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(Number(e.target.value))}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            minWidth: 220,
          }}
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <div style={{ color: "#6b7280", fontSize: 13 }}>
          Tổng ghế: <b>{selectedRoom?.seats?.length || 0}</b>
        </div>
      </div>

      {/* Seats table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th
                style={{
                  padding: 12,
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Mã ghế
              </th>
              <th
                style={{
                  padding: 12,
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Loại ghế
              </th>
              <th
                style={{
                  padding: 12,
                  textAlign: "center",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {(selectedRoom?.seats || []).length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{ padding: 28, textAlign: "center", color: "#6b7280" }}
                >
                  Chưa có dữ liệu ghế cho phòng này
                </td>
              </tr>
            ) : (
              (selectedRoom?.seats || []).map((s: any) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 12 }}>{s.seatNumber}</td>
                  <td style={{ padding: 12 }}>{s.seatType || "STANDARD"}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        cursor: "not-allowed",
                        color: "#9ca3af",
                      }}
                      disabled
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Movies Tab Component
const MoviesTab: React.FC<{ theater: any }> = ({ theater }) => {
  // Collect showtimes from rooms if available
  const roomShowtimes = (theater.rooms || []).flatMap((r: any) =>
    (r.showtimes || []).map((st: any) => ({ ...st, roomName: r.name }))
  );
  const showtimes = theater.showtimes?.length
    ? theater.showtimes
    : roomShowtimes;
  return (
    <div>
      <h3 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>
        🎭 Quản lý phim
      </h3>
      {!showtimes || showtimes.length === 0 ? (
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎭</div>
          <div>Chưa có dữ liệu suất chiếu</div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            Vào mục Staff → Scheduling để lên lịch và xuất bản suất chiếu
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Ngày chiếu
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Giờ chiếu
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Phòng
                </th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((st: any) => (
                <tr key={st.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 12 }}>{st.showDate}</td>
                  <td style={{ padding: 12 }}>{st.showTime}</td>
                  <td style={{ padding: 12 }}>
                    {st.room?.name || st.roomName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Staff Tab Component
const StaffTab: React.FC = () => {
  return (
    <div>
      <h3 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>
        👥 Quản lý nhân viên
      </h3>
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
        <div>Tính năng quản lý nhân viên đang được phát triển</div>
        <div style={{ fontSize: "14px", marginTop: "8px" }}>
          Sẽ có thể xem, thêm, sửa nhân viên được gán cho rạp này
        </div>
      </div>
    </div>
  );
};

export default TheaterDetail;
