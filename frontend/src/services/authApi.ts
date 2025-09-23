import api from "./apiClient";

export type MeResponse = {
  username: string;
  roles: string[];
};

export const authApi = {
  async login(username: string, password: string) {
    return api.post("/api/auth/login", { username, password });
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
