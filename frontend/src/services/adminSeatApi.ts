import api from "./apiClient";

export const adminSeatApi = {
  create: (payload: { seatNumber: string; seatType: string; room: { id: number } }) =>
    api.post("/api/admin/seats", payload),
  update: (seatId: number, payload: { seatNumber: string; seatType: string }) =>
    api.put(`/api/admin/seats/${seatId}`, payload),
  remove: (seatId: number) => api.delete(`/api/admin/seats/${seatId}`),
};
