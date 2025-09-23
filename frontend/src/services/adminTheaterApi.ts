import api from "./apiClient";

export const adminTheaterApi = {
  list: (
    params: {
      q?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    } = {}
  ) => api.get("/api/admin/theaters", { params }),
  create: (payload: any) => api.post("/api/admin/theaters", payload),
  getById: (id: string | number) => api.get(`/api/admin/theaters/${id}`),
  update: (id: string | number, payload: any) =>
    api.put(`/api/admin/theaters/${id}`, payload),
  remove: (id: string | number) => api.delete(`/api/admin/theaters/${id}`),
  getProvinces: () => api.get("/api/admin/theaters/provinces"),
  getDistricts: (provinceId: number) =>
    api.get(`/api/admin/theaters/districts?provinceId=${provinceId}`),
  // Theater detail management
  getRooms: (theaterId: number) =>
    api.get(`/api/admin/theaters/${theaterId}/rooms`),
  getSeats: (theaterId: number) =>
    api.get(`/api/admin/theaters/${theaterId}/seats`),
  getMovies: (theaterId: number) =>
    api.get(`/api/admin/theaters/${theaterId}/movies`),
  getStaff: (theaterId: number) =>
    api.get(`/api/admin/theaters/${theaterId}/staff`),
  // Room management (v2)
  getRoom: (_theaterId: number, roomId: number) =>
    api.get(`/api/admin/rooms/v2/${roomId}`),
  createRoom: (theaterId: number, data: any) =>
    api.post(`/api/admin/rooms/v2`, { ...data, theaterId }),
  updateRoom: (_theaterId: number, roomId: number, data: any) =>
    api.put(`/api/admin/rooms/v2/${roomId}`, data),
  deleteRoom: (_theaterId: number, roomId: number) =>
    api.delete(`/api/admin/rooms/v2/${roomId}`),
  // Seat management
  createSeats: (theaterId: number, roomId: number, data: any) =>
    api.post(`/api/admin/theaters/${theaterId}/rooms/${roomId}/seats`, data),
  updateSeat: (theaterId: number, roomId: number, seatId: number, data: any) =>
    api.put(
      `/api/admin/theaters/${theaterId}/rooms/${roomId}/seats/${seatId}`,
      data
    ),
  deleteSeat: (theaterId: number, roomId: number, seatId: number) =>
    api.delete(
      `/api/admin/theaters/${theaterId}/rooms/${roomId}/seats/${seatId}`
    ),
};
