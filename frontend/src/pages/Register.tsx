import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/authApi";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Tên đăng nhập không được để trống";
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      errors.username = "Tên đăng nhập phải từ 3 đến 50 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Phone validation (Vietnamese format)
    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu không được để trống";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setError(null); // Clear general error
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.signup(
        formData.username,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword
      );
      const token = (res.data as any)?.token;

      // Signup successful - auto login
      if (token) {
        localStorage.setItem("access_token", token);
        // Redirect to home page
        navigate("/", { replace: true });
        // Show success message could be done with a toast/notification
        window.location.reload(); // Reload to update auth state
      } else {
        setError("Đăng ký thất bại. Không nhận được token.");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Check if it's validation errors from server
      if (err?.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        err.response.data.errors.forEach((errorMsg: string) => {
          if (errorMsg.includes("username")) {
            serverErrors.username = errorMsg;
          } else if (errorMsg.includes("email")) {
            serverErrors.email = errorMsg;
          } else if (errorMsg.includes("phone")) {
            serverErrors.phone = errorMsg;
          } else if (errorMsg.includes("password")) {
            serverErrors.password = errorMsg;
          } else if (errorMsg.includes("confirmPassword")) {
            serverErrors.confirmPassword = errorMsg;
          }
        });
        setValidationErrors(serverErrors);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-logo">MY CINEMA</div>
          <h1 className="auth-title">Bắt đầu hành trình điện ảnh</h1>
          <p className="auth-subtitle">
            Tạo tài khoản miễn phí để truy cập vào thư viện phim khổng lồ và trải nghiệm giải trí không giới hạn
          </p>
          
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="auth-form-group">
              <input
                type="text"
                name="username"
                className={`auth-input ${validationErrors.username ? "error" : ""}`}
                value={formData.username}
                onChange={handleChange}
                placeholder="Tên đăng nhập"
                required
              />
              {validationErrors.username && (
                <span className="auth-error-text">{validationErrors.username}</span>
              )}
            </div>

            <div className="auth-form-group">
              <input
                type="email"
                name="email"
                className={`auth-input ${validationErrors.email ? "error" : ""}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              {validationErrors.email && (
                <span className="auth-error-text">{validationErrors.email}</span>
              )}
            </div>

            <div className="auth-form-group">
              <input
                type="tel"
                name="phone"
                className={`auth-input ${validationErrors.phone ? "error" : ""}`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                required
              />
              {validationErrors.phone && (
                <span className="auth-error-text">{validationErrors.phone}</span>
              )}
            </div>

            <div className="auth-form-group">
              <input
                type="password"
                name="password"
                className={`auth-input ${validationErrors.password ? "error" : ""}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                required
              />
              {validationErrors.password && (
                <span className="auth-error-text">{validationErrors.password}</span>
              )}
            </div>

            <div className="auth-form-group">
              <input
                type="password"
                name="confirmPassword"
                className={`auth-input ${validationErrors.confirmPassword ? "error" : ""}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu"
                required
              />
              {validationErrors.confirmPassword && (
                <span className="auth-error-text">{validationErrors.confirmPassword}</span>
              )}
            </div>

            {error && (
              <div className="auth-error-box">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-loading"></span>
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>

            <div className="auth-switch-link">
              Đã có tài khoản?
              <Link to="/login">Đăng nhập ngay</Link>
            </div>
          </form>
        </div>
      </div>
      
      <div className="auth-right">
        <img
          src="https://images.wallpapersden.com/image/download/avatar-fire-and-ash-movie-2025_bmhnZm6UmZqaraWkpJRnbGtqrWllbms.jpg"
          alt="Avatar Fire and Ash"
          className="auth-movie-poster"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = document.createElement('div');
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
            fallback.textContent = 'MY CINEMA';
            target.parentElement?.appendChild(fallback);
          }}
        />
      </div>
    </div>
  );
}

