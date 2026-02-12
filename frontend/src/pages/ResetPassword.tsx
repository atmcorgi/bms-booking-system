import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/authApi";
import "../styles/auth.css";

const BACKGROUND_IMG =
  "https://images.wallpapersden.com/image/download/avatar-fire-and-ash-movie-2025_bmhnZm6UmZqaraWkpJRnbGtqrWllbms.jpg";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"valid" | "invalid" | "loading">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setError("Thiếu token reset");
      return;
    }
    const validate = async () => {
      try {
        await authApi.validateResetToken(token);
        setStatus("valid");
      } catch (err: any) {
        setStatus("invalid");
        setError(err?.response?.data?.error || "Token không hợp lệ hoặc đã hết hạn");
      }
    };
    validate();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "valid") return;
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authApi.resetPassword(token, newPassword, confirmPassword);
      setMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Đặt lại mật khẩu thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const disabled = status !== "valid" || loading;

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-logo">MY CINEMA</div>
          <p className="">Đặt lại mật khẩu</p>
          <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>

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

          <form className="auth-form" onSubmit={onSubmit}>
            <div className="auth-form-group">
              <input
                type="password"
                className="auth-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                required
              />
            </div>
            <div className="auth-form-group">
              <input
                type="password"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                required
              />
            </div>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={disabled}
              style={{ opacity: disabled ? 0.7 : 1 }}
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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


