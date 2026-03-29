
import "../styles/optimization.css"; 

export default function Contact() {
  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div 
        style={{
          background: "linear-gradient(135deg, #faf9f6 0%, #ffffff 100%)",
          borderRadius: "16px",
          border: "1px solid #e5e5e5",
          padding: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "40px"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 
            style={{ 
              color: "#8b7355", 
              fontSize: "32px", 
              fontWeight: 700, 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            Liên Hệ Với Chúng Tôi
          </h1>
          <p style={{ color: "#666", fontSize: "16px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            My Cinema luôn sẵn sàng lắng nghe mọi ý kiến đóng góp cũng như giải đáp các thắc mắc của bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </p>
        </div>

        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "30px"
          }}
        >
          {/* Contact Info */}
          <div 
            style={{ 
              background: "#ffffff", 
              padding: "30px", 
              borderRadius: "12px", 
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
            }}
          >
            <h2 style={{ fontSize: "20px", color: "#333", marginBottom: "24px", fontWeight: 600 }}>Thông Tin Liên Hệ</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ color: "#8b7355", fontSize: "20px", marginTop: "2px" }}>📍</div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#333", margin: "0 0 6px 0" }}>Địa Chỉ Trụ Sở</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                    Tầng 3, TTTM My Cinema, số 469 đường Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TPHCM, Việt Nam
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ color: "#8b7355", fontSize: "20px", marginTop: "2px" }}>📞</div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#333", margin: "0 0 6px 0" }}>Hotline</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                    (028) 3775 2524 <br/>
                    <span style={{ fontSize: "12px", color: "#999" }}>(9:00 - 22:00 hàng ngày)</span>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ color: "#8b7355", fontSize: "20px", marginTop: "2px" }}>✉️</div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#333", margin: "0 0 6px 0" }}>Email Hỗ Trợ</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                    support@mycinemavn.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div 
            style={{ 
              background: "#ffffff", 
              padding: "30px", 
              borderRadius: "12px", 
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
            }}
          >
            <h2 style={{ fontSize: "20px", color: "#333", marginBottom: "24px", fontWeight: 600 }}>Gửi Lời Nhắn</h2>
            
            <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 calc(50% - 8px)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Họ và tên *</label>
                  <input 
                    type="text" 
                    placeholder="Nhập họ và tên..."
                    style={{ 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border 0.3s"
                    }} 
                    onFocus={(e) => e.target.style.borderColor = "#8b7355"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                  />
                </div>
                <div style={{ flex: "1 1 calc(50% - 8px)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Số điện thoại / Email *</label>
                  <input 
                    type="text" 
                    placeholder="Thông tin liên lạc..."
                    style={{ 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border 0.3s"
                    }} 
                    onFocus={(e) => e.target.style.borderColor = "#8b7355"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Chủ đề</label>
                <select 
                  style={{ 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    background: "#fff",
                    transition: "border 0.3s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#8b7355"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                >
                  <option value="">-- Chọn chủ đề --</option>
                  <option value="hop-tac">Hợp tác kinh doanh (B2B)</option>
                  <option value="gop-y">Góp ý dịch vụ & Trải nghiệm</option>
                  <option value="ho-tro">Hỗ trợ đặt vé / Thanh toán</option>
                  <option value="khac">Vấn đề khác</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Nội dung thông điệp *</label>
                <textarea 
                  rows={4}
                  placeholder="Hãy viết nội dung bạn muốn gửi..."
                  style={{ 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    transition: "border 0.3s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#8b7355"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
              </div>

              <button 
                type="button"
                onClick={() => alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.")}
                style={{
                  background: "#8b7355",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "8px",
                  transition: "background 0.3s",
                  boxShadow: "0 4px 6px rgba(139, 115, 85, 0.2)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#705c44"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#8b7355"}
              >
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
