import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import { adminMovieAssignmentApi } from "../../services/adminMovieAssignmentApi";
import ConfirmModal from "../../components/shared/ConfirmModal";
import { adminSeatApi } from "../../services/adminSeatApi";
import { adminStaffApi } from "../../services/adminStaffApi";
import apiClient from "../../services/apiClient";
import "../../styles/admin-table.css";
import AssignMovieModal from "../../components/admin/AssignMovieModal";
import AssignStaffModal from "../../components/admin/AssignStaffModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomDropdown from "../../components/CustomDropdown";
import {
  faClock,
  faFilm,
  faCalendarAlt,
  faLanguage,
  faVideo,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faChartBar,
  faTheaterMasks,
  faUsers,
  faCouch,
  faUserPlus,
  faUserTie,
  faEnvelope,
  faIdBadge,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

interface TheaterDetailProps {}

// Modern color palette for avatars
const getAvatarColor = (id: number) => {
  const modernColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Purple
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink-Red
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Blue-Cyan
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green-Teal
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Pink-Yellow
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", // Cyan-Purple
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Mint-Pink
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", // Coral-Pink
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", // Peach
    "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)", // Red-Blue
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", // Lavender-Blue
    "linear-gradient(135deg, #f77062 0%, #fe5196 100%)", // Orange-Pink
  ];
  return modernColors[id % modernColors.length];
};

