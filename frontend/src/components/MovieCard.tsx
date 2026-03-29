import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";
import type { MovieCardProps } from "../types/movie";

export default function MovieCard({
  movie,
  showTrailer = false,
  trailerUrl,
}: MovieCardProps) {
  const duration = movie.duration ?? movie.durationMin;
  const age =
    movie.ageRating && movie.ageRating !== ""
      ? movie.ageRating
      : duration && duration > 120
        ? "13"
        : "K";

  const release =
    (movie.releaseDate || "").toString().slice(0, 10) || "Đang cập nhật";

  // Age badge colors
  let ageColor = "#F44336"; // Default/Red for mature
  if (age === "K" || age === "P") ageColor = "#4CAF50"; // Green for Kids/General
  else if (age === "13" || age === "T13" || age === "C13") ageColor = "#FF9800"; // Orange for Teens

  // Handle Genres mapping safely
  const genres = movie.genres 
    ? (Array.isArray(movie.genres) 
        ? movie.genres.map(g => (typeof g === 'string' ? g : g.name)).join(', ') 
        : movie.genres)
    : "Thể loại chưa cập nhật";

  return (
    <Link
      to={`/movies/${movie.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
    >
      <div className="premium-movie-card">
        
        {/* Poster Wrapper */}
        <div className="poster-wrapper">
          {/* We wrap LazyImage in a standard img style to reuse the overlay magic, 
              but since LazyImage renders an <img> internally, we use a div wrapper to cheat the CSS OR 
              render a normal img with error fallback */}
          <div className="poster-img">
            <LazyImage
              src={movie.posterUrl}
              alt={movie.title || "Movie poster"}
              width={400}
              height={600}
              quality={85}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>

          <div className="poster-overlay">
            <button className="buy-ticket-btn">
              🎟 Mua Vé / Xem Chi Tiết
            </button>
          </div>

          {/* Age Rating - Absolute top right */}
          <div
            className="age-badge"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: ageColor,
            }}
          >
            {age === "K" ? "Mọi lứa tuổi" : `C${age}`}
          </div>

          {/* Trailer Button Overlay (if explicitly requested externally, though our overlay handles it) */}
          {showTrailer && trailerUrl && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "8px",
                borderRadius: "50%",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
              }}
            >
              ▶
            </div>
          )}
        </div>

        {/* Info Wrapper */}
        <div className="card-info">
          <h3 className="card-title" title={movie.title}>
            {movie.title}
          </h3>
          
          <div className="genre-text" title={typeof genres === "string" ? genres : ""}>
            {genres}
          </div>

          <div className="card-meta">
            <div className="duration-badge">
              ⏱ {duration ? `${duration} Phút` : 'N/A'}
            </div>
            
            <div style={{ fontSize: "13px", color: "#8b7355", fontWeight: "600" }}>
              {release}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
