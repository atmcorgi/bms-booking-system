
import "../styles/optimization.css"; 

export default function GiftShop() {
  const giftItems = [
    {
      id: 1,
      name: "Voucher Xem Phim 2D",
      price: "100.000 đ",
      description: "Áp dụng cho mọi rạp (trừ Lễ/Tết). Hạn sử dụng 3 tháng.",
      image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400&h=300"
    },
    {
      id: 2,
      name: "Combo Bắp Nước Sweet",
      price: "85.000 đ",
      description: "1 Bắp ngọt lớn + 2 Nước ngọt cỡ vừa. (Tiết kiệm 20%)",
      image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=400&h=300"
    },
    {
      id: 3,
      name: "Thẻ Thành Viên VIP",
      price: "1.000.000 đ",
      description: "Tặng ngay 5 vé 2D miễn phí và giảm 10% trọn đời toàn bộ dịch vụ.",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=400&h=300"
    },
    {
      id: 4,
      name: "Gấu Bông Mascot Rạp",
      price: "250.000 đ",
      description: "Phiên bản giới hạn số lượng. Nhồi bông 100% tự nhiên mềm mịn.",
      image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&q=80&w=400&h=300"
    },
    {
      id: 5,
      name: "Cốc Sứ Giữ Nhiệt Avengers",
      price: "180.000 đ",
      description: "Kỷ niệm 10 năm MCU. Dung tích 500ml, giữ nhiêt tới 8 tiếng.",
      image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400&h=300"
    },
    {
      id: 6,
      name: "Voucher Couple Hẹn Hò",
      price: "350.000 đ",
      description: "2 Vé xem phim + 1 Combo Bắp nước + Ghế Sweetbox (độc quyền).",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=300"
    }
  ];

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      {/* Hero Banner */}
      <div 
        style={{
          background: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600&h=400') center/cover no-repeat",
          borderRadius: "16px",
          height: "300px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}></div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 20px" }}>
          <h1 style={{ color: "#fff", fontSize: "36px", fontWeight: 700, margin: "0 0 10px 0", letterSpacing: "1px", textTransform: "uppercase" }}>
            Cửa Hàng Quà Tặng
          </h1>
          <p style={{ color: "#eee", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Trao gửi yêu thương qua những món đồ cực độc đáo dành riêng cho tín đồ điện ảnh. Mua sắm dễ dàng, đổi quà liền tay!
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "24px"
        }}
      >
        {giftItems.map(item => (
          <div 
            key={item.id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #eee",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s, box-shadow 0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
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
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#333" }}>{item.name}</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#666", lineHeight: "1.5", flex: 1 }}>
                {item.description}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#e74c3c" }}>{item.price}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Đã thêm ${item.name} vào giỏ hàng`);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#8b7355",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
