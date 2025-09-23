import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../services/authApi";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(username, password);
      const token = (res.data as any)?.token;
      // Login successful
      if (token) {
        localStorage.setItem("access_token", token);
        // Get user info after successful login
        const me = await authApi.me();
        const roles = me.data.roles || [];
        // Determine redirect based on user roles
        const redirect =
          new URLSearchParams(location.search).get("redirect") || "/";
        if (roles.includes("ADMIN")) {
          navigate("/admin", { replace: true });
        } else if (roles.includes("STAFF")) {
          navigate("/staff", { replace: true });
        } else {
          navigate(redirect, { replace: true });
        }
      } else {
        setError("Đăng nhập thất bại. Không nhận được token.");
      }
    } catch (err: any) {
      // Handle login error
      setError(err.response?.data?.message || "Đăng nhập thất bại");
      setError(err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content" style={{ padding: 24 }}>
      <div className="container" style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: 16 }}>Đăng nhập</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ color: "#dc3545", marginBottom: 12 }}>{error}</div>
          )}
          <button type="submit" className="fd-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </main>
  );
}
