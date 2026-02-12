import api from "./apiClient";

export interface Account {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  enabled: boolean;
  createdAt: string;
  roles?: Array<{
    id: number;
    roleName: string;
  }>;
}

export interface CreateAccountPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleIds?: number[];
}

export interface UpdateAccountPayload {
  email?: string;
  fullName?: string;
  phone?: string;
  roleIds?: number[];
  enabled?: boolean;
}

export const adminAccountApi = {
  // Lấy danh sách tất cả tài khoản
  listAll: (params?: { q?: string; role?: string; enabled?: boolean; page?: number; size?: number }) =>
    api.get("/api/admin/accounts", { params }),

  // Lấy chi tiết một tài khoản
  getById: (id: number) =>
    api.get(`/api/admin/accounts/${id}`),

  // Tạo tài khoản mới
  create: (payload: CreateAccountPayload) =>
    api.post("/api/admin/accounts", payload),

  // Cập nhật tài khoản
  update: (id: number, payload: UpdateAccountPayload) =>
    api.put(`/api/admin/accounts/${id}`, payload),

  // Xóa tài khoản
  delete: (id: number) =>
    api.delete(`/api/admin/accounts/${id}`),

  // Khóa/Mở khóa tài khoản
  toggleEnabled: (id: number, enabled: boolean) =>
    api.patch(`/api/admin/accounts/${id}/toggle-enabled`, { enabled }),

  // Đổi mật khẩu cho tài khoản
  changePassword: (id: number, newPassword: string) =>
    api.patch(`/api/admin/accounts/${id}/change-password`, { newPassword }),

  // Lấy danh sách roles
  getRoles: () =>
    api.get("/api/admin/roles"),
};

