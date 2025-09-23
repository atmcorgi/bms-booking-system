// Search and Filter functionality

// Add event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load genres dynamically
  loadGenres();

  // Setup custom dropdown
  setupCustomDropdown();

  // Setup age rating badges
  setupAgeRatingBadges();

  // Year filter change event
  const yearFilter = document.getElementById("year-filter");
  if (yearFilter) {
    yearFilter.addEventListener("input", function () {
      performSearch();
    });
  } else {
  }

  // Year quick filter buttons
  const yearBtns = document.querySelectorAll(".year-btn");
  yearBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const year = this.dataset.year;

      if (!year) {
        if (yearFilter) yearFilter.value = "";
        yearBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        performSearch();
        return;
      }

      // Toggle this year's active state, allow multi-select
      const isActive = this.classList.contains("active");
      if (isActive) {
        this.classList.remove("active");
      } else {
        this.classList.add("active");
      }

      // Recompute selected years from active buttons (exclude the "Tất cả" button)
      const activeYears = Array.from(
        document.querySelectorAll(".year-btn.active")
      )
        .map((b) => b.dataset.year)
        .filter((y) => y);

      // Update input value as comma-separated list without spaces
      if (yearFilter) {
        yearFilter.value = activeYears.join(",");
      }

      // Ensure the "Tất cả" button is not active when any year selected
      const allBtn = Array.from(yearBtns).find((b) => !b.dataset.year);
      if (allBtn) {
        if (activeYears.length > 0) {
          allBtn.classList.remove("active");
        } else {
          allBtn.classList.add("active");
        }
      }

      performSearch();
    });
  });

  // Search button click event
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    console.log("Found search button, adding event listener");
    searchBtn.addEventListener("click", function () {
      console.log("Search button clicked");
      performSearch();
    });
  } else {
  }

  // Search input enter key event
  const searchInput = document.getElementById("global-search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  } else {
  }
});

// Setup custom dropdown functionality
function setupCustomDropdown() {
  const trigger = document.getElementById("genre-dropdown-trigger");
  const menu = document.getElementById("genre-dropdown-menu");

  if (trigger && menu) {
    // Toggle dropdown on trigger click
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = menu.classList.contains("show");

      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) {
        closeDropdown();
      }
    });

    // Handle item selection
    menu.addEventListener("click", function (e) {
      if (e.target.classList.contains("dropdown-item")) {
        const value = e.target.dataset.value;
        const text = e.target.textContent;

        // Update trigger text
        document.querySelector(".dropdown-text").textContent = text;

        // Update selected state
        menu.querySelectorAll(".dropdown-item").forEach((item) => {
          item.classList.remove("selected");
        });
        e.target.classList.add("selected");

        // Close dropdown
        closeDropdown();

        // Trigger search

        performSearch();
      }
    });
  }
}

function openDropdown() {
  const trigger = document.getElementById("genre-dropdown-trigger");
  const menu = document.getElementById("genre-dropdown-menu");

  if (trigger && menu) {
    trigger.classList.add("active");
    menu.classList.add("show");
  }
}

function closeDropdown() {
  const trigger = document.getElementById("genre-dropdown-trigger");
  const menu = document.getElementById("genre-dropdown-menu");

  if (trigger && menu) {
    trigger.classList.remove("active");
    menu.classList.remove("show");
  }
}

// Setup age rating badges with colors
function setupAgeRatingBadges() {
  const ageRatingElements = document.querySelectorAll(".lotte-age-rating");

  ageRatingElements.forEach((element) => {
    const rating = element.textContent.trim();

    // Set data-rating attribute
    element.setAttribute("data-rating", rating);

    // Add specific class based on rating
    element.classList.remove(
      "rating-k",
      "rating-6",
      "rating-13",
      "rating-16",
      "rating-18"
    );

    if (rating === "K") {
      element.classList.add("rating-k");
    } else if (rating === "6+") {
      element.classList.add("rating-6");
    } else if (rating === "13+") {
      element.classList.add("rating-13");
    } else if (rating === "16+") {
      element.classList.add("rating-16");
    } else if (rating === "18+") {
      element.classList.add("rating-18");
    }
  });
}

