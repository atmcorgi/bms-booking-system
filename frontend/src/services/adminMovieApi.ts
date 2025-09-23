import api from "./apiClient";

export const adminMovieApi = {
  list: (params: { q?: string; page?: number; size?: number } = {}) =>
    api.get("/api/admin/movies", { params }),
  getById: (id: number | string) => api.get(`/api/admin/movies/${id}`),
  create: (payload: any) => api.post("/api/admin/movies", payload),
  update: (id: number | string, payload: any) =>
    api.put(`/api/admin/movies/${id}`, payload),
  remove: (id: number | string) => api.delete(`/api/admin/movies/${id}`),
  importPreview: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/api/admin/movies/import/preview", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  importConfirm: (rows: any[]) =>
    api.post("/api/admin/movies/import/confirm", { rows }),
};
