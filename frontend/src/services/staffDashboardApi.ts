import api from "./apiClient";

export const staffDashboardApi = {
  get: () => api.get("/api/staff/dashboard"),
};