// Load genres from API
async function loadGenres() {
  try {
    const response = await fetch("/movies/api/genres");
    if (!response.ok) {
      throw new Error("Failed to load genres");
    }

    const genres = await response.json();

    const genreMenu = document.getElementById("genre-dropdown-menu");
    if (genreMenu) {
      // Clear existing items except the first one
      genreMenu.innerHTML =
        '<div class="dropdown-item selected" data-value="">Tất cả thể loại</div>';

      // Add genre items
      genres.forEach((genre) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.dataset.value = genre;
        item.textContent = genre;
        genreMenu.appendChild(item);
      });
    }
  } catch (error) {
    console.error("Error loading genres:", error);
    // Fallback to hardcoded genres if API fails
    loadFallbackGenres();
  }
}

// Fallback genres if API fails
function loadFallbackGenres() {
  const fallbackGenres = [
    "Hành động",
    "Hài",
    "Tâm lý",
    "Kinh dị",
    "Lãng mạn",
    "Khoa học viễn tưởng",
    "Kịch tính",
    "Hoạt hình",
    "Tài liệu",
    "Phiêu lưu",
    "Tội phạm",
    "Gia đình",
    "Nhạc kịch",
    "Animation",
    "Mystery",
    "Drama",
    "Thriller",
  ];

  const genreMenu = document.getElementById("genre-dropdown-menu");
  if (genreMenu) {
    genreMenu.innerHTML =
      '<div class="dropdown-item selected" data-value="">Tất cả thể loại</div>';
    fallbackGenres.forEach((genre) => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.dataset.value = genre;
      item.textContent = genre;
      genreMenu.appendChild(item);
    });
  }
}

// Global functions for search and filter
window.performSearch = function () {
  const searchTerm = document
    .getElementById("global-search-input")
    .value.trim();
  const filters = getActiveFilters();

  // Call the filter function that updates movie tabs
  filterMovies(searchTerm, filters);
};

window.getActiveFilters = function () {
  const genreSelected = document.querySelector(
    "#genre-dropdown-menu .dropdown-item.selected"
  );
  const yearFilter = document.getElementById("year-filter");

  const genreValue = genreSelected ? genreSelected.dataset.value : "";

  return {
    genre: genreValue,
    year: yearFilter ? yearFilter.value : "",
  };
};

window.hasActiveFilters = function (filters) {
  return filters.genre || filters.year;
};

window.clearFilters = function () {
  try {
    // Reset custom dropdown
    const dropdownText = document.querySelector(".dropdown-text");
    if (dropdownText) {
      dropdownText.textContent = "Tất cả thể loại";
    } else {
    }

    const dropdownItems = document.querySelectorAll(
      "#genre-dropdown-menu .dropdown-item"
    );
    if (dropdownItems.length > 0) {
      dropdownItems.forEach((item) => {
        item.classList.remove("selected");
      });
    } else {
    }

    // Select "Tất cả thể loại" item
    const allItem = document.querySelector(
      "#genre-dropdown-menu .dropdown-item[data-value='']"
    );
    if (allItem) {
      allItem.classList.add("selected");
    } else {
    }

    // Reset year filter
    const yearFilter = document.getElementById("year-filter");
    if (yearFilter) {
      yearFilter.value = "";
    } else {
    }

    // Reset year buttons
    const yearBtns = document.querySelectorAll(".year-btn");
    if (yearBtns.length > 0) {
      yearBtns.forEach((btn) => {
        btn.classList.remove("active");
      });
    } else {
    }

    // Reset search input
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      searchInput.value = "";
    } else {
    }

    filterMovies("", {});
  } catch (error) {
    console.error("Error clearing filters:", error);
  }
};

