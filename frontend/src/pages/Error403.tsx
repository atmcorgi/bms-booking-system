import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Error403() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <div style={{ 
              width: "100px", 
              height: "100px", 
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E50914 0%, #b20710 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 30px rgba(229,9,20,0.3)"
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="2" fill="white"/>
              </svg>
            </div>
            <h1 style={{ 
              fontSize: "42px", 
              color: "#111", 
              marginBottom: "8px",
              fontWeight: 700,
              letterSpacing: "-1px"
            }}>
              403
            </h1>
            <h2 style={{ 
              fontSize: "20px", 
              color: "#333", 
              marginBottom: "12px",
              fontWeight: 600
            }}>
              Không có quyền truy cập
            </h2>
            <p style={{ 
              color: "#666", 
              marginBottom: "28px",
              lineHeight: 1.6,
              fontSize: "14px"
            }}>
              Bạn không có quyền truy cập trang này.<br/>
              Vui lòng đăng nhập bằng tài khoản admin.
            </p>
            <Link
              to="/"
              className="auth-submit-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 40px",
                minWidth: "180px",
                marginBottom: "12px"
              }}
            >
              Về trang chủ
            </Link>
            <div>
              <Link
                to="/login"
                style={{
                  color: "#E50914",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop" 
          alt="Movie" 
          className="auth-movie-poster"
        />
      </div>
    </div>
  );
}
