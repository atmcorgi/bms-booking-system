import axios from "axios";

const api = axios.create({
  // Use environment variable for baseURL, fallback to empty string (relative)
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
});

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  try {
    // Normalize to path only
    const path = url.startsWith("http") ? new URL(url).pathname : url;

    // Exception: /api/booking/my-history requires auth
    if (path.includes("/booking/my-history")) return false;
    // Exception: /api/booking/booking (create booking) should imply auth if available
    if (path.includes("/booking/booking")) return false;
    // Exception: /booking/api/seats should use auth if available to detect "My Pending" and "My Holds"
    if (path.includes("/booking/api/seats")) return false;
    if (path.includes("/booking/api/showtimes")) return false; 
    // Exception: /api/booking/resend-ticket requires auth to verify ownership
    if (path.includes("/booking/resend-ticket")) return false;
    
    return (
      path.startsWith("/api/movies/") ||
      path === "/api/movies/now-showing" ||
      path === "/api/movies/coming-soon" ||
      path === "/api/genres" ||
      path.startsWith("/api/booking/") ||
      path.startsWith("/booking/api/") ||
      path.startsWith("/movies/") ||
      path === "/api/auth/login" ||
      path === "/api/auth/google" ||
      path === "/api/auth/signup" ||
      path === "/api/auth/forgot-password" ||
      path === "/api/auth/reset-password" ||
      path.startsWith("/api/auth/reset-password/validate")
      // Note: /auth/me removed - needs token
    );
  } catch {
    return false;
  }
}

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token && !isPublicEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // X-Guest-ID injection for consistent guest identification
  if (typeof window !== "undefined") {
      let guestId = sessionStorage.getItem("guest_id");
      if (!guestId) {
          guestId = crypto.randomUUID();
          sessionStorage.setItem("guest_id", guestId);
      }
      if (guestId) {
          config.headers["X-Guest-ID"] = guestId;
      }
  }
  
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Token có thể hết hạn/không hợp lệ → xóa để không đính kèm cho endpoint public
      try {
        localStorage.removeItem("access_token");
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
