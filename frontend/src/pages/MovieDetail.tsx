import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/apiClient";
import BookingFlow from "../components/BookingFlow";

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
  // Expanded regex to support shorts and looser ID matching
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

  const { data, isLoading, isError } = useQuery<MovieDetailDto>({
    queryKey: ["movie-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/api/movies/${id}`);
      return res.data;
    },
  });

  const movie = data;
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

  // Scroll to booking section only when autoBook=true
  useEffect(() => {
    if (autoBook) {
      const bookingSection = document.getElementById("booking-section");
      if (bookingSection) bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  }, [autoBook]);

  // When navigating to a new movie or autoBook=false, ensure we are at top of page
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

  return (
    <main className="container" style={{ padding: "20px 0" }}>
      {isLoading && <div>Đang tải...</div>}
      {isError && <div>Có lỗi khi tải dữ liệu.</div>}
      {movie && (
        <>
          {/* 1) Hero */}
          <section className="detail-hero section-box">
            <div className="detail-hero-inner">
              <div className="detail-hero-video">
                {movie.trailerUrl ? (
                  <video
                    src={movie.trailerUrl}
                    poster={movie.posterUrl}
                    controls
                    style={{
                      width: "100%",
                      height: "450px",
                      borderRadius: "8px",
                    }}
                  />
                ) : youtubeId ? (
                  <iframe
                    width="100%"
                    height="450"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: "8px" }}
                  />
                ) : (
                  <div className="detail-hero-poster">
                    <img src={movie.posterUrl} alt="poster" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2) Info */}
          <section className="detail-info section-box">
            <div className="detail-grid">
              <div>
                <img
                  src={movie.posterUrl}
                  alt="poster"
                  className="detail-poster"
                />
                <button
                  onClick={handleBookClick}
                  className="fd-quick-booking-btn"
                  style={{ display: "block", width: "100%", marginTop: 12 }}
                >
                  Đặt vé
                </button>
              </div>

              <div className="movie-info-container">
                <h1 className="movie-title">{movie.title}</h1>

                <div className="movie-meta">
                  <div className="meta-item">
                    <span className="meta-label">Ngày phát hành:</span>
                    <span className="meta-value">{release}</span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Thời lượng:</span>
                    <span className="meta-value">{duration ?? ""} phút</span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Thể loại:</span>
                    <span className="meta-value">
                      {genres || "Chưa cập nhật"}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Đạo diễn:</span>
                    <span className="meta-value">
                      {movie.director || "Chưa cập nhật"}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Độ tuổi:</span>
                    <span className="age-badge">{age}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tóm tắt */}
          <section className="detail-summary section-box">
            <h2>Tóm tắt</h2>
            <div className="summary-text">
              {movie.description || "Mô tả phim..."}
            </div>
          </section>

          {/* Booking flow inline when autoBook */}
          {autoBook && (
            <section
              className="section-box section-booking"
              id="booking-section"
              tabIndex={0}
            >
              <h3>Đặt vé phim</h3>
              <BookingFlow movieId={id!} />
            </section>
          )}
        </>
      )}
    </main>
  );
}
