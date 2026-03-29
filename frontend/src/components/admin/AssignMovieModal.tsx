import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { adminMovieAssignmentApi } from "../../services/adminMovieAssignmentApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faSpinner, faClock, faCheck } from "@fortawesome/free-solid-svg-icons";

interface AssignMovieModalProps {
  theaterId: number;
  onClose: () => void;
}

const AssignMovieModal: React.FC<AssignMovieModalProps> = ({
  theaterId,
  onClose,
}) => {
  const qc = useQueryClient();
  const [movieSearch, setMovieSearch] = useState("");
  const [debouncedMovieSearch, setDebouncedMovieSearch] = useState("");
  const [moviePage, setMoviePage] = useState(0);
  
  // Changed from single selectedMovie to Set of IDs
  const [selectedMovieIds, setSelectedMovieIds] = useState<Set<number>>(new Set());

  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");
  const [formats, setFormats] = useState("");
  const [languages, setLanguages] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMovieSearch(movieSearch);
      setMoviePage(0); // Reset page on search
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [movieSearch]);

  const { data: moviesData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["available-movies-modal", theaterId, debouncedMovieSearch, moviePage],
    queryFn: () =>
      adminMovieAssignmentApi.getAvailableMovies(theaterId, {
        q: debouncedMovieSearch,
        page: moviePage,
        size: 10, // Increased size for better bulk selection
      }),
  });


  const assignMovieMutation = useMutation({
    mutationFn: (payload: {
      movieCodes: string[];

      activeFrom?: string;
      activeTo?: string;
      formats?: string;
      languages?: string;
    }) => {
      return adminMovieAssignmentApi.assignBulk(theaterId, payload);
    },
    onSuccess: () => {

      qc.invalidateQueries({ queryKey: ["theater-movies", theaterId] });
      // Determine success count to show a nice alert or just close
      onClose();
    },
  });

  // Helper to safely get movies
  const movies = Array.isArray(moviesData?.data?.items)
    ? moviesData.data.items
    : [];

  const [selectedMoviesMap, setSelectedMoviesMap] = useState<Map<number, any>>(new Map());

  // Update map when movies are loaded to ensure we have data for current page
  useEffect(() => {
    if (movies.length > 0) {
      // We could sync here if needed, but for now we trust user selection
    }
  }, [movies]);

  const toggleMovie = (movie: any) => {
    const nextIds = new Set(selectedMovieIds);
    const nextMap = new Map(selectedMoviesMap);

    if (nextIds.has(movie.id)) {
      nextIds.delete(movie.id);
      nextMap.delete(movie.id);
    } else {
      nextIds.add(movie.id);
      nextMap.set(movie.id, movie);
    }
    setSelectedMovieIds(nextIds);
    setSelectedMoviesMap(nextMap);
  };

  const submitBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMovieIds.size === 0) return;

    const codes = Array.from(selectedMoviesMap.values()).map((m: any) => m.code);
    
    assignMovieMutation.mutate({
      movieCodes: codes,
      activeFrom: activeFrom || undefined,
      activeTo: activeTo || undefined,
      formats: formats || undefined,
      languages: languages || undefined,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "1200px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            <FontAwesomeIcon icon={faFilm} style={{ marginRight: "8px" }} /> Gán
            phim mới cho rạp
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "4px 8px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{ display: "flex", gap: "32px", flex: 1, overflow: "hidden" }}
        >
          {/* Movie List Section */}
          <div
            style={{
              flex: "0 0 55%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                fontSize: "16px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: "28px",
                    height: "28px",
                    background: "#6366f1",
                    color: "#fff",
                    borderRadius: "50%",
                    textAlign: "center",
                    lineHeight: "28px",
                    marginRight: "8px",
                  }}
                >
                  1
                </span>
                Chọn phim ({selectedMovieIds.size})
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    const nextIds = new Set(selectedMovieIds);
                    const nextMap = new Map(selectedMoviesMap);
                    movies.forEach((m: any) => {
                      nextIds.add(m.id);
                      nextMap.set(m.id, m);
                    });
                    setSelectedMovieIds(nextIds);
                    setSelectedMoviesMap(nextMap);
                  }}
                  style={{
                    fontSize: '13px',
                    color: '#6366f1',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Chọn tất cả trang này
                </button>
                {selectedMovieIds.size > 0 && (
                  <button
                     type="button"
                     onClick={() => {
                       setSelectedMovieIds(new Set());
                       setSelectedMoviesMap(new Map());
                     }}
                     style={{
                       fontSize: '13px',
                       color: '#ef4444',
                       background: 'none',
                       border: 'none',
                       cursor: 'pointer',
                       textDecoration: 'underline'
                     }}
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>
            </h4>
            <input
              type="text"
              placeholder="Tìm kiếm phim theo tên hoặc mã..."
              value={movieSearch}
              onChange={(e) => setMovieSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#f9fafb",
              }}
            >
              {isLoadingMovies && (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                    <FontAwesomeIcon icon={faSpinner} spin />
                  </div>
                  <p>Đang tải phim...</p>
                </div>
              )}
              {!isLoadingMovies && movies.length === 0 && (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                    <FontAwesomeIcon icon={faFilm} />
                  </div>
                  <p>Không tìm thấy phim nào.</p>
                </div>
              )}
              {!isLoadingMovies &&
                movies.length > 0 &&
                movies.map((movie: any) => {
                   const isSelected = selectedMovieIds.has(movie.id);
                   return (
                  <div
                    key={movie.id}
                    onClick={() => toggleMovie(movie)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #e2e8f0",
                      cursor: "pointer",
                      background: isSelected ? "#eef2ff" : "#fff",
                      display: "flex",
                      gap: "16px",
                      transition: "all 0.2s",
                      borderLeft: isSelected
                          ? "4px solid #6366f1"
                          : "4px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "#f9fafb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        readOnly 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      style={{
                        width: 50,
                        height: 75,
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#1f2937",
                          marginBottom: "2px",
                        }}
                      >
                        {movie.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Mã: {movie.code}
                      </div>
                      {movie.duration && (
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          <FontAwesomeIcon icon={faClock} /> {movie.duration}{" "}
                          phút
                        </div>
                      )}
                    </div>
                  </div>
                )})}
            </div>
            {moviesData?.data && typeof moviesData.data.page === "number" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "8px",
                  fontSize: "12px",
                  gap: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setMoviePage((p) => Math.max(0, p - 1))}
                  disabled={moviesData.data.page === 0}
                  style={{
                    padding: "4px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: "#fff",
                    cursor: moviesData.data.page === 0 ? "not-allowed" : "pointer",
                    opacity: moviesData.data.page === 0 ? 0.5 : 1
                  }}
                >
                  Trước
                </button>
                <span>
                  Trang {moviesData.data.page + 1} /{" "}
                  {moviesData.data.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setMoviePage((p) => p + 1)}
                  disabled={
                    moviesData.data.page >= moviesData.data.totalPages - 1
                  }
                  style={{
                    padding: "4px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: "#fff",
                    cursor: moviesData.data.page >= moviesData.data.totalPages - 1 ? "not-allowed" : "pointer",
                    opacity: moviesData.data.page >= moviesData.data.totalPages - 1 ? 0.5 : 1
                  }}
                >
                  Sau
                </button>
              </div>
            )}
            </div>

          {/* Form Section */}
          <div
            style={{
              flex: "0 0 40%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden", // Added to contain scroll
            }}
          >
            <h4
              style={{
                marginTop: 0,
                fontSize: "16px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "28px",
                  height: "28px",
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: "50%",
                  textAlign: "center",
                  lineHeight: "28px",
                  marginRight: "8px",
                }}
              >
                2
              </span>
              Chi tiết gán
            </h4>
            {selectedMovieIds.size > 0 ? (
              <form
                onSubmit={submitBulk}
                style={{ 
                  flex: 1, 
                  display: "flex", 
                  flexDirection: "column",
                  overflowY: "auto", // Added vertical scroll
                  paddingRight: "4px" // Avoid buffer with scrollbar
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#16a34a",
                      fontWeight: "600",
                      marginBottom: "4px",
                      display: "flex", 
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Đã chọn {selectedMovieIds.size} phim
                  </div>
                  <div
                     style={{
                       maxHeight: "100px",
                       overflowY: "auto",
                       fontSize: "13px",
                       marginTop: "8px",
                       borderTop: "1px dashed #bbf7d0",
                       paddingTop: "6px"
                     }}
                  >
                    {Array.from(selectedMoviesMap.values()).map(m => (
                       <div key={m.id} style={{ marginBottom: "2px", color: "#15803d" }}>• {m.title}</div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={activeFrom}
                    onChange={(e) => setActiveFrom(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={activeTo}
                    onChange={(e) => setActiveTo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    Định dạng
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 2D,3D"
                    value={formats}
                    onChange={(e) => setFormats(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    Ngôn ngữ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: VI,EN"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="fd-btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="fd-btn"
                    style={{ marginTop: 0 }}
                    disabled={assignMovieMutation.isPending}
                  >
                    {assignMovieMutation.isPending ? "Đang gán..." : `Gán ${selectedMovieIds.size} phim`}
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "2px dashed #d1d5db",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>←</div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                  }}
                >
                  Vui lòng chọn phim từ danh sách bên trái
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignMovieModal;
