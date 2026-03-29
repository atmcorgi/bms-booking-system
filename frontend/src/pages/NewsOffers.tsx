
import "../styles/optimization.css"; 

export default function NewsOffers() {
  const newsItems = [
    {
      id: 1,
      category: "ƯU ĐÃI",
      title: "Ngày Hội Thành Viên - Giảm 50% Vé Xem Phim",
      date: "15/10/2026",
      description: "Đón chờ ngày hội lớn nhất năm dành cho thành viên VIP. Áp dụng toàn quốc từ 18:00 đến 23:59.",
      image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600&h=400",
      featured: true
    },
    {
      id: 2,
      category: "TIN TỨC",
      title: "Ra Mắt Rạp IMAX Hiện Đại Nhất Đông Nam Á",
      date: "10/10/2026",
      description: "Hệ thống máy chiếu laser kép chuẩn Hollywood, đưa trải nghiệm điện ảnh của bạn lên một tầm cao mới.",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600&h=400"
    },
    {
      id: 3,
      category: "SỰ KIỆN",
      title: "Giao Lưu Trực Tiếp Cùng Đạo Diễn Nolan",
      date: "05/10/2026",
      description: "Chỉ một đêm duy nhất tại TTTM My Cinema Quận 7. Đăng ký nhận vé mời tham dự ngay hôm nay.",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600&h=400"
    },
    {
      id: 4,
      category: "ƯU ĐÃI",
      title: "Combo Bắp Nước Sinh Viên Chỉ 49K",
      date: "01/10/2026",
      description: "Áp dụng cho học sinh, sinh viên mang theo thẻ HSSV hợp lệ vào các ngày thứ 3 hàng tuần.",
      image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=600&h=400"
    },
    {
      id: 5,
      category: "REVIEW",
      title: "Top 5 Bom Tấn Hành Động Không Thể Bỏ Lỡ",
      date: "28/09/2026",
      description: "Điểm qua những siêu phẩm điện ảnh sắp đổ bộ rạp tháng 11 này. Chuẩn bị book vé sớm!",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600&h=400"
    }
  ];

  const featured = newsItems.find(item => item.featured) || newsItems[0];
  const others = newsItems.filter(item => item.id !== featured.id);

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
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
          Tin Tức & Khuyến Mãi
        </h1>
        <p style={{ color: "#666", fontSize: "16px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          Cập nhật thông tin phim ảnh nóng hổi nhất, các sự kiện thảm đỏ và hàng ngàn voucher cực sốc từ My Cinema.
        </p>
      </div>

      {/* Featured News */}
      <div 
        style={{ 
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: "40px",
          cursor: "pointer",
          border: "1px solid #ebebeb",
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div 
          style={{ 
            flex: "1 1 50%", 
            minHeight: "350px", 
            backgroundImage: `url(${featured.image})`, 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          }}
        />
        <div style={{ flex: "1 1 50%", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ 
              background: "#e74c3c", color: "#fff", fontSize: "11px", fontWeight: 700, 
              padding: "4px 10px", borderRadius: "100px", letterSpacing: "1px"
            }}>
              {featured.category}
            </span>
            <span style={{ color: "#999", fontSize: "13px" }}>{featured.date}</span>
          </div>
          <h2 style={{ fontSize: "28px", color: "#333", margin: "0 0 16px 0", lineHeight: "1.3" }}>
            {featured.title}
          </h2>
          <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.6", margin: "0 0 24px 0" }}>
            {featured.description}
          </p>
          <div>
            <button 
              style={{
                background: "transparent",
                color: "#8b7355",
                border: "2px solid #8b7355",
                padding: "10px 24px",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#8b7355";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8b7355";
              }}
            >
              Xem Chi Tiết ➔
            </button>
          </div>
        </div>
      </div>

      {/* Grid News */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "30px"
        }}
      >
        {others.map(item => (
          <div 
            key={item.id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #ebebeb",
              display: "flex",
              flexDirection: "column",
              transition: "box-shadow 0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div 
              style={{
                height: "200px",
                backgroundImage: `url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#8b7355", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>
                  {item.category}
                </span>
                <span style={{ color: "#999", fontSize: "12px" }}>{item.date}</span>
              </div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#333", lineHeight: "1.4" }}>{item.title}</h3>
              <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#666", lineHeight: "1.5", flex: 1 }}>
                {item.description}
              </p>
              <div style={{ marginTop: "auto" }}>
                <a href="#" style={{ color: "#8b7355", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Đọc Tiếp →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button 
          style={{
            background: "#f0f0f0",
            color: "#666",
            border: "none",
            padding: "12px 30px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e0e0e0";
            e.currentTarget.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f0f0f0";
            e.currentTarget.style.color = "#666";
          }}
        >
          Tải Thêm Bài Viết
        </button>
      </div>
    </div>
  );
}
