import api from "./apiClient";

export type StaffNotifications = {
  // For dashboard notices (older endpoint - optional)
  recentAssigned?: Array<{
    code: string;
    title: string;
    activeFrom: string;
    daysAgo: number;
  }>;
  expiringSoon?: Array<{
    code: string;
    title: string;
    activeTo: string;
    daysLeft: number;
  }>;
  // For bell dropdown endpoint
  unread?: number;
  items?: Array<{
    id: number;
    title?: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    relatedMovieId?: number;
    relatedTheaterId?: number;
  }>;
};

export const staffNotificationApi = {
  get: (days = 7) =>
    api.get<StaffNotifications>(`/api/staff/notifications`, {
      params: { days },
    }),
  list: () => api.get<StaffNotifications>(`/api/staff/notifications`),
  markRead: (ids: number[]) =>
    api.post(`/api/staff/notifications/mark-read`, { ids }),
  markAllRead: () => api.post(`/api/staff/notifications/mark-all-read`),
};
