import { Link } from "react-router-dom";

export default function QuickBooking() {
  return (
    <section
      style={{
        margin: "40px 0",
        padding: "40px 0",
        background: "#faf9f6",
        borderTop: "1px solid #d9d2b7",
        borderBottom: "1px solid #d9d2b7",
      }}
    >
      <div className="container">
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              color: "#8b7355",
              fontSize: "2rem",
              marginBottom: "8px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            ĐẶT VÉ NHANH
          </h2>
          <p
            style={{
              color: "#8b7355",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Chọn rạp yêu thích và tìm phim phù hợp
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "220px",
              transition: "all 0.3s ease",
              border: "1px solid #d9d2b7",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                color: "#8b7355",
                marginBottom: "15px",
              }}
            >
              🎬
            </div>
            <h3
              style={{
                color: "#8b7355",
                fontSize: "1.2rem",
                marginBottom: "10px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Chọn Rạp
            </h3>
            <p
              style={{
                color: "#8b7355",
                marginBottom: "20px",
                fontSize: "0.9rem",
                lineHeight: "1.4",
                fontWeight: "500",
              }}
            >
              Bắt đầu từ rạp chiếu phim gần bạn nhất
            </p>
            <Link
              to="/booking"
              style={{
                display: "inline-block",
                background: "#8b7355",
                color: "white",
                textDecoration: "none",
                padding: "12px 25px",
                borderRadius: "4px",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
                border: "1px solid #8b7355",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Bắt đầu đặt vé
            </Link>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "220px",
              transition: "all 0.3s ease",
              border: "1px solid #d9d2b7",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                color: "#8b7355",
                marginBottom: "15px",
              }}
            >
              🎭
            </div>
            <h3
              style={{
                color: "#8b7355",
                fontSize: "1.2rem",
                marginBottom: "10px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Chọn Phim
            </h3>
            <p
              style={{
                color: "#8b7355",
                marginBottom: "20px",
                fontSize: "0.9rem",
                lineHeight: "1.4",
                fontWeight: "500",
              }}
            >
              Tìm phim yêu thích và xem lịch chiếu
            </p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                background: "#8b7355",
                color: "white",
                textDecoration: "none",
                padding: "12px 25px",
                borderRadius: "4px",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
                border: "1px solid #8b7355",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Chọn phim trước
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
