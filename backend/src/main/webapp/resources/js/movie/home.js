// Home page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Tab switching functionality
  const movieTabs = document.querySelectorAll(".movie-tab");
  const tabContents = document.querySelectorAll(".lotte-tab-content");

  movieTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      movieTabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // Load more functionality moved to load-more.js
  // Old logic removed to avoid conflicts with new API-based load more

  // Debug: Log initial state
});
