import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/apiClient";
import BookingFlow from "../components/BookingFlow";
import "../styles/optimization.css"; 

type MovieDetailDto = {
  id: number | string;
  title?: string;
  posterUrl?: string;
  trailerUrl?: string;
  youtubeUrl?: string;
  description?: string;
  duration?: number;
  durationMin?: number;
  ageRating?: string;
  releaseDate?: string;
  director?: string;
  genres?: Array<{ id: number; name: string }> | string[];
};

// Helper to extract YouTube ID
function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length >= 11 ? match[2] : null;
}

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const autoBook = params.get("autoBook") === "true";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "reviews">("overview");
  const [showTrailerMenu, setShowTrailerMenu] = useState(false);

  const { data: movie, isLoading, isError } = useQuery<MovieDetailDto>({
    queryKey: ["movie-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/api/movies/${id}`);
      return res.data;
    },
  });

  const duration = movie?.duration ?? movie?.durationMin;
  const age =
    movie?.ageRating && movie.ageRating !== ""
      ? movie.ageRating
      : duration && duration > 120
        ? "13"
        : "K";
  const release =
    (movie?.releaseDate || "").toString().slice(0, 10) || "Đang cập nhật";
  const genres = Array.isArray(movie?.genres)
    ? (movie!.genres as any[])
        .map((g: any) => (typeof g === "string" ? g : g.name))
        .join(", ")
    : "Chưa cập nhật";

  useEffect(() => {
    if (autoBook) {
      setTimeout(() => {
        const bookingSection = document.getElementById("booking-section");
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 500); // Wait for render
    }
  }, [autoBook, isLoading]);

  useEffect(() => {
    if (!autoBook) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id, autoBook]);

  const handleBookClick = () => {
    if (autoBook) {
      const bookingSection = document.getElementById("booking-section");
      if (bookingSection) bookingSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/movies/${id}?autoBook=true`, { replace: true });
    }
  };

  const youtubeId = getYouTubeId(movie?.youtubeUrl);

  // MOCK DATA for Cast & Reviews
  const mockCast = [
    { name: "Shin", role: "Nhân vật chính", image: "https://anhnail.com/wp-content/uploads/2025/09/avt-shin.jpg" },
    { name: "Chihiro", role: "Nhân vật chính", image: "https://img.buzzfeed.com/buzzfeed-static/static/2021-06/18/18/asset/2d325be73cd6/sub-buzz-3656-1624042184-8.jpg?downsize=900:*&output-format=auto&output-quality=auto" },
    { name: "Anna", role: "Nhân vật chính", image: "https://static0.colliderimages.com/wordpress/wp-content/uploads/2023/12/anna-from-when-marnie-was-there.jpg?q=49&fit=crop&w=825&dpr=2" },
    { name: "Saitama", role: "Khách mời", image: "https://resize.cdn.otakumode.com/ex/680.367/u/21e04918a35c4289be1a169383aad10d.jpg" },
  ];

  const mockReviews = [
    { author: "Minh Anh", rating: 5, date: "10/10/2026", content: "Phim quá hay, kỹ xảo đỉnh cao, nội dung cảm động rớt nước mắt. Chắc chắn sẽ dẫn gia đình đi xem lại lần 2!" },
    { author: "Trần Sơn", rating: 4, date: "09/10/2026", content: "Nhịp phim hơi chậm ở nửa đầu nhưng đoạn sau bùng nổ. Đặc biệt ấn tượng với âm nhạc và góc máy." },
    { author: "Ngọc Lan", rating: 5, date: "05/10/2026", content: "Đúng chất bom tấn Hollywood! Không có điểm gì để chê, diễn viên diễn quá đạt." },
  ];

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", background: "#faf9f6" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid rgba(0,0,0,0.1)", borderTop: "3px solid #e74c3c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );
  
  if (isError || !movie) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#666", background: "#f5f5f5", minHeight: "50vh" }}>
      <h2>Không tìm thấy phim</h2>
      <button onClick={() => navigate("/")} style={{ background: "#8b7355", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", marginTop: "16px" }}>Về trang chủ</button>
    </div>
  );

  return (
    <main style={{ background: "#faf9f6", minHeight: "100vh", color: "#333", paddingBottom: "60px" }}>
      <style>{`
        .glass-panel {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          padding: 40px;
        }
        .glow-btn {
          position: relative;
          background: #e74c3c;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
        }
        .glow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
          background: #c0392b;
        }
        .outline-btn {
          background: transparent;
          border: 2px solid #8b7355;
          color: #8b7355;
          padding: 12px 30px;
          border-radius: 50px;
          fontWeight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .outline-btn:hover {
          background: #8b7355;
          color: #fff;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: #888;
          font-size: 16px;
          font-weight: 600;
          padding: 12px 24px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tab-btn.active {
          color: #8b7355;
          border-bottom: 2px solid #8b7355;
        }
        .tab-btn:hover:not(.active) {
          color: #333;
        }
        /* Mobile fixes */
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
          }
          .hero-poster-container {
            margin: 0 auto 30px auto;
          }
          .hero-actions {
            justify-content: center;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section 
        style={{
          position: "relative",
          width: "100%",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          padding: "100px 0 60px 0",
          overflow: "hidden",
          borderBottom: "1px solid #ebebeb",
        }}
      >
        {/* Blurred Backdrop - Lightened */}
        <div 
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${movie.posterUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px) opacity(0.2)",
            transform: "scale(1.1)", // Prevent blurred edges from leaking
            zIndex: 0
          }}
        />
        {/* Gradient Overlay for texture */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(250,249,246,0.6) 0%, rgba(250,249,246,1) 100%)", zIndex: 1 }} />

        {/* Hero Content */}
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-content" style={{ display: "flex", gap: "50px", alignItems: "flex-end" }}>
            
            {/* Poster */}
            <div className="hero-poster-container" style={{ flexShrink: 0, width: "300px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", display: "block", aspectRatio: "2/3", objectFit: "cover" }} />
            </div>

            {/* Movie Info */}
            <div style={{ flex: 1, paddingBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={{ background: "#e74c3c", color: "#fff", padding: "4px 12px", borderRadius: "4px", fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>
                  {age === "K" ? "Mọi lứa tuổi" : `C${age}`}
                </span>
                <span style={{ color: "#333", background: "#fff", border: "1px solid #ddd", padding: "4px 10px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>
                  {duration ?? 0} PHÚT
                </span>
                <span style={{ color: "#333", background: "#fff", border: "1px solid #ddd", padding: "4px 10px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>
                  {release}
                </span>
              </div>
              
              <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, margin: "0 0 12px 0", lineHeight: "1.1", color: "#333", letterSpacing: "-0.5px" }}>
                {movie.title}
              </h1>
              
              <p style={{ fontSize: "18px", color: "#8b7355", margin: "0 0 24px 0", fontStyle: "italic", fontWeight: 500 }}>
                {genres}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px", marginBottom: "40px", fontSize: "15px", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", width: "fit-content", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                <strong style={{ color: "#8b7355" }}>Đạo diễn:</strong>
                <span style={{ color: "#333", fontWeight: 500 }}>{movie.director || "Chưa cập nhật"}</span>
                <strong style={{ color: "#8b7355" }}>Ngôn ngữ:</strong>
                <span style={{ color: "#333", fontWeight: 500 }}>Tiếng Anh - Phụ đề Tiếng Việt</span>
              </div>

              <div className="hero-actions" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <button onClick={handleBookClick} className="glow-btn">
                  🎟 Mua Vé Ngay
                </button>
                
                {(youtubeId || movie.trailerUrl) && (
                  <button className="outline-btn" onClick={() => setShowTrailerMenu(true)}>
                    ▶ Xem Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal Overlay */}
      {showTrailerMenu && (youtubeId || movie?.trailerUrl) && (
        <div 
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(5px)" }}
          onClick={() => setShowTrailerMenu(false)}
        >
          <div style={{ width: "90%", maxWidth: "1000px", aspectRatio: "16/9", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowTrailerMenu(false)}
              style={{ position: "absolute", top: "-40px", right: 0, background: "none", border: "none", color: "#fff", fontSize: "30px", cursor: "pointer" }}
            >
              ×
            </button>
            {youtubeId ? (
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
              />
            ) : (
              <video
                width="100%" height="100%"
                src={movie.trailerUrl}
                controls
                autoPlay
                style={{ borderRadius: "12px", background: "#000", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", objectFit: "contain" }}
              />
            )}
          </div>
        </div>
      )}

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        
        {/* Content Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #ddd", marginBottom: "40px", overflowX: "auto" }}>
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Tổng Quan</button>
          <button className={`tab-btn ${activeTab === "cast" ? "active" : ""}`} onClick={() => setActiveTab("cast")}>Diễn Viên</button>
          <button className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Đánh Giá</button>
        </div>

        <div style={{ minHeight: "300px", padding: "0 20px" }}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              <div className="glass-panel">
                <h3 style={{ color: "#333", fontSize: "22px", margin: "0 0 20px 0", fontWeight: 700 }}>Tóm Tắt Khởi Đầu</h3>
                <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.8", margin: 0 }}>
                  {movie.description || "Nội dung phim đang được cập nhật. Hãy đón xem những bất ngờ thú vị mà tác phẩm điện ảnh này mang lại tại tất cả hệ thống rạp của chúng tôi."}
                </p>
              </div>
            </div>
          )}

          {/* CAST TAB */}
          {activeTab === "cast" && (
            <div>
              <h3 style={{ color: "#333", fontSize: "22px", margin: "0 0 30px 0", fontWeight: 700 }}>Diễn Viên Chính</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "30px" }}>
                {mockCast.map((actor, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div style={{ width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 16px auto", overflow: "hidden", border: "2px solid #8b7355", transition: "transform 0.3s", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }} onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}>
                      <img src={actor.image} alt={actor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700, color: "#333" }}>{actor.name}</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{actor.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <h3 style={{ color: "#333", fontSize: "22px", margin: 0, fontWeight: 700 }}>Đánh Giá Từ Khán Giả</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "#e74c3c" }}>4.8</span>
                  <div style={{ color: "#f1c40f", fontSize: "20px" }}>★★★★★</div>
                  <span style={{ color: "#888", fontSize: "14px", fontWeight: 600 }}>(1,284 lượt)</span>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {mockReviews.map((review, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#e74c3c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px", boxShadow: "0 2px 5px rgba(231,76,60,0.3)" }}>
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#333", fontWeight: 700 }}>{review.author}</h4>
                          <span style={{ color: "#888", fontSize: "13px" }}>{review.date}</span>
                        </div>
                      </div>
                      <div style={{ color: "#f1c40f", fontSize: "16px" }}>
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "15px", color: "#555", lineHeight: "1.6" }}>
                      "{review.content}"
                    </p>
                  </div>
                ))}
                
                <button className="outline-btn" style={{ alignSelf: "center", marginTop: "20px" }}>
                  Viết Đánh Giá Của Bạn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Flow Section */}
      {autoBook && (
        <div className="container" style={{ marginTop: "60px" }}>
          <section
            className="glass-panel"
            id="booking-section"
            tabIndex={0}
            style={{ padding: "40px", scrollMarginTop: "100px" }}
          >
            <h2 style={{ fontSize: "28px", color: "#333", marginBottom: "30px", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>
              Lịch Chiếu & Đặt Vé
            </h2>
            <BookingFlow movieId={id!} />
          </section>
        </div>
      )}
    </main>
  );
}
