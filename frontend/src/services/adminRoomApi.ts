import api from "./apiClient";

export const adminRoomApi = {
  listByTheater: (theaterId: number) =>
    api.get(`/api/admin/theaters/${theaterId}/rooms`),
  create: (theaterId: number, payload: any) =>
    api.post(`/api/admin/theaters/${theaterId}/rooms`, payload),
  get: (roomId: number) => api.get(`/api/admin/rooms/${roomId}`),
  update: (roomId: number, payload: any) =>
    api.put(`/api/admin/rooms/${roomId}`, payload),
  remove: (roomId: number) => api.delete(`/api/admin/rooms/${roomId}`),
};
