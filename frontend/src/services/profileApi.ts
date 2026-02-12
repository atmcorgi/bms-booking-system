import api from "./apiClient";

export interface ProfileDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  emailVerified: boolean;
  authProvider: string;
  roles: string[];
  assignedTheaterId?: number;
  assignedTheaterName?: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadResponse {
  url: string;
  message: string;
}

export const profileApi = {
  getProfile: () => api.get<ProfileDto>("/api/profile"),
  
  updateProfile: (data: UpdateProfileDto) => 
    api.put<ProfileDto>("/api/profile", data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<AvatarUploadResponse>("/api/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  
  changePassword: (data: ChangePasswordDto) => 
    api.put("/api/profile/password", data),

  getMyBookingHistory: (params: { page: number; size: number; status?: string }) => 
    api.get<PaginatedResponse<BookingHistoryDto>>("/api/booking/my-history", { params }),
};

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}


export interface BookingHistoryDto {
  paymentCode: string;
  bookingTime: string; // ISO string
  status: string;
  movieTitle: string;
  posterUrl: string;
  theaterName: string;
  roomName: string;
  showDate: string;
  showTime: string;
  ticketCount: number;
  seats: string[];
  totalAmount: number;
}
