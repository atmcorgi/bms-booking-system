import api from "./apiClient";

export interface Banner {
  id: number;
  title: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const bannerApi = {
  // Public API
  getActiveBanners: () => api.get<Banner[]>("/api/banners"),
};

export const adminBannerApi = {
  // Admin API
  list: () => api.get<Banner[]>("/api/admin/banners"),
  getById: (id: number) => api.get<Banner>(`/api/admin/banners/${id}`),
  create: (payload: Partial<Banner>) =>
    api.post<Banner>("/api/admin/banners", payload),
  update: (id: number, payload: Partial<Banner>) =>
    api.put<Banner>(`/api/admin/banners/${id}`, payload),
  remove: (id: number) => api.delete(`/api/admin/banners/${id}`),
};
