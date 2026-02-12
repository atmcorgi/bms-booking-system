import api from "./apiClient";

export const staffShowtimeApi = {
  list: (params: {
    startDate?: string;
    endDate?: string;
    movieId?: number;
    roomId?: number;
    page?: number;
    size?: number;
  }) => api.get("/api/staff/showtimes", { params }),

  getById: (id: number | string) => api.get(`/api/staff/showtimes/${id}`),

  update: (id: number | string, data: {
    priceStandard?: number;
    priceVip?: number;
    showTime?: string;
  }) => api.put(`/api/staff/showtimes/${id}`, data),

  delete: (id: number | string) => api.delete(`/api/staff/showtimes/${id}`),
};
