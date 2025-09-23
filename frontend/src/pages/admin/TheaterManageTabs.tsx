import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import { adminMovieAssignmentApi } from "../../services/adminMovieAssignmentApi";
import { adminStaffApi } from "../../services/adminStaffApi";
import apiClient from "../../services/apiClient";

type TheaterManageTabsProps = {
  theater: any;
};

const TheaterManageTabs: React.FC<TheaterManageTabsProps> = ({ theater }) => {
  const [activeTab, setActiveTab] = useState<
    "rooms" | "seats" | "movies" | "staff"
  >("rooms");
  // Prefer rooms from theater payload; fallback to API if missing
  const theaterId = theater?.id as number | undefined;
  const qc = useQueryClient();
  const { data: roomsApi } = useQuery({
    queryKey: ["theater-rooms", theaterId],
    queryFn: async () => {
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

  // Movie assignments
  const { data: assignedMovies } = useQuery({
    queryKey: ["theater-movies", theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      const res = await adminMovieAssignmentApi.list(theaterId);
      return res.data as any[];
    },
    enabled: !!theaterId,
  });

  // Staff assignments
  const { data: assignedStaff } = useQuery({
    queryKey: ["theater-staff", theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      const res = await adminStaffApi.listByTheater(theaterId);
      return res.data as any[];
    },
    enabled: !!theaterId,
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminTheaterApi.deleteRoom(theaterId, roomId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-rooms", theaterId] });
    },
  });

  // Movie assignment mutations
  const assignMovieMutation = useMutation({
    mutationFn: async (payload: {
      movieCode: string;
      activeFrom?: string;
      activeTo?: string;
      formats?: string;
      languages?: string;
    }) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminMovieAssignmentApi.assign(theaterId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-movies", theaterId] });
    },
  });

  const unassignMovieMutation = useMutation({
    mutationFn: async (movieCode: string) => {
      if (!theaterId) throw new Error("Missing theaterId");
      return adminMovieAssignmentApi.unassign(theaterId, movieCode);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-movies", theaterId] });
    },
  });

  // Staff assignment mutations
  const assignStaffMutation = useMutation({
    mutationFn: async (payload: {
      accountId: number;
      theaterId: number;
      role?: string;
    }) => {
      return adminStaffApi.assign(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-staff", theaterId] });
    },
  });

  const unassignStaffMutation = useMutation({
    mutationFn: async (permissionId: number) => {
      return adminStaffApi.unassign(permissionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-staff", theaterId] });
    },
  });

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    supportedFormats: string;
  }>({
    name: "",
    supportedFormats: "2D",
  });

  // Seat editing state
  const [editingSeats, setEditingSeats] = useState<number | null>(null);
  const [seatLayout, setSeatLayout] = useState<{ [key: string]: any[] }>({});

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditForm({
      name: r.name || "",
      supportedFormats: r.supportedFormats || "2D",
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Seat editing functions
  const startSeatEdit = (roomId: number) => {
    setEditingSeats(roomId);
    const currentSeats = buildSeatGrid(roomId);
    setSeatLayout(currentSeats.grid);
  };

  const cancelSeatEdit = () => {
    setEditingSeats(null);
    setSeatLayout({});
  };

  const addSeat = (_roomId: number, rowKey: string) => {
    const currentLayout = { ...seatLayout };
    if (!currentLayout[rowKey]) {
      currentLayout[rowKey] = [];
    }

    const nextSeatNumber = currentLayout[rowKey].length + 1;
    const newSeat = {
      id: `${_roomId}-${rowKey}-${nextSeatNumber}`,
      seatNumber: `${rowKey}${nextSeatNumber.toString().padStart(2, "0")}`,
      seatType: "Standard",
    };

    currentLayout[rowKey].push(newSeat);
    setSeatLayout(currentLayout);
  };

  const removeSeat = (_roomId: number, rowKey: string, seatIndex: number) => {
    const currentLayout = { ...seatLayout };
    if (currentLayout[rowKey] && currentLayout[rowKey].length > seatIndex) {
      currentLayout[rowKey].splice(seatIndex, 1);
      setSeatLayout(currentLayout);
    }
  };

  const updateSeatType = (
    _roomId: number,
    rowKey: string,
    seatIndex: number,
    newType: string
  ) => {
    const currentLayout = { ...seatLayout };
    if (currentLayout[rowKey] && currentLayout[rowKey][seatIndex]) {
      currentLayout[rowKey][seatIndex].seatType = newType;
      setSeatLayout(currentLayout);
    }
  };

  const addRow = (_roomId: number) => {
    const currentLayout = { ...seatLayout };
    const existingRows = Object.keys(currentLayout);
    const lastRow = existingRows[existingRows.length - 1];
    const nextRowKey = lastRow
      ? String.fromCharCode(lastRow.charCodeAt(0) + 1)
      : "A";

    currentLayout[nextRowKey] = [];
    setSeatLayout(currentLayout);
  };

  const removeRow = (_roomId: number, rowKey: string) => {
    const currentLayout = { ...seatLayout };
    delete currentLayout[rowKey];
    setSeatLayout(currentLayout);
  };
  const updateRoomMutation = useMutation({
    mutationFn: async () => {
      if (!theaterId || editingId == null) throw new Error("Missing ids");
      return adminTheaterApi.updateRoom(theaterId, editingId, {
        name: editForm.name,
        supportedFormats: editForm.supportedFormats,
        theaterId: theaterId,
      });
    },
    onSuccess: () => {
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["theater-rooms", theaterId] });
    },
  });

  // Seat layout (auto-load for all rooms)
  const [seatCounts, setSeatCounts] = useState<Record<number, number>>({});
  const [allSeats, setAllSeats] = useState<
    Record<number, Array<{ id: number; seatNumber: string; seatType?: string }>>
  >({});

  // Load all seats for the theater at once (better approach)
  const { data: theaterSeats } = useQuery({
    queryKey: ["theater-seats", theaterId],
    queryFn: async () => {
      if (!theaterId) return [];
      console.log("🔍 Loading seats for theater:", theaterId, "rooms:", rooms);

      // Load seats for each room in this theater
      const roomIds = rooms.map((r: any) => r.id);
      console.log("🔍 Room IDs:", roomIds);

      const seatPromises = roomIds.map(async (roomId: number) => {
        try {
          console.log("🔍 Loading seats for room:", roomId);
          const res = await apiClient.get(
            `/api/admin/rooms/v2/${roomId}/seats`
          );
          console.log("🔍 Room", roomId, "seats:", res.data?.length);
          // Add roomId to each seat
          const seats = (res.data || []).map((seat: any) => ({
            ...seat,
            roomId: roomId,
          }));
          return seats;
        } catch (error) {
          console.warn(`Failed to load seats for room ${roomId}:`, error);
          return [];
        }
      });

      const seatResults = await Promise.all(seatPromises);
      const allSeats = seatResults.flat();
      console.log("🔍 Total seats loaded:", allSeats.length);
      return allSeats;
    },
    enabled: !!theaterId && Array.isArray(rooms) && rooms.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    console.log(
      "🔍 useEffect triggered - theaterSeats:",
      theaterSeats?.length,
      "rooms:",
      rooms?.length
    );

    if (Array.isArray(theaterSeats) && Array.isArray(rooms)) {
      const newSeatCounts: Record<number, number> = {};
      const newAllSeats: Record<
        number,
        Array<{ id: number; seatNumber: string; seatType?: string }>
      > = {};

      // Group seats by room ID
      const seatsByRoom: Record<
        number,
        Array<{ id: number; seatNumber: string; seatType?: string }>
      > = {};

      console.log("🔍 Processing theaterSeats:", theaterSeats.length);
      theaterSeats.forEach((seat: any) => {
        console.log("🔍 Seat data structure:", seat);
        const roomId = seat.room?.id || seat.roomId;
        console.log("🔍 Seat room ID:", roomId, "seat:", seat);
        if (roomId) {
          if (!seatsByRoom[roomId]) {
            seatsByRoom[roomId] = [];
          }
          seatsByRoom[roomId].push({
            id: seat.id,
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
          });
        }
      });

      console.log("🔍 Seats by room:", seatsByRoom);

      // Set counts and seats for each room
      rooms.forEach((room: any) => {
        const roomSeats = seatsByRoom[room.id] || [];
        newSeatCounts[room.id] = roomSeats.length;
        newAllSeats[room.id] = roomSeats;
        console.log("🔍 Room", room.id, "seats count:", roomSeats.length);
      });

      console.log("🔍 Final seat counts:", newSeatCounts);
      setSeatCounts(newSeatCounts);
      setAllSeats(newAllSeats);
    }
  }, [theaterSeats, rooms]);

  const buildSeatGrid = (roomId: number) => {
    const seats = allSeats[roomId] || [];
    // Group by row letter (prefix before digits)
    const map: Record<
      string,
      Array<{ id: number; seatNumber: string; seatType?: string }>
    > = {};
    for (const s of seats) {
      const m = s.seatNumber?.match(/^[A-Z]+/i);
      const row = m ? m[0].toUpperCase() : "?";
      if (!map[row]) map[row] = [];
      map[row].push({
        id: s.id,
        seatNumber: s.seatNumber,
        seatType: s.seatType,
      });
    }
    const rows = Object.keys(map).sort((a, b) => a.localeCompare(b));
    for (const r of rows) {
      map[r].sort((a, b) => {
        const na = parseInt(a.seatNumber.replace(/^[A-Z]+/i, "")) || 0;
        const nb = parseInt(b.seatNumber.replace(/^[A-Z]+/i, "")) || 0;
        return na - nb;
      });
    }
    return { rows, grid: map, total: seats.length };
  };

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Minimal Header */}
      <div
        style={{
          background: "#fff",
          padding: "16px 20px",
          border: "1px solid #e2e8f0",
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>⚙️</span>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Quản lý chi tiết rạp
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Phòng chiếu • Ghế ngồi • Phim • Nhân viên
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}
            >
              {rooms.length}
            </div>
            <div style={{ color: "#64748b" }}>Phòng</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}
            >
              {Object.values(seatCounts).reduce((sum, count) => sum + count, 0)}
            </div>
            <div style={{ color: "#64748b" }}>Ghế</div>
          </div>
        </div>
      </div>

      {/* Minimal Tabs */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderTop: "none",
          overflow: "hidden",
        }}
      >
        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 20px",
          }}
        >
          {[
            {
              id: "rooms",
              label: "Phòng chiếu",
              icon: "🎬",
              count: rooms.length,
            },
            {
              id: "seats",
              label: "Ghế ngồi",
              icon: "🪑",
              count: Object.values(seatCounts).reduce(
                (sum, count) => sum + count,
                0
              ),
            },
            {
              id: "movies",
              label: "Phim & Suất",
              icon: "🎭",
              count: assignedMovies?.length || 0,
            },
            {
              id: "staff",
              label: "Nhân viên",
              icon: "👥",
              count: assignedStaff?.length || 0,
            },
          ].map((t: any) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "12px 16px",
                border: "none",
                background: "transparent",
                color: activeTab === t.id ? "#6366f1" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: activeTab === t.id ? "600" : "500",
                transition: "all 0.2s ease",
                borderBottom:
                  activeTab === t.id
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
                position: "relative",
                borderRadius: "0",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== t.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6366f1";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== t.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              <span style={{ fontSize: "14px" }}>{t.icon}</span>
              <span>{t.label}</span>
              {t.count > 0 && (
                <span
                  style={{
                    background: activeTab === t.id ? "#6366f1" : "#e2e8f0",
                    color: activeTab === t.id ? "#fff" : "#64748b",
                    borderRadius: "10px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: "600",
                    minWidth: "16px",
                    textAlign: "center",
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: "20px" }}>
          {activeTab === "rooms" && (
            <div>
              {/* Minimal Action Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  padding: "16px 20px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#fff",
                      border: "1px solid #6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    🎬
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Quản lý phòng chiếu
                    </h3>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      {rooms.length} phòng •{" "}
                      {Object.values(seatCounts).reduce(
                        (sum, count) => sum + count,
                        0
                      )}{" "}
                      ghế
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Tên phòng mới:");
                    if (name && name.trim()) {
                      // TODO: Implement create room functionality
                      alert("Tính năng thêm phòng sẽ được triển khai sớm!");
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    background: "#fff",
                    color: "#059669",
                    border: "1px solid #059669",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#059669";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: "14px" }}>➕</span>
                  Thêm phòng
                </button>
              </div>

              {/* Modern Card Grid */}
              {rooms.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background:
                      "linear-gradient(135deg, #faf9f6 0%, #f5f3ef 100%)",
                    borderRadius: "16px",
                    border: "1px solid #d9d2b7",
                    boxShadow: "0 4px 20px rgba(139, 115, 85, 0.1)",
                  }}
                >
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>
                    🎬
                  </div>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Chưa có phòng chiếu nào
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#8b7355",
                    }}
                  >
                    Tạo phòng chiếu đầu tiên để bắt đầu quản lý
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {rooms.map((r: any) => {
                    const seat = buildSeatGrid(r.id);
                    return (
                      <div
                        key={r.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        {/* Room Header */}
                        <div
                          style={{
                            background: "#fff",
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#1f2937",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              {editingId === r.id ? (
                                <input
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm((p) => ({
                                      ...p,
                                      name: e.target.value,
                                    }))
                                  }
                                  style={{
                                    background: "rgba(255, 255, 255, 0.2)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    padding: "8px 12px",
                                    color: "white",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    outline: "none",
                                    width: "200px",
                                  }}
                                  placeholder="Tên phòng"
                                />
                              ) : (
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    fontWeight: "700",
                                  }}
                                >
                                  {r.name}
                                </h3>
                              )}
                              <p
                                style={{
                                  margin: "4px 0 0 0",
                                  fontSize: "12px",
                                  opacity: 0.9,
                                }}
                              >
                                {seat.total} ghế • {seat.rows.length} hàng
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              {editingId === r.id ? (
                                <>
                                  <button
                                    onClick={() => updateRoomMutation.mutate()}
                                    disabled={updateRoomMutation.isPending}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fff",
                                      border: "1px solid #059669",
                                      color: "#059669",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      cursor: updateRoomMutation.isPending
                                        ? "not-allowed"
                                        : "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    {updateRoomMutation.isPending
                                      ? "Đang lưu..."
                                      : "💾 Lưu"}
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fff",
                                      border: "1px solid #64748b",
                                      color: "#64748b",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    ❌ Hủy
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(r)}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fff",
                                      border: "1px solid #6366f1",
                                      color: "#6366f1",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    ✏️ Sửa
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!confirm(`Xóa phòng "${r.name}"?`))
                                        return;
                                      deleteRoomMutation.mutate(r.id);
                                    }}
                                    disabled={deleteRoomMutation.isPending}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fff",
                                      border: "1px solid #dc2626",
                                      color: "#dc2626",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      cursor: deleteRoomMutation.isPending
                                        ? "not-allowed"
                                        : "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    {deleteRoomMutation.isPending
                                      ? "Đang xóa..."
                                      : "🗑️ Xóa"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Room Content */}
                        <div style={{ padding: "20px" }}>
                          {/* Format & Stats */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "16px",
                            }}
                          >
                            <div>
                              {editingId === r.id ? (
                                <select
                                  value={editForm.supportedFormats}
                                  onChange={(e) =>
                                    setEditForm((p) => ({
                                      ...p,
                                      supportedFormats: e.target.value,
                                    }))
                                  }
                                  style={{
                                    padding: "8px 12px",
                                    border: "1px solid #d9d2b7",
                                    fontSize: "14px",
                                    background: "#faf9f6",
                                    outline: "none",
                                  }}
                                >
                                  <option value="2D">2D</option>
                                  <option value="3D">3D</option>
                                  <option value="2D|3D">2D + 3D</option>
                                  <option value="IMAX">IMAX</option>
                                  <option value="2D|3D|IMAX">
                                    2D + 3D + IMAX
                                  </option>
                                </select>
                              ) : (
                                <span
                                  style={{
                                    padding: "6px 12px",
                                    background:
                                      "linear-gradient(135deg, #8b7355 0%, #a68b5b 100%)",
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    boxShadow:
                                      "0 2px 4px rgba(139, 115, 85, 0.2)",
                                  }}
                                >
                                  {r.supportedFormats || "2D"}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                fontSize: "12px",
                                color: "#8b7355",
                              }}
                            >
                              <span>💺 {seat.total} ghế</span>
                              <span>📐 {seat.rows.length} hàng</span>
                            </div>
                          </div>

                          {/* Minimalist Seat Editor */}
                          <div
                            style={{
                              background: "#fff",
                              padding: "16px",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {/* Header */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "16px",
                                paddingBottom: "12px",
                                borderBottom: "1px solid #f3f4f6",
                              }}
                            >
                              <div>
                                <h4
                                  style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#111827",
                                  }}
                                >
                                  Sơ đồ ghế
                                </h4>
                                <p
                                  style={{
                                    margin: "4px 0 0 0",
                                    fontSize: "12px",
                                    color: "#6b7280",
                                  }}
                                >
                                  {seat.total} ghế • {seat.rows.length} hàng
                                </p>
                              </div>

                              {editingSeats === r.id ? (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => addRow(r.id)}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fff",
                                      color: "#059669",
                                      border: "1px solid #059669",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    + Hàng
                                  </button>
                                  <button
                                    onClick={cancelSeatEdit}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fff",
                                      color: "#dc2626",
                                      border: "1px solid #dc2626",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    Xong
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startSeatEdit(r.id)}
                                  style={{
                                    padding: "6px 12px",
                                    background: "#fff",
                                    color: "#6366f1",
                                    border: "1px solid #6366f1",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  Chỉnh sửa
                                </button>
                              )}
                            </div>

                            {/* Seat Grid */}
                            <div
                              style={{
                                background: "#fff",
                                padding: "16px",
                                border: "1px solid #e5e7eb",
                                maxHeight:
                                  editingSeats === r.id ? "400px" : "150px",
                                overflow: "auto",
                              }}
                            >
                              {(editingSeats === r.id
                                ? Object.keys(seatLayout)
                                : seat.rows.slice(0, 3)
                              ).map((rowKey) => {
                                const rowSeats =
                                  editingSeats === r.id
                                    ? seatLayout[rowKey] || []
                                    : seat.grid[rowKey] || [];
                                return (
                                  <div
                                    key={rowKey}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "16px",
                                      padding: "12px 0",
                                      borderBottom: "1px solid #f3f4f6",
                                      marginBottom: "12px",
                                    }}
                                  >
                                    {/* Row Label */}
                                    <div
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        textAlign: "center",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: "#475569",
                                        background: "#fff",
                                        border: "1px solid #475569",
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {rowKey}
                                    </div>

                                    {/* Seats */}
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "6px",
                                        flexWrap: "wrap",
                                        flex: 1,
                                        alignItems: "center",
                                      }}
                                    >
                                      {rowSeats
                                        .slice(
                                          0,
                                          editingSeats === r.id ? undefined : 12
                                        )
                                        .map((item, seatIndex) => (
                                          <div
                                            key={item.id}
                                            style={{
                                              position: "relative",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "4px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: "24px",
                                                height: "24px",
                                                background:
                                                  item.seatType === "VIP"
                                                    ? "#fef7e0"
                                                    : item.seatType ===
                                                        "Premium"
                                                      ? "#f0f4ff"
                                                      : "#f8fafc",
                                                border:
                                                  item.seatType === "VIP"
                                                    ? "1px solid #e5a50a"
                                                    : item.seatType ===
                                                        "Premium"
                                                      ? "1px solid #6366f1"
                                                      : "1px solid #cbd5e1",
                                                borderRadius: "4px",
                                                fontSize: "10px",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color:
                                                  item.seatType === "VIP"
                                                    ? "#a16207"
                                                    : item.seatType ===
                                                        "Premium"
                                                      ? "#4338ca"
                                                      : "#475569",
                                                cursor:
                                                  editingSeats === r.id
                                                    ? "pointer"
                                                    : "default",
                                                transition: "all 0.2s ease",
                                                boxShadow:
                                                  "0 1px 3px rgba(0, 0, 0, 0.1)",
                                              }}
                                              onClick={() => {
                                                if (editingSeats === r.id) {
                                                  const types = [
                                                    "Standard",
                                                    "Premium",
                                                    "VIP",
                                                  ];
                                                  const currentIndex =
                                                    types.indexOf(
                                                      item.seatType
                                                    );
                                                  const nextType =
                                                    types[
                                                      (currentIndex + 1) %
                                                        types.length
                                                    ];
                                                  updateSeatType(
                                                    r.id,
                                                    rowKey,
                                                    seatIndex,
                                                    nextType
                                                  );
                                                }
                                              }}
                                              onMouseEnter={(e) => {
                                                if (editingSeats === r.id) {
                                                  e.currentTarget.style.transform =
                                                    "scale(1.1)";
                                                  e.currentTarget.style.boxShadow =
                                                    "0 2px 8px rgba(0, 0, 0, 0.2)";
                                                }
                                              }}
                                              onMouseLeave={(e) => {
                                                if (editingSeats === r.id) {
                                                  e.currentTarget.style.transform =
                                                    "scale(1)";
                                                  e.currentTarget.style.boxShadow =
                                                    "0 1px 3px rgba(0, 0, 0, 0.1)";
                                                }
                                              }}
                                            >
                                              {item.seatNumber.replace(
                                                /^[A-Z]+/i,
                                                ""
                                              )}
                                            </div>

                                            {editingSeats === r.id && (
                                              <button
                                                onClick={() =>
                                                  removeSeat(
                                                    r.id,
                                                    rowKey,
                                                    seatIndex
                                                  )
                                                }
                                                style={{
                                                  width: "18px",
                                                  height: "18px",
                                                  background: "#fff",
                                                  color: "#dc2626",
                                                  border: "1px solid #dc2626",
                                                  borderRadius: "4px",
                                                  fontSize: "10px",
                                                  fontWeight: "700",
                                                  cursor: "pointer",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  transition: "all 0.2s ease",
                                                  flexShrink: 0,
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.transform =
                                                    "scale(1.2)";
                                                  e.currentTarget.style.boxShadow =
                                                    "0 2px 6px rgba(239, 68, 68, 0.4)";
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.transform =
                                                    "scale(1)";
                                                  e.currentTarget.style.boxShadow =
                                                    "0 1px 3px rgba(239, 68, 68, 0.3)";
                                                }}
                                              >
                                                ×
                                              </button>
                                            )}
                                          </div>
                                        ))}

                                      {/* Add Seat Button */}
                                      {editingSeats === r.id && (
                                        <button
                                          onClick={() => addSeat(r.id, rowKey)}
                                          style={{
                                            width: "24px",
                                            height: "24px",
                                            background: "#fff",
                                            color: "#059669",
                                            border: "1px solid #059669",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "all 0.2s ease",
                                            flexShrink: 0,
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                              "scale(1.1)";
                                            e.currentTarget.style.boxShadow =
                                              "0 2px 8px rgba(16, 185, 129, 0.4)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                              "scale(1)";
                                            e.currentTarget.style.boxShadow =
                                              "0 1px 3px rgba(16, 185, 129, 0.3)";
                                          }}
                                        >
                                          +
                                        </button>
                                      )}

                                      {/* Remove Row Button */}
                                      {editingSeats === r.id && (
                                        <button
                                          onClick={() =>
                                            removeRow(r.id, rowKey)
                                          }
                                          style={{
                                            padding: "4px 8px",
                                            background: "#fff",
                                            color: "#dc2626",
                                            border: "1px solid #dc2626",
                                            borderRadius: "4px",
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "3px",
                                            flexShrink: 0,
                                            height: "24px",
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                              "translateY(-1px)";
                                            e.currentTarget.style.boxShadow =
                                              "0 2px 6px rgba(239, 68, 68, 0.4)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                              "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                              "0 1px 3px rgba(239, 68, 68, 0.3)";
                                          }}
                                        >
                                          🗑️ Xóa hàng
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {!editingSeats && seat.rows.length > 3 && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#8b7355",
                                    textAlign: "center",
                                    marginTop: "12px",
                                    fontStyle: "italic",
                                    padding: "8px",
                                    background: "rgba(139, 115, 85, 0.1)",
                                  }}
                                >
                                  ... và {seat.rows.length - 3} hàng khác
                                </div>
                              )}
                            </div>

                            {/* Instructions */}
                            {editingSeats === r.id && (
                              <div
                                style={{
                                  marginTop: "16px",
                                  padding: "16px",
                                  background: "#f1f5f9",
                                  border: "1px solid #cbd5e1",
                                }}
                              >
                                <div
                                  style={{
                                    marginBottom: "12px",
                                  }}
                                >
                                  <h5
                                    style={{
                                      margin: 0,
                                      fontSize: "13px",
                                      color: "#1e293b",
                                      fontWeight: "600",
                                    }}
                                  >
                                    💡 Hướng dẫn sử dụng
                                  </h5>
                                </div>

                                <div style={{ display: "grid", gap: "6px" }}>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#475569",
                                      lineHeight: "1.5",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#6366f1",
                                        fontWeight: "600",
                                      }}
                                    >
                                      🪑
                                    </span>
                                    Click ghế để thay đổi loại:{" "}
                                    <strong>Standard → Premium → VIP</strong>
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#475569",
                                      lineHeight: "1.5",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#059669",
                                        fontWeight: "600",
                                      }}
                                    >
                                      ➕
                                    </span>
                                    Click <strong>+</strong> để thêm ghế,{" "}
                                    <strong>×</strong> để xóa ghế
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#475569",
                                      lineHeight: "1.5",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#7c3aed",
                                        fontWeight: "600",
                                      }}
                                    >
                                      📝
                                    </span>
                                    Click <strong>"Thêm hàng"</strong> để tạo
                                    hàng mới
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#475569",
                                      lineHeight: "1.5",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#dc2626",
                                        fontWeight: "600",
                                      }}
                                    >
                                      🗑️
                                    </span>
                                    Click <strong>"Xóa hàng"</strong> để xóa
                                    toàn bộ hàng
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "seats" && (
            <div>
              {/* Compact Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  padding: "12px 16px",
                  background: "#faf9f6",
                  border: "1px solid #d9d2b7",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "16px" }}>🪑</span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Sơ đồ ghế ngồi
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#8b7355",
                      background: "rgba(139, 115, 85, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    {Object.values(seatCounts).reduce(
                      (sum, count) => sum + count,
                      0
                    )}{" "}
                    ghế
                  </span>
                </div>
              </div>

              {rooms.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#8b7355",
                    background:
                      "linear-gradient(135deg, #faf9f6 0%, #f5f3ef 100%)",
                    borderRadius: "12px",
                    border: "1px solid #d9d2b7",
                    boxShadow: "0 2px 8px rgba(139, 115, 85, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "48px" }}>🪑</span>
                    <span style={{ fontSize: "16px", fontWeight: "500" }}>
                      Chưa có phòng chiếu nào để hiển thị ghế
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {rooms.map((room: any) => {
                    const seatGrid = buildSeatGrid(room.id);
                    return (
                      <div
                        key={room.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                            paddingBottom: 8,
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <h4 style={{ margin: 0, color: "#374151" }}>
                            Phòng {room.name}
                          </h4>
                          <div style={{ fontSize: 14, color: "#6b7280" }}>
                            {seatGrid.total} ghế
                          </div>
                        </div>

                        <div style={{ display: "grid", gap: 8 }}>
                          {seatGrid.rows.map((rowKey) => (
                            <div
                              key={rowKey}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  textAlign: "right",
                                  color: "#6b7280",
                                  fontWeight: 600,
                                  fontSize: 14,
                                }}
                              >
                                {rowKey}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 4,
                                }}
                              >
                                {seatGrid.grid[rowKey].map((seat) => (
                                  <div
                                    key={seat.id}
                                    title={`${seat.seatNumber} - ${seat.seatType || "Standard"}`}
                                    style={{
                                      minWidth: 28,
                                      height: 24,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      border: "1px solid #d1d5db",
                                      background:
                                        seat.seatType === "VIP"
                                          ? "#fef3c7"
                                          : "#f9fafb",
                                      fontSize: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#374151",
                                    }}
                                  >
                                    {seat.seatNumber.replace(/^[A-Z]+/i, "")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "movies" && (
            <div>
              <div
                style={{
                  marginBottom: "24px",
                  padding: "20px 24px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
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
                  <span style={{ fontSize: "24px" }}>🎭</span>
                  Phim & Suất chiếu
                </h3>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Quản lý phim đang chiếu và lịch trình suất chiếu tại rạp này
                </p>
              </div>

              {/* Assign Movie Form */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  marginBottom: "20px",
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
                  Gán phim cho rạp
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const movieCode = formData.get("movieCode") as string;
                    const activeFrom = formData.get("activeFrom") as string;
                    const activeTo = formData.get("activeTo") as string;
                    const formats = formData.get("formats") as string;
                    const languages = formData.get("languages") as string;

                    if (movieCode) {
                      assignMovieMutation.mutate({
                        movieCode,
                        activeFrom: activeFrom || undefined,
                        activeTo: activeTo || undefined,
                        formats: formats || undefined,
                        languages: languages || undefined,
                      });
                      e.currentTarget.reset();
                    }
                  }}
                  style={{ display: "flex", gap: "12px", alignItems: "end" }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Mã phim
                    </label>
                    <input
                      name="movieCode"
                      type="text"
                      required
                      placeholder="VD: AVENGERS_001"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Từ ngày
                    </label>
                    <input
                      name="activeFrom"
                      type="date"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Đến ngày
                    </label>
                    <input
                      name="activeTo"
                      type="date"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Định dạng
                    </label>
                    <input
                      name="formats"
                      type="text"
                      placeholder="VD: 2D,3D,IMAX"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Ngôn ngữ
                    </label>
                    <input
                      name="languages"
                      type="text"
                      placeholder="VD: VI,EN"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={assignMovieMutation.isPending}
                    style={{
                      padding: "8px 16px",
                      background: "#fff",
                      color: "#059669",
                      border: "1px solid #059669",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {assignMovieMutation.isPending ? "Đang gán..." : "Gán phim"}
                  </button>
                </form>
              </div>

              {/* Assigned Movies List */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
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
                  Phim đã gán ({assignedMovies?.length || 0})
                </h4>
                {assignedMovies && assignedMovies.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {assignedMovies.map((movie: any) => (
                      <div
                        key={movie.movieCode}
                        style={{
                          padding: "12px 16px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#1f2937",
                              fontSize: "14px",
                            }}
                          >
                            {movie.movieCode}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              marginTop: "2px",
                            }}
                          >
                            {movie.activeFrom && movie.activeTo
                              ? `${movie.activeFrom} - ${movie.activeTo}`
                              : "Không giới hạn thời gian"}
                            {movie.formats && ` • ${movie.formats}`}
                            {movie.languages && ` • ${movie.languages}`}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Bỏ gán phim "${movie.movieCode}"?`)) {
                              unassignMovieMutation.mutate(movie.movieCode);
                            }
                          }}
                          disabled={unassignMovieMutation.isPending}
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            color: "#dc2626",
                            border: "1px solid #dc2626",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          Bỏ gán
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Chưa có phim nào được gán cho rạp này
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div>
              <div
                style={{
                  marginBottom: "24px",
                  padding: "20px 24px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
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
                  <span style={{ fontSize: "24px" }}>👥</span>
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

              {/* Assign Staff Form */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  marginBottom: "20px",
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
                  Gán nhân viên cho rạp
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const accountId = parseInt(
                      formData.get("accountId") as string
                    );
                    const role = formData.get("role") as string;

                    if (accountId && theaterId) {
                      assignStaffMutation.mutate({
                        accountId,
                        theaterId,
                        role: role || "STAFF",
                      });
                      e.currentTarget.reset();
                    }
                  }}
                  style={{ display: "flex", gap: "12px", alignItems: "end" }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      ID tài khoản
                    </label>
                    <input
                      name="accountId"
                      type="number"
                      required
                      placeholder="VD: 123"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Vai trò
                    </label>
                    <select
                      name="role"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    >
                      <option value="STAFF">Nhân viên</option>
                      <option value="MANAGER">Quản lý</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={assignStaffMutation.isPending}
                    style={{
                      padding: "8px 16px",
                      background: "#fff",
                      color: "#059669",
                      border: "1px solid #059669",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {assignStaffMutation.isPending
                      ? "Đang gán..."
                      : "Gán nhân viên"}
                  </button>
                </form>
              </div>

              {/* Assigned Staff List */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
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
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {assignedStaff.map((staff: any) => (
                      <div
                        key={staff.id}
                        style={{
                          padding: "12px 16px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#1f2937",
                              fontSize: "14px",
                            }}
                          >
                            {staff.account?.username ||
                              `ID: ${staff.accountId}`}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              marginTop: "2px",
                            }}
                          >
                            {staff.role?.roleName || "STAFF"}
                            {staff.account?.email &&
                              ` • ${staff.account.email}`}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Bỏ gán nhân viên "${staff.account?.username || staff.accountId}"?`
                              )
                            ) {
                              unassignStaffMutation.mutate(staff.id);
                            }
                          }}
                          disabled={unassignStaffMutation.isPending}
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            color: "#dc2626",
                            border: "1px solid #dc2626",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          Bỏ gán
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Chưa có nhân viên nào được gán cho rạp này
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheaterManageTabs;
