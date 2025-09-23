// Load More functionality for movie sections
document.addEventListener("DOMContentLoaded", function () {
  let nowShowingPage = 1;
  let comingSoonPage = 1;

  // Load More Now Showing
  const loadMoreNowShowingBtn = document.getElementById("loadMoreNowShowing");
  if (loadMoreNowShowingBtn) {
    loadMoreNowShowingBtn.addEventListener("click", function () {
      loadMoreMovies(
        "now-showing",
        nowShowingPage,
        "nowShowingMoviesContainer",
        "loadMoreNowShowing"
      );
      nowShowingPage++;
    });
  }

  // Load More Coming Soon
  const loadMoreComingSoonBtn = document.getElementById("loadMoreComingSoon");
  if (loadMoreComingSoonBtn) {
    loadMoreComingSoonBtn.addEventListener("click", function () {
      loadMoreMovies(
        "coming-soon",
        comingSoonPage,
        "comingSoonMoviesContainer",
        "loadMoreComingSoon"
      );
      comingSoonPage++;
    });
  }
});

function loadMoreMovies(type, page, containerId, buttonId) {
  const container = document.getElementById(containerId);
  const button = document.getElementById(buttonId);

  if (!container || !button) return;

  // Show loading state
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
  button.disabled = true;

  // Make API call
  fetch(`/api/movies/${type}?page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      // Remove "no movies" message if it exists
      const noMoviesMessage = container.querySelector(".no-movies-message");
      if (noMoviesMessage) {
        noMoviesMessage.remove();
      }

      // Append new movies to container (keep existing ones)
      data.movies.forEach((movie) => {
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
      });

      // Hide button if no more movies
      if (!data.hasMore) {
        button.style.display = "none";
      } else {
        button.innerHTML = "Xem thêm phim";
        button.disabled = false;
      }
    })
    .catch((error) => {
      console.error("Error loading more movies:", error);
      button.innerHTML = "Có lỗi xảy ra";
      button.disabled = false;
    });
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "lotte-movie-card";

  // Create data attributes for filtering - handle both entity and projection formats
  const genres = movie.genres
    ? Array.isArray(movie.genres)
      ? movie.genres.map((g) => g.name).join(", ")
      : movie.genres
    : "";
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : "";
  const ageRating = movie.ageRating || (movie.duration > 120 ? "13" : "K");
  const releaseDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
    : "";

  card.setAttribute("data-genre", genres);
  card.setAttribute("data-director", movie.director || "");
  card.setAttribute("data-year", year);

  card.innerHTML = `
        <div class="lotte-movie-poster">
            <img src="${
              movie.posterUrl || "/resources/imgs/default-poster.jpg"
            }" alt="${movie.title}" />
            <div class="lotte-movie-overlay">
                <div class="lotte-movie-buttons">
                    ${
                      movie.status === "PUBLISHED"
                        ? `<a href="/movies/${movie.id}?autoBook=true" class="lotte-btn-book">Đặt vé</a>`
                        : ""
                    }
                    <a href="/movies/${
                      movie.id
                    }" class="lotte-btn-detail">Chi tiết</a>
                </div>
            </div>
        </div>
        <div class="lotte-movie-info">
            <div class="lotte-movie-rating">
                <span class="lotte-age-rating">${ageRating}</span>
                <span class="lotte-movie-title">${movie.title}</span>
            </div>
            <div class="lotte-movie-meta">
                <span class="lotte-movie-duration">${movie.duration}Phút</span>
                <span class="lotte-movie-date">${releaseDate}</span>
            </div>
            <!-- Hidden elements for filtering -->
            <span class="lotte-movie-genre" style="display: none">${genres}</span>
            <span class="lotte-movie-director" style="display: none">${
              movie.director || ""
            }</span>
            <span class="lotte-movie-year" style="display: none">${year}</span>
        </div>
    `;

  return card;
}