const TheaterDetail: React.FC<TheaterDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "rooms" | "seats" | "movies" | "staff"
  >("overview");
  const [isAssignMovieModalOpen, setIsAssignMovieModalOpen] = useState(false);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);

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

  const theaterId = theater?.id as number | undefined;

  // Fetch rooms for this theater - fallback to API if not in theater data
  const { data: roomsApi } = useQuery({
    queryKey: ["theater-rooms", theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      const res = await adminTheaterApi.getRooms(Number(theaterId));
      return res.data as any[];
    },
    enabled: !!theaterId && (!theater?.rooms || theater.rooms.length === 0),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const rooms =
    (theater?.rooms && theater.rooms.length > 0 ? theater.rooms : roomsApi) ||
    [];

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Đang tải thông tin rạp...</div>
      </div>
    );
  }

  if (error || !theater) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Không tìm thấy thông tin rạp</div>
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
    { id: "overview", label: "Tổng quan", icon: faChartBar },
    { id: "rooms", label: "Phòng chiếu", icon: faFilm },
    { id: "seats", label: "Ghế ngồi", icon: faCouch },
    { id: "movies", label: "Phim", icon: faTheaterMasks },
    { id: "staff", label: "Nhân viên", icon: faUsers },
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
            <FontAwesomeIcon icon={faFilm} style={{ marginRight: "8px" }} />{" "}
            {theater.name}
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
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "400px" }}>
        {activeTab === "overview" && <OverviewTab theater={theater} />}
        {activeTab === "rooms" && (
          <RoomsTab theater={theater} rooms={rooms} theaterId={theaterId} />
        )}
        {activeTab === "seats" && (
          <SeatsTab rooms={rooms} theaterId={theaterId} />
        )}
        {activeTab === "movies" && (
          <MoviesTab
            theater={theater}
            rooms={rooms}
            onOpenAssignMovieModal={() => setIsAssignMovieModalOpen(true)}
          />
        )}
        {activeTab === "staff" && (
          <StaffTab
            theaterId={theaterId}
            onOpenAssignStaffModal={() => setIsAssignStaffModalOpen(true)}
          />
        )}
      </div>
      {isAssignMovieModalOpen && theaterId && (
        <AssignMovieModal
          theaterId={theaterId}
          onClose={() => setIsAssignMovieModalOpen(false)}
        />
      )}
      {isAssignStaffModalOpen && theaterId && (
        <AssignStaffModal
          theaterId={theaterId}
          onClose={() => setIsAssignStaffModalOpen(false)}
        />
      )}
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
          Thông tin cơ bản
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
          Thống kê
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
              {theater.roomCount || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              Phòng chiếu
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#10b981" }}
            >
              {theater.seatCount || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Ghế ngồi</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#f59e0b" }}
            >
              {theater.showtimeCount || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Suất chiếu</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "600", color: "#ef4444" }}
            >
              {theater.bookingCount || 0}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Đặt vé</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rooms Tab Component
const RoomsTab: React.FC<{
  theater: any;
  rooms: any[];
  theaterId?: number;
}> = ({ rooms, theaterId }) => {
  const qc = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    supportedFormats: "2D",
  });
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: { name: string; supportedFormats: string }) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminTheaterApi.createRoom(theaterId, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-rooms", theaterId] });
      qc.invalidateQueries({ queryKey: ["theater", theaterId] });
      setIsRoomModalOpen(false);
      setRoomFormData({ name: "", supportedFormats: "2D" });
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message: error?.response?.data?.error || "Có lỗi khi tạo phòng",
      });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, data }: { roomId: number; data: any }) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminTheaterApi.updateRoom(theaterId, roomId, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-rooms", theaterId] });
      qc.invalidateQueries({ queryKey: ["theater", theaterId] });
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      setRoomFormData({ name: "", supportedFormats: "2D" });
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message: error?.response?.data?.error || "Có lỗi khi cập nhật phòng",
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminTheaterApi.deleteRoom(theaterId, roomId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-rooms", theaterId] });
      qc.invalidateQueries({ queryKey: ["theater", theaterId] });
      setIsConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      setIsConfirmOpen(false);
      setItemToDelete(null);
      setErrorModal({
        show: true,
        message: error?.response?.data?.error || "Có lỗi khi xóa phòng",
      });
    },
  });

  const handleDeleteClick = (room: any) => {
    setItemToDelete(room);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteRoomMutation.mutate(itemToDelete.id);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setRoomFormData({ name: "", supportedFormats: "2D" });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditModal = (room: any) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.name,
      supportedFormats: room.supportedFormats || "2D",
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = () => {
    if (!roomFormData.name.trim()) {
      setErrorModal({ show: true, message: "Vui lòng nhập tên phòng!" });
      return;
    }

    if (editingRoom) {
      updateRoomMutation.mutate({ roomId: editingRoom.id, data: roomFormData });
    } else {
      createRoomMutation.mutate(roomFormData);
    }
  };

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
        <h3 style={{ margin: 0, color: "#1f2937" }}>
          <FontAwesomeIcon icon={faFilm} style={{ marginRight: "8px" }} /> Quản
          lý phòng chiếu
        </h3>
        <button
          onClick={handleOpenCreateModal}
          className="fd-btn"
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
                  <td style={{ padding: "12px" }}>{room.seatCount || 0}</td>
                  <td style={{ padding: "12px" }}>{room.showtimeCount || 0}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div className="action-group">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleOpenEditModal(room)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteClick(room)}
                        disabled={deleteRoomMutation.isPending}
                      >
                        {deleteRoomMutation.isPending ? "Đang xóa..." : "Xoá"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng "${itemToDelete?.name}"?`}
      />

      {/* Room Create/Edit Modal */}
      {isRoomModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1002,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "500px",
              maxWidth: "90%",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: "20px", color: "#1f2937" }}
            >
              {editingRoom ? "Sửa phòng chiếu" : "Thêm phòng chiếu"}
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Tên phòng <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={roomFormData.name}
                onChange={(e) =>
                  setRoomFormData({ ...roomFormData, name: e.target.value })
                }
                placeholder="Ví dụ: Phòng 1"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Định dạng hỗ trợ
              </label>
              <select
                value={roomFormData.supportedFormats}
                onChange={(e) =>
                  setRoomFormData({
                    ...roomFormData,
                    supportedFormats: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="2D|3D">2D | 3D</option>
                <option value="IMAX">IMAX</option>
                <option value="4DX">4DX</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsRoomModalOpen(false);
                  setEditingRoom(null);
                  setRoomFormData({ name: "", supportedFormats: "2D" });
                }}
                className="fd-btn-secondary"
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRoom}
                disabled={
                  createRoomMutation.isPending || updateRoomMutation.isPending
                }
                className="fd-btn"
                style={{
                  padding: "10px 20px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  marginTop: "0px",
                }}
              >
                {createRoomMutation.isPending || updateRoomMutation.isPending
                  ? "Đang lưu..."
                  : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ConfirmModal
        isOpen={errorModal.show}
        title="Thông báo"
        message={errorModal.message}
        onConfirm={() => setErrorModal({ show: false, message: "" })}
        onClose={() => setErrorModal({ show: false, message: "" })}
        confirmText="Đóng"
        showCancel={false}
      />
    </div>
  );
};

// Seats Tab Component
const SeatsTab: React.FC<{ rooms: any[]; theaterId?: number }> = ({
  rooms,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
    rooms?.[0]?.id
  );
  const [page, setPage] = useState(0);
  const pageSize = 50; // 10 columns * 5 rows
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<any | null>(null);
  const [hoveredSeatId, setHoveredSeatId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const qc = useQueryClient();

  // Load seats for selected room with pagination
  const { data: seatsData, isLoading: isLoadingSeats } = useQuery({
    queryKey: ["room-seats", selectedRoomId, page],
    queryFn: async () => {
      if (!selectedRoomId) return null;
      try {
        const res = await apiClient.get(
          `/api/admin/rooms/${selectedRoomId}/seats`,
          { params: { page, size: pageSize } }
        );
        return res.data;
      } catch (error) {
        console.warn(`Failed to load seats for room ${selectedRoomId}:`, error);
        return null;
      }
    },
    enabled: !!selectedRoomId,
    staleTime: 1000 * 60, // 1 minute
  });

  const seats = seatsData?.content || [];
  const totalPages = seatsData?.totalPages || 0;

  useEffect(() => {
    // Reset to page 0 when room changes
    setPage(0);
  }, [selectedRoomId]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => adminSeatApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room-seats", selectedRoomId] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => adminSeatApi.update(payload.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room-seats", selectedRoomId] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (seatId: number) => adminSeatApi.remove(seatId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room-seats", selectedRoomId] });
      setIsConfirmOpen(false);
      setItemToDelete(null);
    },
  });

  const handleAdd = () => {
    setSelectedSeat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (seat: any) => {
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (seat: any) => {
    setItemToDelete(seat);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const handleSave = (seat: any) => {
    if (selectedSeat) {
      console.log("Updating seat:", { ...seat, id: selectedSeat.id });
      updateMutation.mutate({ ...seat, id: selectedSeat.id });
    } else {
      console.log("Creating seat:", { ...seat, room: { id: selectedRoomId } });
      createMutation.mutate({ ...seat, room: { id: selectedRoomId } });
    }
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        🪑 Quản lý ghế ngồi
      </h3>

      {rooms.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#6b7280",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        >
          Chưa có phòng chiếu nào. Vui lòng tạo phòng trước.
        </div>
      ) : (
        <>
          {/* Room Selection Tabs */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "300px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  background: "#f8fafc",
                  padding: "6px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      background:
                        selectedRoomId === room.id ? "#6366f1" : "#fff",
                      color: selectedRoomId === room.id ? "#fff" : "#64748b",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: selectedRoomId === room.id ? "600" : "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow:
                        selectedRoomId === room.id
                          ? "0 2px 4px rgba(99, 102, 241, 0.2)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRoomId !== room.id) {
                        e.currentTarget.style.background = "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRoomId !== room.id) {
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#0369a1",
                  fontWeight: "500",
                }}
              >
                Tổng ghế:
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#0c4a6e",
                  fontWeight: "700",
                }}
              >
                {seatsData?.totalElements || 0}
              </span>
            </div>

            <button
              onClick={handleAdd}
              style={{
                padding: "10px 20px",
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#047857";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(5, 150, 105, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#059669";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(5, 150, 105, 0.2)";
              }}
            >
              <span style={{ fontSize: "16px" }}>+</span>
              Thêm ghế
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "20px",
            }}
          >
            {isLoadingSeats ? (
              <div style={{ textAlign: "center" }}>Đang tải ghế...</div>
            ) : seats.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  padding: "40px 0",
                }}
              >
                Chưa có dữ liệu ghế cho phòng này
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(10, 1fr)",
                  gap: "12px",
                }}
              >
                {seats.map((s: any) => (
                  <div
                    key={s.id}
                    className="seat-card"
                    onMouseEnter={() => setHoveredSeatId(s.id)}
                    onMouseLeave={() => setHoveredSeatId(null)}
                    style={{
                      padding: "8px",
                      border:
                        s.seatType === "VIP"
                          ? "1px solid #EA7B7B"
                          : s.seatType === "COUPLE"
                            ? "1px solid #FFD8DF"
                            : "1px solid #e2e8f0",
                      borderRadius: "6px",
                      background:
                        s.seatType === "VIP"
                          ? "#EA7B7B"
                          : s.seatType === "COUPLE"
                            ? "#BB8ED0"
                            : "#f8fafc",
                      textAlign: "center",
                      position: "relative",
                      color:
                        s.seatType === "VIP" || s.seatType === "COUPLE"
                          ? "#FFFFFF"
                          : "#374151",
                      // Adjust width for COUPLE seats
                      gridColumn: s.seatType === "COUPLE" ? "span 2" : "span 1",
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>
                      {s.seatNumber}
                    </div>
                    <div
                      style={{
                        color:
                          s.seatType === "VIP" || s.seatType === "COUPLE"
                            ? "#FFFFFF"
                            : "#64748b",
                        fontSize: "11px",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.seatType || "STANDARD"}
                    </div>
                    <div
                      className="seat-actions"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        display: "flex",
                        gap: 4,
                        opacity: hoveredSeatId === s.id ? 1 : 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(s)}
                        style={{
                          padding: "2px 4px",
                          fontSize: 10,
                          border: "1px solid #94a3b8",
                          background: "#f1f5f9",
                          borderRadius: 4,
                          cursor: "pointer",
                          outline: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#e2e8f0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#f1f5f9")
                        }
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(s)}
                        style={{
                          padding: "2px 4px",
                          fontSize: 10,
                          border: "1px solid #ef4444",
                          background: "#fee2e2",
                          color: "#ef4444",
                          borderRadius: 4,
                          cursor: "pointer",
                          outline: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fecaca")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fee2e2")
                        }
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="fd-btn"
                  style={{ marginTop: 0 }}
                >
                  Trước
                </button>
                <span style={{ color: "#475569", fontSize: 14 }}>
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page + 1 >= totalPages}
                  className="fd-btn"
                  style={{ marginTop: 0 }}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {isModalOpen && (
        <SeatModal
          seat={selectedSeat}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa ghế"
        message={`Bạn có chắc chắn muốn xóa ghế "${itemToDelete?.seatNumber}"?`}
      />
    </div>
  );
};

const SeatModal: React.FC<{
  seat: any;
  onClose: () => void;
  onSave: (seat: any) => void;
}> = ({ seat, onClose, onSave }) => {
  const [seatNumber, setSeatNumber] = useState(seat?.seatNumber || "");
  const [seatType, setSeatType] = useState(seat?.seatType || "STANDARD");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const seatTypeOptions = [
    { value: "STANDARD", label: "Standard", color: "#6b7280" },
    { value: "VIP", label: "VIP", color: "#f59e0b" },
    { value: "COUPLE", label: "Couple", color: "#ec4899" },
  ];

  const selectedOption =
    seatTypeOptions.find((opt) => opt.value === seatType) || seatTypeOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatNumber || !seatType) {
      return; // Form validation - required fields
    }
    onSave({ seatNumber, seatType });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 8,
          width: 400,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 24 }}>
          {seat ? "Edit Seat" : "Add Seat"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              Seat Number
            </label>
            <input
              type="text"
              value={seatNumber}
              placeholder="VD: A01"
              onChange={(e) => setSeatNumber(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
              }}
              required
            />
          </div>
          <div
            style={{ marginBottom: 24, position: "relative" }}
            ref={dropdownRef}
          >
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#374151",
                fontSize: "14px",
              }}
            >
              Loại ghế
            </label>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${isDropdownOpen ? "#6366f1" : "#e5e7eb"}`,
                borderRadius: 8,
                fontSize: "14px",
                cursor: "pointer",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s",
                boxShadow: isDropdownOpen
                  ? "0 0 0 3px rgba(99, 102, 241, 0.1)"
                  : "none",
              }}
            >
              <span style={{ fontWeight: 600, color: selectedOption.color }}>
                {selectedOption.label}
              </span>
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                {isDropdownOpen ? "▲" : "▼"}
              </span>
            </div>

            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "4px",
                  background: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                {seatTypeOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setSeatType(option.value);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background:
                        seatType === option.value ? "#f0f9ff" : "#fff",
                      borderLeft:
                        seatType === option.value
                          ? "4px solid #6366f1"
                          : "4px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (seatType !== option.value) {
                        e.currentTarget.style.background = "#f9fafb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (seatType !== option.value) {
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    <span
                      style={{ fontWeight: 600, color: option.color, flex: 1 }}
                    >
                      {option.label}
                    </span>
                    {seatType === option.value && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        style={{ color: "#6366f1", fontSize: "16px" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              className="fd-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="fd-btn" style={{ marginTop: 0 }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Movies Tab Component
const MoviesTab: React.FC<{
  theater: any;
  rooms: any[];
  onOpenAssignMovieModal: () => void;
}> = ({ theater, rooms, onOpenAssignMovieModal }) => {
  const theaterId = theater?.id as number | undefined;
  const qc = useQueryClient();

  const [assignedMoviesPage, setAssignedMoviesPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "expired"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmUnassign, setConfirmUnassign] = useState<{
    show: boolean;
    movieCode: string;
    movieTitle: string;
  }>({ show: false, movieCode: "", movieTitle: "" });

  // Fetch assigned movies
  const { data: assignedMovies } = useQuery({
    queryKey: ["theater-movies", theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      const res = await adminMovieAssignmentApi.listByTheater(theaterId);
      return res.data;
    },
    enabled: !!theaterId,
  });

  // Movie assignment mutations

  const unassignMovieMutation = useMutation({
    mutationFn: async (movieCode: string) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminMovieAssignmentApi.unassign(theaterId, movieCode);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-movies", theaterId] });
    },
  });

  const unassignAllMoviesMutation = useMutation({
    mutationFn: async () => {
      if (!theaterId) throw new Error("Missing theaterId");
      const movies: any[] = assignedMovies || [];
      for (const m of movies) {
        await adminMovieAssignmentApi.unassign(theaterId, m.movieCode);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-movies", theaterId] });
    },
  });

  // Showtimes state
  const [showtimePage, setShowtimePage] = useState(0);
  const [showtimeFrom, setShowtimeFrom] = useState("");
  const [showtimeTo, setShowtimeTo] = useState("");
  const [showtimeRoomId, setShowtimeRoomId] = useState<number | "">("");

  // Fetch showtimes
  const { data: showtimesData, isLoading: isLoadingShowtimes } = useQuery({
    queryKey: ["theater-showtimes", theaterId, showtimePage, showtimeFrom, showtimeTo, showtimeRoomId],
    queryFn: async () => {
      if (!theaterId) return { items: [], totalPages: 0, totalItems: 0 };
      const res = await adminTheaterApi.getShowtimes(theaterId, {
        page: showtimePage,
        startDate: showtimeFrom || undefined,
        endDate: showtimeTo || undefined,
        roomId: showtimeRoomId || undefined,
        size: 10
      });
      return res.data;
    },
    enabled: !!theaterId,
  });

  const showtimes = showtimesData?.items || [];


  // Filter assigned movies
  const filteredMovies = (assignedMovies || []).filter((movie: any) => {
    const today = new Date().toISOString().split("T")[0];

    // Filter by status
    if (filterStatus === "active") {
      if (movie.activeTo && movie.activeTo < today) return false;
      if (movie.activeFrom && movie.activeFrom > today) return false;
    } else if (filterStatus === "expired") {
      if (!movie.activeTo || movie.activeTo >= today) return false;
    }

    // Filter by date range
    if (dateFrom && movie.activeTo && movie.activeTo < dateFrom) return false;
    if (dateTo && movie.activeFrom && movie.activeFrom > dateTo) return false;

    return true;
  });

  return (
    <div>
      <div
        style={{
          marginBottom: "24px",
          padding: "20px 24px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#1f2937",
              fontSize: "20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FontAwesomeIcon
              icon={faTheaterMasks}
              style={{ fontSize: "20px", marginRight: "8px" }}
            />
            Phân công phim cho rạp
          </h3>
          <p
            style={{
              margin: "8px 0 0 0",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Phân công phim cho rạp để Staff có thể tạo lịch chiếu
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={onOpenAssignMovieModal}
            className="fd-btn"
            style={{
              padding: "10px 20px",
              background: "#059669",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              borderRadius: "6px",
              whiteSpace: "nowrap",
            }}
          >
            + Gán phim mới
          </button>
          <button
            onClick={() => {
              const count = assignedMovies?.length || 0;
              if (count === 0) return;
              if (
                window.confirm(
                  `Bỏ gán TẤT CẢ ${count} phim khỏi rạp này? Không thể hoàn tác.`
                )
              ) {
                unassignAllMoviesMutation.mutate();
              }
            }}
            disabled={unassignAllMoviesMutation.isPending || !assignedMovies?.length}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: unassignAllMoviesMutation.isPending || !assignedMovies?.length ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              borderRadius: "6px",
              whiteSpace: "nowrap",
              opacity: unassignAllMoviesMutation.isPending || !assignedMovies?.length ? 0.6 : 1,
            }}
          >
            {unassignAllMoviesMutation.isPending ? "Đang xóa..." : "Bỏ gán tất cả"}
          </button>
        </div>
      </div>

      {/* Assigned Movies List */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: "20px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: "#1f2937",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Phim đã được phân công ({filteredMovies.length})
          </h4>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label
              style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}
            >
              Trạng thái:
            </label>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "140px",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {filterStatus === "all" && "Tất cả"}
                  {filterStatus === "active" && (
                    <>
                      <span style={{ color: "#059669" }}>●</span> Còn hạn
                    </>
                  )}
                  {filterStatus === "expired" && (
                    <>
                      <span style={{ color: "#dc2626" }}>●</span> Hết hạn
                    </>
                  )}
                </span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>▼</span>
              </button>
              {isStatusDropdownOpen && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10,
                    }}
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 20,
                      minWidth: "140px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => {
                        setFilterStatus("all");
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                        background: filterStatus === "all" ? "#f3f4f6" : "#fff",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          filterStatus === "all" ? "#f3f4f6" : "#fff")
                      }
                    >
                      Tất cả
                    </div>
                    <div
                      onClick={() => {
                        setFilterStatus("active");
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                        background:
                          filterStatus === "active" ? "#f3f4f6" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          filterStatus === "active" ? "#f3f4f6" : "#fff")
                      }
                    >
                      <span style={{ color: "#059669" }}>●</span> Còn hạn
                    </div>
                    <div
                      onClick={() => {
                        setFilterStatus("expired");
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                        background:
                          filterStatus === "expired" ? "#f3f4f6" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          filterStatus === "expired" ? "#f3f4f6" : "#fff")
                      }
                    >
                      <span style={{ color: "#dc2626" }}>●</span> Hết hạn
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label
              style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}
            >
              Từ ngày:
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label
              style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}
            >
              Đến ngày:
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          {(filterStatus !== "all" || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setDateFrom("");
                setDateTo("");
              }}
              style={{
                padding: "6px 12px",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        {filteredMovies && filteredMovies.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredMovies
                .slice(assignedMoviesPage * 6, (assignedMoviesPage + 1) * 6)
                .map((movie: any) => {
                  const today = new Date().toISOString().split("T")[0];
                  const isExpired = movie.activeTo && movie.activeTo < today;
                  const isActive =
                    (!movie.activeFrom || movie.activeFrom <= today) &&
                    (!movie.activeTo || movie.activeTo >= today);

                  return (
                    <div
                      key={movie.movieCode}
                      style={{
                        padding: "20px",
                        background: isExpired ? "#fef2f2" : "#fff",
                        border: `1px solid ${isExpired ? "#fecaca" : "#e2e8f0"}`,
                        borderRadius: "12px",
                        display: "flex",
                        gap: "20px",
                        alignItems: "flex-start",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
                        transition: "all 0.2s",
                        height: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0, 0, 0, 0.06)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Poster */}
                      <img
                        src={
                          movie.posterUrl ||
                          "https://via.placeholder.com/80x120?text=No+Poster"
                        }
                        alt={movie.title}
                        style={{
                          width: "80px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          flexShrink: 0,
                        }}
                      />

                      {/* Content */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {/* Header with title and status */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                fontWeight: "600",
                                color: "#1f2937",
                                fontSize: "15px",
                                lineHeight: "1.3",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                              }}
                              title={movie.title || movie.movieCode}
                            >
                              {movie.title || movie.movieCode}
                            </h4>
                            {isExpired && (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  borderRadius: "10px",
                                  border: "1px solid #fecaca",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                                Hết hạn
                              </span>
                            )}
                            {isActive && (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  background: "#d1fae5",
                                  color: "#059669",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  borderRadius: "10px",
                                  border: "1px solid #a7f3d0",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Còn hạn
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#9ca3af",
                              fontFamily: "monospace",
                            }}
                          >
                            #{movie.movieCode}
                          </div>
                        </div>

                        {/* Info compact */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            fontSize: "12px",
                          }}
                        >
                          {/* Duration & Director */}
                          {movie.duration && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#4b5563",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faClock}
                                style={{ color: "#6366f1", width: "14px" }}
                              />
                              <span style={{ fontWeight: "500" }}>
                                {movie.duration} phút
                              </span>
                            </div>
                          )}

                          {movie.director && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#4b5563",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faFilm}
                                style={{ color: "#6366f1", width: "14px" }}
                              />
                              <span
                                style={{
                                  fontWeight: "500",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={movie.director}
                              >
                                {movie.director}
                              </span>
                            </div>
                          )}

                          {/* Date range */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#4b5563",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              style={{ color: "#6366f1", width: "14px" }}
                            />
                            <span
                              style={{ fontWeight: "500", fontSize: "11px" }}
                            >
                              {movie.activeFrom && movie.activeTo
                                ? `${movie.activeFrom} → ${movie.activeTo}`
                                : "Không giới hạn"}
                            </span>
                          </div>

                          {/* Formats */}
                          {movie.formats && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#4b5563",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faVideo}
                                style={{ color: "#6366f1", width: "14px" }}
                              />
                              <span style={{ fontWeight: "500" }}>
                                {movie.formats}
                              </span>
                            </div>
                          )}

                          {/* Languages */}
                          {movie.languages && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#4b5563",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faLanguage}
                                style={{ color: "#6366f1", width: "14px" }}
                              />
                              <span style={{ fontWeight: "500" }}>
                                {movie.languages}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => {
                          setConfirmUnassign({
                            show: true,
                            movieCode: movie.movieCode,
                            movieTitle: movie.title || movie.movieCode,
                          });
                        }}
                        disabled={unassignMovieMutation.isPending}
                        style={{
                          padding: "8px 14px",
                          background: "#fff",
                          color: "#dc2626",
                          border: "2px solid #dc2626",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: unassignMovieMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                          whiteSpace: "nowrap",
                          height: "fit-content",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onMouseEnter={(e) => {
                          if (!unassignMovieMutation.isPending) {
                            e.currentTarget.style.background = "#dc2626";
                            e.currentTarget.style.color = "#fff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!unassignMovieMutation.isPending) {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#dc2626";
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        {unassignMovieMutation.isPending
                          ? "Đang xóa..."
                          : "Bỏ gán"}
                      </button>
                    </div>
                  );
                })}
            </div>
            {Math.ceil(filteredMovies.length / 6) > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "16px",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() =>
                    setAssignedMoviesPage((p) => Math.max(0, p - 1))
                  }
                  disabled={assignedMoviesPage === 0}
                  style={{
                    padding: "6px 12px",
                    background: assignedMoviesPage === 0 ? "#f3f4f6" : "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor:
                      assignedMoviesPage === 0 ? "not-allowed" : "pointer",
                    color: assignedMoviesPage === 0 ? "#9ca3af" : "#374151",
                  }}
                >
                  Trước
                </button>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "500",
                  }}
                >
                  Trang {assignedMoviesPage + 1} /{" "}
                  {Math.ceil(filteredMovies.length / 6)}
                </span>
                <button
                  onClick={() => setAssignedMoviesPage((p) => p + 1)}
                  disabled={
                    (assignedMoviesPage + 1) * 6 >= filteredMovies.length
                  }
                  style={{
                    padding: "6px 12px",
                    background:
                      (assignedMoviesPage + 1) * 6 >= filteredMovies.length
                        ? "#f3f4f6"
                        : "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor:
                      (assignedMoviesPage + 1) * 6 >= filteredMovies.length
                        ? "not-allowed"
                        : "pointer",
                    color:
                      (assignedMoviesPage + 1) * 6 >= filteredMovies.length
                        ? "#9ca3af"
                        : "#374151",
                  }}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Chưa có phim nào được phân công cho rạp này
          </div>
        )}
      </div>

      {/* Confirm Unassign Modal */}
      <ConfirmModal
        isOpen={confirmUnassign.show}
        title="Xác nhận bỏ gán phim"
        message={`Bạn có chắc chắn muốn bỏ gán phim "${confirmUnassign.movieTitle}"?`}
        onConfirm={() => {
          unassignMovieMutation.mutate(confirmUnassign.movieCode);
          setConfirmUnassign({ show: false, movieCode: "", movieTitle: "" });
        }}
        onClose={() =>
          setConfirmUnassign({ show: false, movieCode: "", movieTitle: "" })
        }
      />

      {/* Showtimes Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
           <h4
            style={{
              margin: 0,
              color: "#1f2937",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Suất chiếu ({showtimesData?.totalItems || 0})
          </h4>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "200px" }}>
            <CustomDropdown
              value={showtimeRoomId}
              onChange={(val) => {
                setShowtimeRoomId(val === "" ? "" : Number(val));
              }}
              options={[
                { value: "", label: "Tất cả phòng" },
                ...(rooms?.map((r: any) => ({
                  value: r.id,
                  label: r.name,
                })) || []),
              ]}
              placeholder="Chọn phòng..."
              width="100%"
            />
            </div>
            <input
              type="date"
              value={showtimeFrom}
              onChange={(e) => setShowtimeFrom(e.target.value)}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px"
              }}
            />
             <span style={{ alignSelf: "center", color: "#6b7280" }}>-</span>
            <input
              type="date"
              value={showtimeTo}
              onChange={(e) => setShowtimeTo(e.target.value)}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px"
              }}
            />
            {(showtimeFrom || showtimeTo) && (
              <button
                onClick={() => {
                  setShowtimeFrom("");
                  setShowtimeTo("");
                }}
                style={{
                  padding: "6px 12px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {isLoadingShowtimes ? (
           <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
             <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: "8px" }} />
             Đang tải suất chiếu...
           </div>
        ) : !showtimes || showtimes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Chưa có suất chiếu nào.
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
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Ngày chiếu
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Giờ chiếu
                  </th>
                  <th
                     style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Phim
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Phòng
                  </th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((st: any) => (
                  <tr key={st.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: 12, fontSize: "14px" }}>
                      {st.showDate}
                    </td>
                    <td style={{ padding: 12, fontSize: "14px" }}>
                      {st.showTime}
                    </td>
                    <td style={{ padding: 12, fontSize: "14px" }}>
                       <span style={{ fontWeight: 500 }}>{st.movieTitle}</span>
                       <div style={{ fontSize: "11px", color: "#6b7280" }}>{st.movieCode}</div>
                    </td>
                    <td style={{ padding: 12, fontSize: "14px" }}>
                      {st.room?.name || st.roomName || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {/* Pagination */}
            {showtimesData?.totalPages > 1 && (
               <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "12px 16px",
                    borderTop: "1px solid #e5e7eb",
                    gap: "8px", 
                    alignItems: "center"
                  }}
               >
                 <button
                    onClick={() => setShowtimePage(p => Math.max(0, p - 1))}
                    disabled={showtimePage === 0}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: "#fff",
                      cursor: showtimePage === 0 ? "not-allowed" : "pointer",
                      opacity: showtimePage === 0 ? 0.5 : 1
                    }}
                 >
                   Trước
                 </button>
                 <span style={{ fontSize: "13px" }}>
                   Trang {showtimePage + 1} / {showtimesData.totalPages}
                 </span>
                 <button
                    onClick={() => setShowtimePage(p => p + 1)}
                    disabled={showtimePage >= showtimesData.totalPages - 1}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: "#fff",
                      cursor: showtimePage >= showtimesData.totalPages - 1 ? "not-allowed" : "pointer",
                      opacity: showtimePage >= showtimesData.totalPages - 1 ? 0.5 : 1
                    }}
                 >
                   Sau
                 </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Staff Tab Component
const StaffTab: React.FC<{
  theaterId?: number;
  onOpenAssignStaffModal: () => void;
}> = ({ theaterId, onOpenAssignStaffModal }) => {
  const qc = useQueryClient();
  const [confirmUnassign, setConfirmUnassign] = useState<{
    show: boolean;
    permissionId: number;
    staffName: string;
  }>({ show: false, permissionId: 0, staffName: "" });

  // Fetch assigned staff
  const { data: assignedStaff } = useQuery({
    queryKey: ["theater-staff", theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      const res = await adminStaffApi.listByTheater(theaterId);
      return res.data as any[];
    },
    enabled: !!theaterId,
  });

  const unassignStaffMutation = useMutation({
    mutationFn: async (permissionId: number) => {
      return adminStaffApi.unassign(permissionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-staff", theaterId] });
      setConfirmUnassign({ show: false, permissionId: 0, staffName: "" });
    },
  });

  return (
    <div>
      <div
        style={{
          marginBottom: "24px",
          padding: "20px 24px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#1f2937",
              fontSize: "20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FontAwesomeIcon
              icon={faUsers}
              style={{ fontSize: "20px", marginRight: "8px" }}
            />
            Quản lý nhân viên
          </h3>
          <p
            style={{
              margin: "8px 0 0 0",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Quản lý nhân viên làm việc tại rạp này
          </p>
        </div>

        {/* Assign Staff Button */}
        <button
          onClick={onOpenAssignStaffModal}
          style={{
            padding: "10px 20px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#4f46e5";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(99, 102, 241, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#6366f1";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Gán nhân viên mới
        </button>
      </div>

      {/* Assigned Staff List */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h4
          style={{
            margin: "0 0 16px 0",
            color: "#1f2937",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Nhân viên đã gán ({assignedStaff?.length || 0})
        </h4>
        {assignedStaff && assignedStaff.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
            }}
          >
            {(assignedStaff || []).map((staff: any) => {
              const fullName =
                staff.account?.fullName ||
                staff.account?.username ||
                `ID: ${staff.accountId}`;
              const initials = fullName
                .split(" ")
                .slice(0, 2)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={staff.id}
                  style={{
                    padding: "16px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: "12px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(99, 102, 241, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: staff.account?.avatar
                        ? `url(${staff.account.avatar}) center/cover`
                        : getAvatarColor(staff.accountId),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "600",
                      flexShrink: 0,
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {!staff.account?.avatar && initials}
                  </div>

                  {/* Staff Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        fontSize: "15px",
                        marginBottom: "6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={fullName}
                    >
                      {fullName}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faIdBadge}
                          style={{ width: "14px" }}
                        />
                        <span>ID: {staff.accountId}</span>
                      </div>
                      {staff.account?.email && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={staff.account.email}
                        >
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            style={{ width: "14px", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {staff.account.email}
                          </span>
                        </div>
                      )}
                      <div style={{ marginTop: "4px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            background:
                              staff.role?.roleName === "MANAGER"
                                ? "#dbeafe"
                                : "#f3f4f6",
                            color:
                              staff.role?.roleName === "MANAGER"
                                ? "#1e40af"
                                : "#374151",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontWeight: "500",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faUserTie}
                            style={{ marginRight: "4px" }}
                          />
                          {staff.role?.roleName === "MANAGER"
                            ? "Quản lý"
                            : "Nhân viên"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      setConfirmUnassign({
                        show: true,
                        permissionId: staff.id,
                        staffName: fullName,
                      });
                    }}
                    disabled={unassignStaffMutation.isPending}
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      color: "#dc2626",
                      border: "1px solid #dc2626",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: unassignStaffMutation.isPending
                        ? "not-allowed"
                        : "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!unassignStaffMutation.isPending) {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#dc2626";
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Bỏ gán
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#9ca3af",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}>
              Chưa có nhân viên nào được gán
            </p>
            <p style={{ fontSize: "13px", marginTop: "8px", margin: 0 }}>
              Nhấn nút "Gán nhân viên mới" để thêm nhân viên cho rạp này
            </p>
          </div>
        )}
      </div>

      {/* Confirm Unassign Modal */}
      <ConfirmModal
        isOpen={confirmUnassign.show}
        title="Xác nhận bỏ gán nhân viên"
        message={`Bạn có chắc chắn muốn bỏ gán nhân viên "${confirmUnassign.staffName}" khỏi rạp này?`}
        onConfirm={() => {
          unassignStaffMutation.mutate(confirmUnassign.permissionId);
        }}
        onClose={() => {
          setConfirmUnassign({ show: false, permissionId: 0, staffName: "" });
        }}
      />
    </div>
  );
};

export default TheaterDetail;
