import api from "./apiClient";

export type Genre = {
  id?: number;
  name: string;
  description?: string;
  deleted?: boolean;
};

export const adminGenreApi = {
  list: (params: { q?: string; page?: number; size?: number } = {}) =>
    api.get("/api/admin/genres", { params }),
  get: (id: number) => api.get(`/api/admin/genres/${id}`),
  create: (genre: Genre) => api.post("/api/admin/genres", genre),
  update: (id: number, genre: Genre) =>
    api.put(`/api/admin/genres/${id}`, genre),
  remove: (id: number) => api.delete(`/api/admin/genres/${id}`),
  restore: (id: number) => api.post(`/api/admin/genres/${id}/restore`),
};
