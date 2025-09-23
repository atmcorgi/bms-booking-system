import axios from "axios";

const api = axios.create({
  // Use Vite proxy: keep baseURL empty so requests like '/api/...' are proxied to 8080
  baseURL: "",
  withCredentials: true,
});

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  try {
    // Normalize to path only
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    return (
      path.startsWith("/api/movies/") ||
      path === "/api/movies/now-showing" ||
      path === "/api/movies/coming-soon" ||
      path.startsWith("/booking/api/") ||
      path.startsWith("/movies/") ||
      path.startsWith("/vnpay/") ||
      path === "/auth/login"
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
