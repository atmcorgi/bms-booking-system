import api from "./apiClient";

export interface SchedulingConfig {
  openHour?: number;
  openMinute?: number;
  closeHour?: number;
  closeMinute?: number;
  bufferMinutes?: number;
  timeGrainMinutes?: number;
  maxShowsPerMoviePerDay?: number;
  primeTimeWeight?: number;
  roomBalanceWeight?: number;
}

export const staffSchedulingApi = {
  preview: (payload: { startDate: string; endDate: string; codes?: string; config?: SchedulingConfig }) =>
    api.post("/api/staff/scheduling/preview", payload),
  commit: (rows: any[]) => api.post("/api/staff/scheduling/commit", { rows }),
};