window.filterMovies = function (searchTerm, filters) {
  // Get all movie cards
  const movieCards = document.querySelectorAll(".lotte-movie-card");

  let visibleCount = 0;

  movieCards.forEach((card, index) => {
    const title =
      card.querySelector(".lotte-movie-title")?.textContent?.toLowerCase() ||
      "";
    const genre = card.dataset.genre?.toLowerCase() || "";

    const director = card.dataset.director?.toLowerCase() || "";
    const year = card.dataset.year || "";

    let matches = true;

    // Text search (keyword search across title, director, genre)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const movieGenres = genre
        ? genre
            .split(",")
            .map((g) => g.trim().toLowerCase())
            .filter((g) => g)
        : [];
      const textMatch =
        title.includes(searchLower) ||
        director.includes(searchLower) ||
        movieGenres.some((g) => g.includes(searchLower));
      if (!textMatch) matches = false;
    }

    // Genre filter
    if (filters.genre) {
      const filterGenre = filters.genre.toLowerCase().trim();
      const movieGenres = genre
        ? genre
            .split(",")
            .map((g) => g.trim().toLowerCase())
            .filter((g) => g)
        : [];
      console.log(`Card ${index} genre filter DETAILED:`, {
        originalGenre: card.dataset.genre,
        filterGenre,
        movieGenres,
        genreMatch: movieGenres.some((g) => g === filterGenre),
        allMatches: movieGenres.map((g) => ({
          genre: g,
          matches: g === filterGenre,
        })),
      });
      const genreMatch = movieGenres.some(
        (g) => g.includes(filterGenre) || filterGenre.includes(g)
      );
      if (!genreMatch) {
        matches = false;
      }
    }

    // Year filter (supports comma-separated years in filters.year)
    if (filters.year) {
      const wantedYears = filters.year
        .split(",")
        .map((y) => y.trim())
        .filter((y) => y);
      if (wantedYears.length > 0 && !wantedYears.includes(year)) {
        matches = false;
      }
    }

    // Show/hide card
    if (matches) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Update result count
  updateSearchResults(visibleCount, movieCards.length, searchTerm, filters);
};

window.updateSearchResults = function (
  visibleCount,
  totalCount,
  searchTerm,
  filters
) {
  // Find or create results display
  let resultsDisplay = document.getElementById("search-results-display");
  if (!resultsDisplay) {
    resultsDisplay = document.createElement("div");
    resultsDisplay.id = "search-results-display";
    resultsDisplay.className = "search-results-display";

    // Insert after search section
    const searchSection = document.querySelector(".search-section");
    if (searchSection) {
      searchSection.parentNode.insertBefore(
        resultsDisplay,
        searchSection.nextSibling
      );
    }
  }

  // Build results text
  let resultsText = "";
  let hasActiveSearch = searchTerm || hasActiveFilters(filters);

  if (hasActiveSearch) {
    resultsText = `Tìm thấy ${visibleCount} / ${totalCount} phim`;
    if (searchTerm) {
      resultsText += ` cho "${searchTerm}"`;
    }
    if (filters.genre) {
      resultsText += ` • Thể loại: ${filters.genre}`;
    }
    if (filters.year) {
      resultsText += ` • Năm: ${filters.year}`;
    }
  } else {
    resultsText = `Hiển thị tất cả ${totalCount} phim`;
  }

  resultsDisplay.innerHTML = `
    <div class="search-results-info">
      <span>${resultsText}</span>
      ${
        hasActiveSearch
          ? `<button onclick="clearFilters()" class="clear-search-btn">Xóa bộ lọc</button>`
          : ""
      }
    </div>
  `;
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Search button event listener
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }

  // Search input Enter key event listener
  const searchInput = document.getElementById("global-search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  // Add event listeners for real-time filtering
  const filterInputs = ["genre-filter", "year-filter"];
  filterInputs.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", function () {
        const searchTerm = document
          .getElementById("global-search-input")
          .value.trim();
        const filters = getActiveFilters();
        filterMovies(searchTerm, filters);
      });
    }
  });
});
