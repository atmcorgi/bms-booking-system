import { useMemo, useState } from "react";
import type { MovieItem } from "../types/movie";
import MovieCard from "./MovieCard";
import Confetti from "./Confetti";

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
  const [showConfetti, setShowConfetti] = useState(false);

  const handleTabChange = (tab: "now" | "soon") => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setShowConfetti(true);
    }
  };
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
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} duration={2500} />
      
      <div className="movie-tabs" id="now-showing">
        <button
          className={`movie-tab ${activeTab === "now" ? "active" : ""}`}
          data-tab="now-showing"
          onClick={() => handleTabChange("now")}
        >
          Phim đang chiếu
        </button>
        <button
          className={`movie-tab ${activeTab === "soon" ? "active" : ""}`}
          data-tab="coming-soon"
          onClick={() => handleTabChange("soon")}
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
            <MovieCard key={`now-${movie.id ?? idx}`} movie={movie} />
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
            <MovieCard key={`soon-${movie.id ?? idx}`} movie={movie} />
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
