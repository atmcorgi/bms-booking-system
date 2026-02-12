import React, { useState } from "react";
import { authApi } from "../services/authApi";
import "../styles/auth.css";

const BACKGROUND_IMG =
  "https://images.wallpapersden.com/image/download/avatar-fire-and-ash-movie-2025_bmhnZm6UmZqaraWkpJRnbGtqrWllbms.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.data?.message || "Đã gửi hướng dẫn reset (nếu email tồn tại).");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-logo">MY CINEMA</div>
          <p className="">Quên mật khẩu</p>
          <p className="auth-subtitle">
            Nhập email đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>

          <form className="auth-form" onSubmit={onSubmit}>
            <div className="auth-form-group">
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            {error && <div className="auth-error-box">{error}</div>}
            {message && (
              <div
                style={{
                  width: "75%",
                  background: "#eefaf1",
                  color: "#0f5132",
                  padding: "12px",
                  borderRadius: 8,
                  marginBottom: 12,
                  border: "1px solid #badbcc",
                }}
              >
                {message}
              </div>
            )}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>

      <div className="auth-right">
        <img
          src={BACKGROUND_IMG}
          alt="Background"
          className="auth-movie-poster"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = document.createElement("div");
            fallback.style.cssText = `
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
            `;
            fallback.textContent = "MYCINEMA";
            target.parentElement?.appendChild(fallback);
          }}
        />
      </div>
    </div>
  );
}


