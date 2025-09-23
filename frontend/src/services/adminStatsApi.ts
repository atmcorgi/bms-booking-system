import api from "./apiClient";

export const adminStatsApi = {
  totals: () => api.get("/api/admin/stats"),
};
