import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "../services/authApi";
import "../styles/auth.css";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const googleButtonRendered = useRef(false);
  const googleInitialized = useRef(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const me = await authApi.me();
          const roles = me.data.roles || [];
          
          // User is already logged in, redirect
          if (roles.includes("ADMIN")) {
            navigate("/admin", { replace: true });
          } else if (roles.includes("STAFF")) {
            navigate("/staff", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
          return;
        } catch (e) {
          // Token invalid, clear it
          localStorage.removeItem("access_token");
        }
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, [navigate]);

  // Initialize Google Sign-In button (only once)
  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth check
    if (googleInitialized.current) return; // Already initialized
    if (!window.google) return; // Google script not loaded yet

    const google = window.google;

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const idToken = response.credential;
            if (!idToken) return;

            setLoading(true);
            setError(null);

            const res = await authApi.loginWithGoogle(idToken);
            const token = (res.data as any)?.token;

            if (token) {
              localStorage.setItem("access_token", token);
              const me = await authApi.me();
              const roles = me.data.roles || [];

              const redirect =
                new URLSearchParams(location.search).get("redirect") || "/";

              // Use window.location for more reliable redirect
              if (roles.includes("ADMIN")) {
                window.location.href = "/admin";
              } else if (roles.includes("STAFF")) {
                window.location.href = "/staff";
              } else {
                window.location.href = redirect;
              }
            } else {
              setError("Đăng nhập Google thất bại. Không nhận được token.");
            }
          } catch (e: any) {
            setError(
              e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Đăng nhập Google thất bại"
            );
          } finally {
            setLoading(false);
          }
        },
      });

      googleInitialized.current = true;

      // Render button after a short delay to ensure DOM is ready
      setTimeout(() => {
        const target = document.getElementById("googleSignInDiv");
        if (target && !googleButtonRendered.current) {
          google.accounts.id.renderButton(target, {
            type: "standard",
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            width: 260,
          });
          googleButtonRendered.current = true;
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
    }
  }, [isCheckingAuth, location.search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    
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
        
        // Use window.location for more reliable redirect
        if (roles.includes("ADMIN")) {
          window.location.href = "/admin";
        } else if (roles.includes("STAFF")) {
          window.location.href = "/staff";
        } else {
          window.location.href = redirect;
        }
      } else {
        setError("Đăng nhập thất bại. Không nhận được token.");
      }
    } catch (err: any) {
      // Handle login error - fixed duplicate error setting
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="auth-container">
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          fontSize: "16px",
          color: "#8b7355"
        }}>
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-logo">MY CINEMA</div>
          <h1 className="auth-title">Chào mừng bạn đến với MyCinema</h1>
          <p className="auth-subtitle">
            Khám phá thế giới điện ảnh không giới hạn, trải nghiệm phim chất lượng cao mọi lúc mọi nơi
          </p>
          
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="auth-form-group">
              <input
                type="text"
                className={`auth-input ${error ? "error" : ""}`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Tên đăng nhập hoặc Email"
                required
              />
            </div>
            
            <div className="auth-form-group">
              <input
                type="password"
                className={`auth-input ${error ? "error" : ""}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Mật khẩu"
                required
              />
            </div>
            
            {error && (
              <div className="auth-error-box">
                {error}
              </div>
            )}
            
            <div className="auth-remember-forgot">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Quên mật khẩu?
              </Link>
            </div>
            
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-loading"></span>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <div id="googleSignInDiv" />
            </div>
            
            <div className="auth-switch-link">
              Chưa có tài khoản?
              <Link to="/register">Đăng ký ngay</Link>
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
            fallback.textContent = 'MYCINEMA';
            target.parentElement?.appendChild(fallback);
          }}
        />
      </div>
    </div>
  );
}
