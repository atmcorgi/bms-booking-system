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

  return (
    <div
      className="movie-card"
      style={{
        background: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease-in-out",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Link
        to={`/movies/${movie.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="movie-poster"
          style={{ position: "relative", aspectRatio: "2/3" }}
        >
          <LazyImage
            src={movie.posterUrl}
            alt={movie.title || "Movie poster"}
            width={300}
            height={450}
            quality={85}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Age rating badge */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background:
                age === "P" ? "#4CAF50" : age === "T13" ? "#FF9800" : "#F44336",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {age}
          </div>

          {/* Trailer play button */}
          {showTrailer && trailerUrl && (
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "8px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "8px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ▶️
            </div>
          )}
        </div>

        <div className="movie-info" style={{ padding: "12px" }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "16px",
              fontWeight: "600",
              lineHeight: "1.3",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {movie.title}
          </h3>

          <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "4px",
            }}
          >
            {movie.director}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#999",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{duration} phút</span>
            <span>{release}</span>
          </div>

          {movie.genres && (
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "8px",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {movie.genres}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
