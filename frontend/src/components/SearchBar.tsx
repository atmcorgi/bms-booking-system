import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/apiClient";

interface SearchBarProps {
  onSearch: (
    searchTerm: string,
    filters: { genre: string; year: string }
  ) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);

  // Fetch genres
  const { data: genres = [], isLoading: loadingGenres } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await api.get("/movies/api/genres");
      return res.data;
    },
  });

  // Handle search
  const handleSearch = () => {
    onSearch(searchTerm, { genre: selectedGenre, year: selectedYear });
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle year button click
  const handleYearClick = (year: string) => {
    setSelectedYear(year);
    // Trigger search immediately with the new year
    onSearch(searchTerm, { genre: selectedGenre, year: year });
  };

  // Handle genre selection
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setIsGenreDropdownOpen(false);
    handleSearch();
  };

  return (
    <div className="search-section">
      <div className="container">
        <div className="search-container">
          <div className="filter-side">
            <div className="filter-group">
              <div className="custom-dropdown">
                <div
                  className="dropdown-trigger"
                  onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                >
                  <span className="dropdown-text">
                    {selectedGenre || "Tất cả thể loại"}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </div>
                {isGenreDropdownOpen && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => handleGenreSelect("")}
                    >
                      Tất cả thể loại
                    </div>
                    {loadingGenres ? (
                      <div
                        className="dropdown-item"
                        style={{ color: "#666", fontStyle: "italic" }}
                      >
                        Đang tải...
                      </div>
                    ) : (
                      genres &&
                      Array.isArray(genres) &&
                      genres.map((genre: string, index: number) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => handleGenreSelect(genre)}
                        >
                          {genre}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <div className="year-filter-container">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Nhập nhiều năm, ví dụ: 2023,2024"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="year-quick-filters">
                  <button
                    type="button"
                    className={`year-btn ${selectedYear === "" ? "active" : ""}`}
                    onClick={() => handleYearClick("")}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    className={`year-btn ${selectedYear === "2025" ? "active" : ""}`}
                    onClick={() => handleYearClick("2025")}
                  >
                    2025
                  </button>
                  <button
                    type="button"
                    className={`year-btn ${selectedYear === "2024" ? "active" : ""}`}
                    onClick={() => handleYearClick("2024")}
                  >
                    2024
                  </button>
                  <button
                    type="button"
                    className={`year-btn ${selectedYear === "2023" ? "active" : ""}`}
                    onClick={() => handleYearClick("2023")}
                  >
                    2023
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="search-side">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="search-btn" onClick={handleSearch}>
                <span className="search-icon">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
