import api from "./apiClient";

export const adminStaffApi = {
  listAll: (q?: string, role?: string, unassignedForTheaterId?: number) =>
    api.get("/api/admin/staff", {
      params: { q, role, unassignedForTheaterId },
    }),
  listByTheater: (theaterId: number) =>
    api.get(`/api/admin/staff/theater/${theaterId}`),
  assign: (payload: { accountId: number; theaterId: number; role?: string }) =>
    api.post("/api/admin/staff/assign", payload),
  unassign: (permissionId: number) =>
    api.post("/api/admin/staff/unassign", { permissionId }),
};
