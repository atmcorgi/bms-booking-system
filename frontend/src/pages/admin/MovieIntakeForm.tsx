import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { adminMovieApi } from "../../services/adminMovieApi";
import { adminGenreApi } from "../../services/adminGenreApi";
import api from "../../services/apiClient";
import ErrorModal from "../../components/shared/ErrorModal";
import "../../styles/admin-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faCalendarAlt,
  faTheaterMasks,
  faFilm,
  faUpload,
  faSpinner,
  faEdit,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

export default function MovieIntakeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id) && location.pathname.includes("/edit");
  const isViewMode = Boolean(id) && location.pathname.includes("/view");
  const isCreateMode = !id || location.pathname.includes("/create");
  const [form, setForm] = useState<any>({
    title: "",
    code: "",
    duration: 120,
    releaseDate: "",
    description: "",
    director: "",
    actors: "",
    ageRating: "",
    formats: "",
    languages: "",
    genres: [] as string[],
    posterUrl: "",
    trailerUrl: "",
    youtubeUrl: "",
  });
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingTrailer, setUploadingTrailer] = useState(false);
  const [newGenre, setNewGenre] = useState("");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Thông báo" });

  useEffect(() => {
    // Load genres (names)
    adminGenreApi.list({ page: 0, size: 100 }).then((res) => {
      const items = res.data.items || [];
      setAllGenres(items.map((g: any) => g.name));
    });

    // Load movie data if in edit or view mode
    if ((isEditMode || isViewMode) && id) {
      adminMovieApi
        .getById(id)
        .then((res) => {
          const movie = res.data;
          setForm({
            title: movie.title || "",
            code: movie.code || "",
            duration: movie.duration || 120,
            releaseDate: movie.releaseDate || "",
            description: movie.description || "",
            director: movie.director || "",
            actors: movie.actors || "",
            ageRating: movie.ageRating || "",
            formats: movie.formats || "",
            languages: movie.languages || "",
            genres: movie.genres || [],
            posterUrl: movie.posterUrl || "",
            trailerUrl: movie.trailerUrl || "",
            youtubeUrl: movie.youtubeUrl || "",
          });
        })
        .catch((error) => {
          console.error("Error loading movie:", error);
          setErrorModal({
            show: true,
            title: "Lỗi",
            message: "Lỗi tải dữ liệu phim: " + (error.response?.data?.message || error.message)
          });
        });
    }
  }, [isEditMode, id]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowGenreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && id) {
        await adminMovieApi.update(id, form);
      } else {
        await adminMovieApi.create(form);
      }
      navigate("/admin/movies", { replace: true });
    } catch (error: any) {
      console.error("Error saving movie:", error);
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Lỗi lưu phim: " + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "File poster quá lớn! Vui lòng chọn file nhỏ hơn 5MB."
      });
      e.target.value = ""; // Clear the input
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Chỉ chấp nhận file ảnh (JPG, PNG, WebP)!"
      });
      e.target.value = ""; // Clear the input
      return;
    }

    setUploadingPoster(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("movieTitle", form.title || file.name);
      const res = await api.post("/api/images/upload-poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f: any) => ({ ...f, posterUrl: res.data.url }));
    } catch (error: any) {
      console.error("Upload poster error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Lỗi upload poster";
      if (error.response?.status === 413) {
        errorMessage = "File poster quá lớn! Vui lòng chọn file nhỏ hơn 5MB.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message;
      }

      setErrorModal({
        show: true,
        title: "Lỗi",
        message: errorMessage
      });
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleTrailerChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for video)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "File trailer quá lớn! Vui lòng chọn file nhỏ hơn 50MB."
      });
      e.target.value = ""; // Clear the input
      return;
    }

    // Validate file type
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Chỉ chấp nhận file video (MP4, WebM, OGG, AVI, MOV)!"
      });
      e.target.value = ""; // Clear the input
      return;
    }

    setUploadingTrailer(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("movieTitle", form.title || file.name);
      const res = await api.post("/api/images/upload-trailer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f: any) => ({ ...f, trailerUrl: res.data.url }));
    } catch (error: any) {
      console.error("Upload trailer error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Lỗi upload trailer";
      if (error.response?.status === 413) {
        errorMessage = "File trailer quá lớn! Vui lòng chọn file nhỏ hơn 50MB.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message;
      }

      setErrorModal({
        show: true,
        title: "Lỗi",
        message: errorMessage
      });
    } finally {
      setUploadingTrailer(false);
    }
  };

  return (
    <div style={{ padding: "0", maxWidth: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          padding: "12px",
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Toolbar */}
        <div className="admin-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => navigate("/admin/movies")}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background: "#ffffff",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              ← Quay lại
            </button>
            <h3
              style={{
                margin: 0,
                lineHeight: 1,
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              {isViewMode
                ? "Xem chi tiết phim"
                : isEditMode
                  ? "Chỉnh sửa phim"
                  : "Thêm phim mới"}
            </h3>
          </div>
        </div>

        {/* Form Container */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "24px",
            marginTop: "12px",
            margin: "12px auto 0",
          }}
        >
          <form onSubmit={onSubmit}>
            {/* Thông Tin Cơ Bản */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: "8px" }} /> Thông Tin Cơ Bản
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Mã phim *
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    placeholder="Nhập mã phim..."
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Tiêu đề phim *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                    placeholder="Nhập tiêu đề phim..."
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: Number(e.target.value) })
                    }
                    placeholder="120"
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                
                {/* Movie Description */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginTop: "8px"
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Mô tả phim
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Nhập mô tả phim..."
                    readOnly={isViewMode}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Thông Tin Bổ Sung */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "8px" }} /> Thông Tin Bổ Sung
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Ngày phát hành
                  </label>
                  <input
                    type="date"
                    value={form.releaseDate}
                    onChange={(e) =>
                      setForm({ ...form, releaseDate: e.target.value })
                    }
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Độ tuổi
                  </label>
                  <input
                    value={form.ageRating}
                    onChange={(e) =>
                      setForm({ ...form, ageRating: e.target.value })
                    }
                    placeholder="K, 13, 16, 18..."
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Định dạng (2D, 3D, IMAX...)
                  </label>
                  <input
                    value={form.formats}
                    onChange={(e) =>
                      setForm({ ...form, formats: e.target.value })
                    }
                    placeholder="2D, 3D, IMAX..."
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Ngôn ngữ (Lồng tiếng, Phụ đề...)
                  </label>
                  <input
                    value={form.languages}
                    onChange={(e) =>
                      setForm({ ...form, languages: e.target.value })
                    }
                    placeholder="Tiếng Việt, Phụ đề Tiếng Anh..."
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Thông Tin Nghệ Thuật */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                <FontAwesomeIcon icon={faTheaterMasks} style={{ marginRight: "8px" }} /> Thông Tin Nghệ Thuật
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Đạo diễn
                  </label>
                  <input
                    value={form.director}
                    onChange={(e) =>
                      setForm({ ...form, director: e.target.value })
                    }
                    placeholder="Nhập tên đạo diễn..."
                    readOnly={isViewMode}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                    }}
                  />
                </div>
                
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginTop: "8px"
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Diễn viên
                  </label>
                  <textarea
                    value={form.actors}
                    onChange={(e) => setForm({ ...form, actors: e.target.value })}
                    placeholder="Nhập tên dàn diễn viên..."
                    readOnly={isViewMode}
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      color: "#1f2937",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Thể loại
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      padding: "8px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      background: isViewMode ? "#f8fafc" : "#fff",
                      minHeight: "42px",
                    }}
                  >
                    {(form.genres || []).map((genre: string) => (
                      <span
                        key={genre}
                        style={{
                          padding: "4px 8px",
                          background: "#6366f1",
                          color: "#fff",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {genre}
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm((f: any) => ({
                                ...f,
                                genres: f.genres.filter(
                                  (g: string) => g !== genre
                                ),
                              }));
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#fff",
                              cursor: "pointer",
                              fontSize: "10px",
                              padding: "0",
                              marginLeft: "4px",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {!isViewMode && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        {/* Custom Dropdown Button */}
                        <div ref={dropdownRef} style={{ position: "relative" }}>
                          <button
                            type="button"
                            onClick={() =>
                              setShowGenreDropdown(!showGenreDropdown)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "4px",
                              background: "#fff",
                              fontSize: "12px",
                              color: "#64748b",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#6366f1";
                              e.currentTarget.style.color = "#6366f1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.color = "#64748b";
                            }}
                          >
                            <span>+ Thêm thể loại</span>
                            <span style={{ fontSize: "10px" }}>
                              {showGenreDropdown ? "▲" : "▼"}
                            </span>
                          </button>

                          {/* Custom Dropdown Menu */}
                          {showGenreDropdown && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                zIndex: 1000,
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              {allGenres
                                .filter((genre) => !(form.genres || []).includes(genre))
                                .map((genre) => (
                                  <button
                                    key={genre}
                                    type="button"
                                    onClick={() => {
                                      setForm((f: any) => ({
                                        ...f,
                                        genres: [...f.genres, genre],
                                      }));
                                      setShowGenreDropdown(false);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "8px 12px",
                                      border: "none",
                                      background: "transparent",
                                      fontSize: "12px",
                                      color: "#374151",
                                      cursor: "pointer",
                                      textAlign: "left",
                                      transition: "background 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background =
                                        "#f8fafc";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background =
                                        "transparent";
                                    }}
                                  >
                                    {genre}
                                  </button>
                                ))}
                              {(allGenres || []).filter(
                                (genre) => !(form.genres || []).includes(genre)
                              ).length === 0 && (
                                <div
                                  style={{
                                    padding: "8px 12px",
                                    fontSize: "12px",
                                    color: "#9ca3af",
                                    textAlign: "center",
                                  }}
                                >
                                  Không có thể loại nào
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Input for new genre */}
                        <input
                          type="text"
                          placeholder="Tạo thể loại mới..."
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          onKeyPress={async (e) => {
                            if (e.key === "Enter" && newGenre.trim()) {
                              e.preventDefault();
                              const genreName = newGenre.trim();
                              
                              // Check if genre already exists
                              if (
                                (form.genres || []).includes(genreName) ||
                                (allGenres || []).includes(genreName)
                              ) {
                                setErrorModal({ 
                                  show: true, 
                                  title: "Thông báo",
                                  message: "Thể loại này đã tồn tại!" 
                                });
                                return;
                              }

                              try {
                                // Create genre in database
                                await adminGenreApi.create({ name: genreName, description: "" });
                                
                                // Add to form and local list
                                setForm((f: any) => ({
                                  ...f,
                                  genres: [...f.genres, genreName],
                                }));
                                setAllGenres((prev) => [...prev, genreName]);
                                setNewGenre("");
                                
                                setErrorModal({ 
                                  show: true, 
                                  title: "Thành công",
                                  message: `Đã tạo thể loại "${genreName}" thành công!` 
                                });
                              } catch (error: any) {
                                setErrorModal({ 
                                  show: true, 
                                  title: "Lỗi",
                                  message: error?.response?.data?.message || "Có lỗi khi tạo thể loại. Có thể tên đã tồn tại." 
                                });
                              }
                            }
                          }}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            color: "#374151",
                            outline: "none",
                            minWidth: "120px",
                            background: "#fff",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#6366f1";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e2e8f0";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Poster và Button */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                <FontAwesomeIcon icon={faFilm} style={{ marginRight: "8px" }} /> Poster và Trailer
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {form.posterUrl ? (
                    <img
                      src={form.posterUrl}
                      alt="Poster"
                      style={{
                        width: "200px",
                        height: "auto",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "200px",
                        height: "280px",
                        border: "2px dashed #e2e8f0",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafc",
                        color: "#64748b",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      {isViewMode ? "Chưa có poster" : "Chưa upload poster"}
                    </div>
                  )}
                  {!isViewMode && (
                    <div style={{ marginTop: "12px" }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePosterChange}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        Chấp nhận: JPG, PNG, WebP (tối đa 5MB)
                      </div>
                      {uploadingPoster && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6366f1",
                            marginTop: "4px",
                          }}
                        >
                          <FontAwesomeIcon icon={faUpload} spin /> Đang upload...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Trailer phim
                    </label>
                    {form.trailerUrl ? (
                      <video
                        src={form.trailerUrl}
                        controls
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          height: "200px",
                          border: "2px dashed #e2e8f0",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f8fafc",
                          color: "#64748b",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        {isViewMode ? "Chưa có trailer" : "Chưa upload trailer"}
                      </div>
                    )}
                    {!isViewMode && (
                      <div style={{ marginTop: "12px" }}>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
                          onChange={handleTrailerChange}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#64748b",
                            marginTop: "4px",
                          }}
                        >
                          Chấp nhận: MP4, WebM, OGG, AVI, MOV (tối đa 50MB)
                        </div>
                        {uploadingTrailer && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6366f1",
                              marginTop: "4px",
                            }}
                          >
                            <FontAwesomeIcon icon={faUpload} spin /> Đang upload trailer...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* YouTube URL */}
                  <div style={{ marginTop: "16px" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      YouTube URL (Iframe fallback)
                    </label>
                    <input
                      type="text"
                      value={form.youtubeUrl}
                      onChange={(e) =>
                        setForm({ ...form, youtubeUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      readOnly={isViewMode}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        background: isViewMode ? "#f8fafc" : "#fff",
                        color: "#1f2937",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              {isViewMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/movies")}
                    style={{
                      padding: "10px 20px",
                      background: "#fff",
                      color: "#64748b",
                      border: "1px solid #64748b",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#64748b";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#64748b";
                    }}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/movies/${id}/edit`)}
                    style={{
                      padding: "10px 20px",
                      background: "#fff",
                      color: "#6366f1",
                      border: "1px solid #6366f1",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#6366f1";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#6366f1";
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/movies")}
                    style={{
                      padding: "10px 20px",
                      background: "#fff",
                      color: "#64748b",
                      border: "1px solid #64748b",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#64748b";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#64748b";
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      background: "#fff",
                      color: "#059669",
                      border: "1px solid #059669",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: loading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = "#059669";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#059669";
                      }
                    }}
                  >
                    {loading
                      ? (<><FontAwesomeIcon icon={faSpinner} spin /> Đang lưu...</>)
                      : isEditMode
                        ? (<><FontAwesomeIcon icon={faSave} /> Cập nhật phim</>)
                        : isCreateMode
                          ? (<><FontAwesomeIcon icon={faSave} /> Thêm phim mới</>)
                          : (<><FontAwesomeIcon icon={faSave} /> Lưu phim</>)}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Thông báo" })}
      />
    </div>
  );
}
