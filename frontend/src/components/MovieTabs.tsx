import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";
import type { MovieItem } from "../types/movie";

export type MovieTabsProps = {
  nowShowing: MovieItem[];
  comingSoon: MovieItem[];
  nowShowingHasMore?: boolean;
  comingSoonHasMore?: boolean;
  onLoadMoreNowShowing?: () => void;
  onLoadMoreComingSoon?: () => void;
  loadingMoreNowShowing?: boolean;
  loadingMoreComingSoon?: boolean;
};

export default function MovieTabs(props: MovieTabsProps) {
  const {
    nowShowing,
    comingSoon,
    nowShowingHasMore,
    comingSoonHasMore,
    onLoadMoreNowShowing,
    onLoadMoreComingSoon,
    loadingMoreNowShowing,
    loadingMoreComingSoon,
  } = props;

  const [activeTab, setActiveTab] = useState<"now" | "soon">("now");

  const normalizedNow = useMemo(
    () =>
      (nowShowing || [])
        .filter(Boolean)
        .map((m) => ({
          ...m!,
          duration: m?.duration ?? m?.durationMin,
        })),
    [nowShowing]
  );

  const normalizedSoon = useMemo(
    () =>
      (comingSoon || [])
        .filter(Boolean)
        .map((m) => ({
          ...m!,
          duration: m?.duration ?? m?.durationMin,
        })),
    [comingSoon]
  );

  return (
    <div className="movie-tabs-container">
      <div className="movie-tabs" id="now-showing">
        <button
          className={`movie-tab ${activeTab === "now" ? "active" : ""}`}
          data-tab="now-showing"
          onClick={() => setActiveTab("now")}
        >
          Phim đang chiếu
        </button>
        <button
          className={`movie-tab ${activeTab === "soon" ? "active" : ""}`}
          data-tab="coming-soon"
          onClick={() => setActiveTab("soon")}
        >
          Phim sắp chiếu
        </button>
      </div>

      {/* Now Showing */}
      <div
        className={`lotte-tab-content ${activeTab === "now" ? "active" : ""}`}
      >
        <div className="lotte-movie-grid" id="nowShowingMoviesContainer">
          {normalizedNow.length === 0 && (
            <div
              className="no-movies-message"
              style={{ textAlign: "center", padding: "40px 20px", gridColumn: "1 / -1" }}
            >
              <h3 style={{ marginBottom: 16, color: "#8b7355", fontSize: 18, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Không có phim đang chiếu nào
              </h3>
              <p style={{ marginBottom: 16, color: "#8b7355", fontSize: 14, lineHeight: 1.5 }}>
                Vui lòng quay lại sau!
              </p>
            </div>
          )}

          {normalizedNow.map((movie, idx) => (
            <div
              className="lotte-movie-card"
              key={`now-${movie.id ?? idx}`}
              data-genre={movie.genres || ""}
              data-director={movie.director || ""}
              data-year={(movie.releaseDate || "").toString().slice(0, 4)}
            >
              <div className="lotte-movie-poster">
                <LazyImage
                  src={movie.posterUrl}
                  alt={movie.title || "Movie poster"}
                  width={300}
                  height={450}
                  quality={85}
                  style={{ width: "100%", height: "auto" }}
                />
                <div className="lotte-movie-overlay">
                  <div className="lotte-movie-buttons">
                    <Link
                      to={`/movies/${movie.id}?autoBook=true`}
                      className="lotte-btn-book"
                    >
                      Đặt vé
                    </Link>
                    <Link
                      to={`/movies/${movie.id}`}
                      className="lotte-btn-detail"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
              <div className="lotte-movie-info">
                <div className="lotte-movie-rating">
                  <span className="lotte-age-rating">
                    {movie.ageRating && movie.ageRating !== ""
                      ? movie.ageRating
                      : movie.duration && movie.duration > 120
                        ? "13"
                        : "K"}
                  </span>
                  <span className="lotte-movie-title">{movie.title}</span>
                </div>
                <div className="lotte-movie-meta">
                  <span className="lotte-movie-duration">
                    {movie.duration ? `${movie.duration} Phút` : ""}
                  </span>
                  <span className="lotte-movie-date">
                    {(movie.releaseDate || "").toString().slice(0, 10)}
                  </span>
                </div>
                <span className="lotte-movie-genre" style={{ display: "none" }}>
                  {movie.genres || ""}
                </span>
                <span
                  className="lotte-movie-director"
                  style={{ display: "none" }}
                >
                  {movie.director || ""}
                </span>
                <span className="lotte-movie-year" style={{ display: "none" }}>
                  {(movie.releaseDate || "").toString().slice(0, 4)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {nowShowingHasMore && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              id="loadMoreNowShowing"
              onClick={onLoadMoreNowShowing}
              disabled={loadingMoreNowShowing}
            >
              {loadingMoreNowShowing ? "Đang tải..." : "Xem thêm phim"}
            </button>
            {loadingMoreNowShowing && (
              <div className="load-more-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coming Soon */}
      <div
        className={`lotte-tab-content ${activeTab === "soon" ? "active" : ""}`}
        id="coming-soon"
      >
        <div className="lotte-movie-grid" id="comingSoonMoviesContainer">
          {normalizedSoon.length === 0 && (
            <div
              className="no-movies-message"
              style={{ textAlign: "center", padding: "40px 20px", gridColumn: "1 / -1" }}
            >
              <h3 style={{ marginBottom: 16, color: "#8b7355", fontSize: 18, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Không có phim sắp chiếu nào
              </h3>
              <p style={{ marginBottom: 16, color: "#8b7355", fontSize: 14, lineHeight: 1.5 }}>
                Vui lòng quay lại sau!
              </p>
            </div>
          )}

          {normalizedSoon.map((movie, idx) => (
            <div
              className="lotte-movie-card"
              key={`soon-${movie.id ?? idx}`}
              data-genre={movie.genres || ""}
              data-director={movie.director || ""}
              data-year={(movie.releaseDate || "").toString().slice(0, 4)}
            >
              <div className="lotte-movie-poster">
                <LazyImage
                  src={movie.posterUrl}
                  alt={movie.title || "Movie poster"}
                  width={300}
                  height={450}
                  quality={85}
                  style={{ width: "100%", height: "auto" }}
                />
                <div className="lotte-movie-overlay">
                  <div className="lotte-movie-buttons">
                    <Link
                      to={`/movies/${movie.id}`}
                      className="lotte-btn-detail"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
              <div className="lotte-movie-info">
                <div className="lotte-movie-rating">
                  <span className="lotte-age-rating">
                    {movie.ageRating && movie.ageRating !== ""
                      ? movie.ageRating
                      : movie.duration && movie.duration > 120
                        ? "13"
                        : "K"}
                  </span>
                  <span className="lotte-movie-title">{movie.title}</span>
                </div>
                <div className="lotte-movie-meta">
                  <span className="lotte-movie-duration">
                    {movie.duration ? `${movie.duration} Phút` : ""}
                  </span>
                  <span className="lotte-movie-date">
                    {(movie.releaseDate || "").toString().slice(0, 10)}
                  </span>
                </div>
                <span className="lotte-movie-genre" style={{ display: "none" }}>
                  {movie.genres || ""}
                </span>
                <span
                  className="lotte-movie-director"
                  style={{ display: "none" }}
                >
                  {movie.director || ""}
                </span>
                <span className="lotte-movie-year" style={{ display: "none" }}>
                  {(movie.releaseDate || "").toString().slice(0, 4)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {comingSoonHasMore && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              id="loadMoreComingSoon"
              onClick={onLoadMoreComingSoon}
              disabled={loadingMoreComingSoon}
            >
              {loadingMoreComingSoon ? "Đang tải..." : "Xem thêm phim"}
            </button>
            {loadingMoreComingSoon && (
              <div className="load-more-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
