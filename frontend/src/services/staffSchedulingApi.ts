import api from "./apiClient";

export const staffSchedulingApi = {
  preview: (payload: { startDate: string; endDate: string; codes?: string }) =>
    api.post("/api/staff/scheduling/preview", payload),
  commit: (rows: any[]) => api.post("/api/staff/scheduling/commit", { rows }),
};
