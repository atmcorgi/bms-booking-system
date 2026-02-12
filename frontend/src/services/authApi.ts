import api from "./apiClient";

export type MeResponse = {
  username: string;
  roles: string[];
};

export const authApi = {
  async login(username: string, password: string) {
    return api.post("/api/auth/login", { username, password });
  },
  async loginWithGoogle(idToken: string) {
    return api.post("/api/auth/google", { idToken });
  },
  async forgotPassword(email: string) {
    return api.post("/api/auth/forgot-password", { email });
  },
  async validateResetToken(token: string) {
    return api.get("/api/auth/reset-password/validate", { params: { token } });
  },
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return api.post("/api/auth/reset-password", { token, newPassword, confirmPassword });
  },
  async signup(username: string, email: string, phone: string, password: string, confirmPassword: string) {
    return api.post("/api/auth/signup", { username, email, phone, password, confirmPassword });
  },
  async me() {
    return api.get<MeResponse>("/api/auth/me");
  },
  async logout() {
    // Clear token from localStorage
    localStorage.removeItem("access_token");
    // Optionally call backend logout endpoint if needed
    // return api.post("/auth/logout");
  },
};
