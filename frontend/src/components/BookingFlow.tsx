import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../services/bookingApi";
import { profileApi } from "../services/profileApi";
import api from "../services/apiClient";
import ErrorModal from "./shared/ErrorModal";

export default function BookingFlow({
  movieId: propMovieId,
  theaterId: initialTheaterId,
}: {
  movieId?: string | number;
  theaterId?: string | null;
}) {
  const navigate = useNavigate();
  const { movieId: routeMovieId } = useParams();

  // Determine the effective movieId
  const movieId = propMovieId || routeMovieId;

  const isTheaterFirst = !movieId || movieId === "theater" || !!initialTheaterId;
  const [provinceId, setProvinceId] = useState<string | number | undefined>();
  const [districtId, setDistrictId] = useState<string | number | undefined>();
  const [theaterId, setTheaterId] = useState<string | number | undefined>();
  const [selectedMovieId, setSelectedMovieId] = useState<
    string | number | undefined
  >();
  const [showDate, setShowDate] = useState<string | undefined>();
  const [showtimeId, setShowtimeId] = useState<string | number | undefined>();
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string | number>>(
    new Set()
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [currentPaymentCode, setCurrentPaymentCode] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [paymentTimedOut, setPaymentTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Lỗi" });

  // Refs để tránh dependency loop
  const prevProvinceId = useRef<string | number | undefined>(undefined);
  const prevDistrictId = useRef<string | number | undefined>(undefined);
  const prevTheaterId = useRef<string | number | undefined>(undefined);
  const prevShowDate = useRef<string | undefined>(undefined);

  // Memoize query keys để tránh re-render
  const provincesQueryKey = useMemo(() => ["booking/locations"], []);
  const districtsQueryKey = useMemo(
    () => ["booking/districts", provinceId],
    [provinceId]
  );
  const theatersQueryKey = useMemo(
    () => ["booking/theaters", provinceId, districtId],
    [provinceId, districtId]
  );
  const showdatesQueryKey = useMemo(
    () => ["booking/showdates", theaterId],
    [theaterId]
  );
  const showtimesQueryKey = useMemo(
    () => ["booking/showtimes", theaterId, showDate],
    [theaterId, showDate]
  );
  const seatsQueryKey = useMemo(
    () => ["booking/seats", showtimeId],
    [showtimeId]
  );

  // Set theaterId from URL parameter
  useEffect(() => {
    if (initialTheaterId) {
      setTheaterId(initialTheaterId);
    }
  }, [initialTheaterId]);

  // Fetch movie details (only when movieId is provided and not from theater selection)
  const { data: movie } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: async () => {
      if (!movieId || movieId === "theater") return null;
      const response = await api.get(`/api/movies/${movieId}`);
      return response.data;
    },
    enabled: !!movieId && movieId !== "theater",
  });

  // Fetch user profile to auto-fill customer info
  const { data: userProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      try {
        const response = await profileApi.getProfile();
        return response.data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  // Auto-fill customer info from profile when available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) {
        setCustomerName(userProfile.fullName);
      }
      if (userProfile.phone) {
        setCustomerPhone(userProfile.phone);
      }
      if (userProfile.email) {
        setCustomerEmail(userProfile.email);
      }
    }
  }, [userProfile]);

  const {
    data: provinces,
    isLoading: loadingProvinces,
    isError: errorProvinces,
  } = useQuery({
    queryKey: provincesQueryKey,
    queryFn: async () =>
      (
        await bookingApi.getLocations({
          movieId: movieId === "theater" ? undefined : movieId,
          showDate,
        })
      ).data,
    placeholderData: (prev) => prev,
    enabled: !initialTheaterId, // Don't fetch provinces when theater is pre-selected
  });

  const {
    data: districts,
    isLoading: loadingDistricts,
    isError: errorDistricts,
  } = useQuery({
    queryKey: districtsQueryKey,
    enabled: !!provinceId && !initialTheaterId,
    queryFn: async () =>
      (
        await bookingApi.getDistricts({
          provinceId: provinceId!,
          movieId: movieId === "theater" ? undefined : movieId,
          showDate,
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  const {
    data: theaters,
    isLoading: loadingTheaters,
    isError: errorTheaters,
  } = useQuery({
    queryKey: theatersQueryKey,
    enabled: !!provinceId && !!districtId && !initialTheaterId,
    queryFn: async () =>
      (
        await bookingApi.getTheaters({
          provinceId: provinceId!,
          districtId: districtId!,
          movieId: movieId === "theater" ? undefined : movieId,
          showDate,
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  // Fetch movies in theater when theater is pre-selected
  const {
    data: theaterMovies,
    isLoading: loadingTheaterMovies,
    isError: errorTheaterMovies,
  } = useQuery({
    queryKey: ["theater-movies", theaterId],
    enabled: !!theaterId && !movieId,
    queryFn: async () => {
      const response = await api.get(
        `/booking/api/movies?theaterId=${theaterId}`
      );
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Use selectedMovieId or movieId from URL (but not "theater")
  const currentMovieId =
    selectedMovieId || (movieId === "theater" ? undefined : movieId);

  const {
    data: showdates,
    isLoading: loadingShowdates,
    isError: errorShowdates,
  } = useQuery({
    queryKey: showdatesQueryKey,
    enabled: !!theaterId && !!currentMovieId,
    queryFn: async () =>
      (
        await bookingApi.getShowDates({
          theaterId: theaterId!,
          movieId: currentMovieId,
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  const {
    data: showtimes,
    isLoading: loadingShowtimes,
    isError: errorShowtimes,
  } = useQuery({
    queryKey: showtimesQueryKey,
    enabled: !!theaterId && !!showDate && !!currentMovieId,
    queryFn: async () =>
      (
        await bookingApi.getShowtimes({
          theaterId: theaterId!,
          movieId: currentMovieId,
          showDate,
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  const {
    data: seats,
    isLoading: loadingSeats,
    isError: errorSeats,
    refetch: refetchSeats,
  } = useQuery({
    queryKey: seatsQueryKey,
    enabled: !!showtimeId,
    queryFn: async () =>
      (await bookingApi.getSeats({ theaterId: theaterId!, showtimeId })).data,
    refetchInterval: 5000,
    placeholderData: (prev) => prev,
  });
  const provincesList = Array.isArray(provinces) ? provinces : [];
  const districtsList = Array.isArray(districts) ? districts : [];
  const theatersList = Array.isArray(theaters) ? theaters : [];
  const showdatesList = Array.isArray(showdates) ? showdates : [];
  const showtimesList = Array.isArray(showtimes) ? showtimes : [];
  const seatsList = Array.isArray(seats) ? seats : [];

  const sortedSeats = useMemo(() => {
    return [...seatsList].sort((a: any, b: any) => {
      const regex = /([A-Za-z]+)(\d+)/;
      const matchA = a.seatNumber.match(regex);
      const matchB = b.seatNumber.match(regex);
      
      if (!matchA || !matchB) return a.seatNumber.localeCompare(b.seatNumber);

      const [, rowA, numA] = matchA;
      const [, rowB, numB] = matchB;

      if (rowA !== rowB) return rowA.localeCompare(rowB);
      return parseInt(numA, 10) - parseInt(numB, 10);
    });
  }, [seatsList]);

  const getSeatClass = (seat: any) => {
      const type = (seat.seatType || "").toUpperCase();
      if (type === "COUPLE") return "seat-type-couple";
      if (type === "VIP") return "seat-type-vip";
      return "seat-type-standard";
  };

  // Reset local selection when showtime changes or seats refetch
  useEffect(() => {
    setSelectedSeatIds(new Set());
    setShowPaymentForm(false);
  }, [showtimeId]);


  function getDateLabel(dateStr: string) {
    // Expecting YYYY-MM-DD
    const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dow = days[dt.getDay()];
    const dd = String(d || dt.getDate()).padStart(2, "0");
    const mm = String(m || dt.getMonth() + 1).padStart(2, "0");
    return { dow, dmy: `${dd}/${mm}` };
  }

  // Group showtimes by time-of-day (Sáng/Chiều/Tối/Đêm) to match old UI
  function getTimeBucketLabel(timeStr?: string) {
    if (!timeStr) return "Khác";
    const [hh] = timeStr.split(":").map((v) => parseInt(v, 10));
    if (isNaN(hh)) return "Khác";
    if (hh >= 6 && hh < 12) return "Sáng"; // 06:00 - 11:59
    if (hh >= 12 && hh < 17) return "Chiều"; // 12:00 - 16:59
    if (hh >= 17 && hh < 22) return "Tối"; // 17:00 - 21:59
    return "Đêm"; // 22:00 - 05:59
  }

  const bucketsOrder = ["Sáng", "Chiều", "Tối", "Đêm", "Khác"];
  const showtimesByBucket: Record<string, any[]> = showtimesList.reduce(
    (acc: Record<string, any[]>, s: any) => {
      const bucket = getTimeBucketLabel(s.showTime);
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket].push(s);
      return acc;
    },
    {}
  );

  const selectedShowtime = useMemo(() => {
    const found = showtimesList.find(
      (s: any) => String(s.id) === String(showtimeId)
    );
    return found;
  }, [showtimesList, showtimeId]);

  const handlePayment = async () => {
    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      selectedSeatIds.size === 0 ||
      !showtimeId
    ) {
      setErrorModal({
        show: true,
        title: "Thông báo",
        message: "Vui lòng điền đầy đủ thông tin"
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Tạo booking request
      const bookingData = {
        showtimeId: showtimeId,
        seatIds: Array.from(selectedSeatIds),
        customerName: customerName,
        customerPhone: customerPhone,
        email: customerEmail,
      };

      // Creating booking with validated data
      // Gọi API tạo booking và thanh toán VNPay
      const response = await bookingApi.createBooking(bookingData);
      // Booking created successfully

      if (response.data && response.data.paymentUrl) {
        // Calculate total amount
        const total = [...selectedSeatIds].reduce((sum: number, seatId) => {
          const seat = seatsList.find((s: any) => String(s.id) === String(seatId));
          if (!seat || !selectedShowtime) return sum;
          const seatType = (seat.seatType || "").toUpperCase();
          const typeMultiplier = seatType === "COUPLE" ? 2 : 1;
          const basePrice = seatType === "VIP" ? selectedShowtime.priceVip || 0 : selectedShowtime.priceStandard || 0;
          return sum + Math.round(Number(basePrice) * typeMultiplier);
        }, 0);
        
        // Mở modal QR thay vì redirect đi nơi khác
        setQrUrl(response.data.paymentUrl);
        setCurrentPaymentCode(response.data.paymentCode);
        setPaymentAmount(total);
        setTimeRemaining(900);
        setPaymentTimedOut(false);
        setShowQRModal(true);
        
        // Bắt đầu polling
        startPolling(response.data.paymentCode);
      } else {
        setErrorModal({
          show: true,
          title: "Lỗi",
          message: "Có lỗi xảy ra khi tạo thanh toán"
        });
      }
    } catch (error) {
      // Handle payment error
      setError("Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.");
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Có lỗi xảy ra khi thanh toán. Vui lòng thử lại."
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const startPolling = (paymentCode: string) => {
    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    const startTime = Date.now();
    
    const pollingInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((TIMEOUT_MS - elapsed) / 1000));
      setTimeRemaining(remaining);
      
      // Check timeout
      if (elapsed >= TIMEOUT_MS) {
        clearInterval(pollingInterval);
        clearInterval(timerInterval);
        setPaymentTimedOut(true);
        return;
      }
      
      try {
        const res = await api.get(`/api/booking/status/${paymentCode}`);
        if (res.data.status === "PAID") {
          clearInterval(pollingInterval);
          clearInterval(timerInterval);
          setShowQRModal(false);
          // Chuyển đến trang thành công
          navigate(`/booking/success?txnRef=${paymentCode}&bookingIds=${res.data.bookingIds}`);
        } else if (res.data.status === "EXPIRED") {
          clearInterval(pollingInterval);
          clearInterval(timerInterval);
          setPaymentTimedOut(true);
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Continue polling on error
      }
    }, 3000); // Poll mỗi 3 giây
    
    // Update timer every second
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((TIMEOUT_MS - elapsed) / 1000));
      setTimeRemaining(remaining);
    }, 1000);

    // Cleanup intervals if component unmounts
    return () => {
      clearInterval(pollingInterval);
      clearInterval(timerInterval);
    };
  };
  
  const copyPaymentCode = () => {
    navigator.clipboard.writeText(currentPaymentCode);
    // Could add a toast notification here
  };

  // Reset logic với refs để tránh dependency loop
  useEffect(() => {
    if (provinceId !== prevProvinceId.current && provinceId) {
      prevProvinceId.current = provinceId;
      setDistrictId(undefined);
      setTheaterId(undefined);
      setShowDate(undefined);
      setShowtimeId(undefined);
    }
  }, [provinceId]);

  useEffect(() => {
    if (districtId !== prevDistrictId.current && districtId) {
      prevDistrictId.current = districtId;
      setTheaterId(undefined);
      setShowDate(undefined);
      setShowtimeId(undefined);
    }
  }, [districtId]);

  useEffect(() => {
    if (theaterId !== prevTheaterId.current && theaterId) {
      prevTheaterId.current = theaterId;
      setSelectedMovieId(undefined);
      setShowDate(undefined);
      setShowtimeId(undefined);
    }
  }, [theaterId]);

  useEffect(() => {
    if (showDate !== prevShowDate.current && showDate) {
      prevShowDate.current = showDate;
      setShowtimeId(undefined);
    }
  }, [showDate]);

  return (
    <div
      className={`main-content-container booking-flow-container ${
        isTheaterFirst ? "theater-first" : ""
      }`}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {(loadingProvinces ||
        loadingDistricts ||
        loadingTheaters ||
        loadingTheaterMovies ||
        loadingShowdates ||
        loadingShowtimes ||
        loadingSeats) && (
        <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          Đang tải...
        </div>
      )}
      {(errorProvinces ||
        errorDistricts ||
        errorTheaters ||
        errorTheaterMovies ||
        errorShowdates ||
        errorShowtimes ||
        errorSeats) && (
        <div style={{ textAlign: "center", padding: "20px", color: "#e50914" }}>
          Có lỗi khi tải dữ liệu.
        </div>
      )}

      {/* Header and Guideline - Only show for Theater First flow */}
      {isTheaterFirst && (
        <>
          <div className="page-header-container">
            <h2 className="page-header-title">Đặt Vé Theo Rạp</h2>
          </div>

          <div className="booking-guideline">
            <div className="guideline-title">
              <span>ⓘ Hướng dẫn đặt vé</span>
            </div>
            <div className="guideline-steps">
              <div className={`g-step ${!provinceId ? "current" : ""}`}>
                <div className="g-step-number">1</div>
                <span>Chọn Tỉnh/TP</span>
              </div>
              <div className="g-arrow">➜</div>
              <div
                className={`g-step ${provinceId && !districtId ? "current" : ""}`}
              >
                <div className="g-step-number">2</div>
                <span>Chọn Quận/Huyện</span>
              </div>
              <div className="g-arrow">➜</div>
              <div
                className={`g-step ${districtId && !theaterId ? "current" : ""}`}
              >
                <div className="g-step-number">3</div>
                <span>Chọn Rạp</span>
              </div>
              <div className="g-arrow">➜</div>
              <div
                className={`g-step ${
                  theaterId && !selectedMovieId ? "current" : ""
                }`}
              >
                <div className="g-step-number">4</div>
                <span>Chọn Phim</span>
              </div>
              <div className="g-arrow">➜</div>
              <div
                className={`g-step ${
                  selectedMovieId && !showtimeId ? "current" : ""
                }`}
              >
                <div className="g-step-number">5</div>
                <span>Chọn Suất Chiếu</span>
              </div>
              <div className="g-arrow">➜</div>
              <div className={`g-step ${showtimeId ? "current" : ""}`}>
                <div className="g-step-number">6</div>
                <span>Chọn Ghế</span>
              </div>
            </div>
          </div>
        </>
      )}


      {error && (
        <div style={{ textAlign: "center", padding: "12px", color: "#e50914" }}>
          {error}
        </div>
      )}

      {/* Step 1: Select Province - Only show when no theater is pre-selected */}
      {!initialTheaterId && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{ marginBottom: "16px", color: "#2e2b29", fontSize: "18px" }}
          >
            Chọn tỉnh/thành phố:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {provincesList.map((p: any) => (
              <button
                type="button"
                key={p.id}
                className={`step-btn ${provinceId === p.id ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProvinceId(p.id);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select District - Only show when no theater is pre-selected */}
      {provinceId && !initialTheaterId && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{ marginBottom: "16px", color: "#2e2b29", fontSize: "18px" }}
          >
            Chọn quận/huyện:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {districtsList.map((d: any) => (
              <button
                type="button"
                key={d.id}
                className={`step-btn ${districtId === d.id ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDistrictId(d.id);
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Theater - Only show when no theater is pre-selected */}
      {districtId && !initialTheaterId && (
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{ marginBottom: "16px", color: "#2e2b29", fontSize: "18px" }}
          >
            Chọn rạp:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {theatersList.map((t: any) => (
              <button
                type="button"
                key={t.id}
                className={`step-btn ${theaterId === t.id ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTheaterId(t.id);
                }}
              >
                {t.name || t.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Movie Selection - Only show when theater is selected and no movieId from URL */}
      {theaterId && (!movieId || movieId === "theater") && (
        <div className="step-content">
          <h3 className="step-label" style={{ marginBottom: "8px" }}>
            Các bộ phim đang chiếu tại rạp
          </h3>
          <p style={{ marginBottom: "20px", color: "#8b7355", fontSize: "14px", fontWeight: "500" }}>
            Vui lòng chọn bộ phim bạn muốn xem:
          </p>

          <div className="lotte-movie-grid">
            {loadingTheaterMovies ? (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                Đang tải danh sách phim...
              </div>
            ) : errorTheaterMovies ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#e50914",
                }}
              >
                Có lỗi khi tải danh sách phim.
              </div>
            ) : (Array.isArray(theaterMovies) ? theaterMovies : []).length > 0 ? (
              (Array.isArray(theaterMovies) ? theaterMovies : []).map((movie: any) => (
                <div
                  key={movie.id}
                  className={`lotte-movie-card ${selectedMovieId === movie.id ? "selected" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedMovieId(movie.id);
                  }}
                >
                  <div className="lotte-movie-poster">
                    <img src={movie.posterUrl || undefined} alt={movie.title} />
                    <div className="lotte-movie-overlay">
                      <div className="lotte-movie-buttons">
                        <button
                          type="button"
                          className="lotte-btn-book"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedMovieId(movie.id);
                          }}
                        >
                          Chọn phim
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="lotte-movie-info">
                    <div className="lotte-movie-rating">
                      <span className={`lotte-age-rating ${
                        movie.ageRating?.toLowerCase() === 'k' ? 'rating-k' :
                        movie.ageRating?.toLowerCase() === 'p' ? 'rating-p' :
                        `rating-${movie.ageRating?.replace(/\D/g, '')}`
                      }`}>
                        {movie.ageRating || 'K'}
                      </span>
                      <span className="lotte-movie-title">{movie.title}</span>
                    </div>
                    
                    <div className="lotte-movie-meta">
                      <span className="lotte-movie-duration">
                        {movie.duration} phút
                      </span>
                      {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                        <div className="movie-genres-list">
                          {movie.genres.map((genre: any) => (
                            <span key={genre.id} className="movie-genre-tag">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedMovieId === movie.id && (
                    <div className="movie-selected-badge">
                      ✓ Đã chọn
                    </div>
                  )}



                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#8b7355",
                  gridColumn: "1 / -1",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "12px",
                  border: "1px dashed rgba(139, 115, 85, 0.2)",
                  fontSize: "1.1rem",
                  fontWeight: "500"
                }}
              >
                Không có phim nào trong rạp này.
              </div>
            )}
          </div>
        </div>
      )}

      {theaterId && currentMovieId && (
        <div className="step-content date-navigation">
          <div className="date-nav-label">Chọn ngày:</div>
          <div className="date-nav-grid">
            {showdatesList.map((d: string) => {
              const lb = getDateLabel(d);
              return (
                <button
                  type="button"
                  key={d}
                  className={`date-nav-btn ${showDate === d ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDate(d);
                  }}
                >
                  <div className="st-date">{lb.dow}</div>
                  <div className="st-date">{lb.dmy}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {theaterId && showDate && (
        <div className="step-content">
          <b>Chọn suất chiếu:</b>
          <div className="showtime-content">
            {bucketsOrder
              .filter(
                (b) => showtimesByBucket[b] && showtimesByBucket[b].length > 0
              )
              .map((bucket) => (
                <div key={bucket} className="showtime-group">
                  <div className="showtime-group-title">{bucket}</div>
                  <div className="showtime-grid">
                    {showtimesByBucket[bucket].map((s: any) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`showtime-btn step-btn ${showtimeId === s.id ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowtimeId(s.id);
                        }}
                      >
                        {s.showTime}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {showtimeId && (
        <div className="step-content">
          <b>Chọn ghế:</b>
          <div className="seat-layout">
            <div className="seat-screen">Màn hình</div>
            <div className="seat-rows">
              <div className="seat-row">
                <div className="seat-row-label"></div>
                <div
                  className="seat-row-seats"
                  style={{
                    gridTemplateColumns: "repeat(20, var(--seat-size))",
                  }}
                >
                  {sortedSeats.map((seat: any) => {
                    const isPurchased = seat.status === "PAID";
                    const isMyPending = seat.status === "MY_PENDING";
                    const isPending = seat.status === "PENDING";
                    const isHeldByOthers = seat.heldByOthers;
                    const isSelected = selectedSeatIds.has(seat.id);
                    
                    // Logic: 
                    // - PAID: Red (booked)
                    // - MY_PENDING: Treat as 'Selected' or specialized 'Pending' (Yellow). For now, if it's mine, I might proceed to pay, so don't block.
                    // - PENDING: Someone else is paying. Treat potentially as booked (Grey/Yellow).
                    
                    const isUnavailable = isPurchased || (isPending && !isMyPending) || isHeldByOthers;
                    
                    let statusClass = "";
                    if (isPurchased) statusClass = "booked";
                    else if (isPending) statusClass = "booked"; // Treat other's pending as booked/unavailable
                    else if (isHeldByOthers) statusClass = "held-others";
                    // MY_PENDING -> default to available visually or selected logic handles it. 
                    // If user is returning to page, MY_PENDING should ideally auto-select or show 'Waiting Payment'.
                    // For simplicity, let's treat MY_PENDING as available/neutral so user can re-select or see it if they are in payment flow.

                    return (
                      <label
                        key={seat.id}
                        className={`seat-btn ${statusClass} ${isSelected ? "selected" : ""} ${getSeatClass(seat)}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isUnavailable}
                          checked={isSelected}
                          onChange={async (e) => {
                            if (!showtimeId || isPurchased) return;
                            try {
                              if (e.target.checked) {
                                // Holding seat for booking
                                const res = await bookingApi.holdSeat(showtimeId, seat.id);
                                if (res.data && res.data.success) {
                                  setSelectedSeatIds((prev) =>
                                    new Set(prev).add(seat.id)
                                  );
                                } else {
                                  setError(res.data?.message || "Ghế này đã có người giữ. Vui lòng chọn ghế khác.");
                                  e.target.checked = false;
                                  refetchSeats(); // Force refresh to show the hold from others
                                }
                              } else {
                                // Releasing seat
                                if (bookingApi.releaseSeat) {
                                  const res = await bookingApi.releaseSeat(
                                    showtimeId,
                                    seat.id
                                  );
                                  if (res.data && res.data.success) {
                                    setSelectedSeatIds((prev) => {
                                      const next = new Set(prev);
                                      next.delete(seat.id);
                                      return next;
                                    });
                                  } else {
                                     refetchSeats();
                                  }
                                }
                              }
                            } catch (err) {
                              // Handle seat operation error
                              setError(
                                "Có lỗi xảy ra khi chọn ghế. Vui lòng thử lại."
                              );
                              // noop; in real UI show toast
                            }
                          }}
                        />
                        <span>{seat.seatNumber}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Seat Legend - ở dưới ghế như flow cũ */}
            <div className="seat-legend" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
              <div className="legend-item">
                <span className="legend-box legend-standard"></span>
                <span>Ghế thường</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-vip"></span>
                <span>Ghế VIP</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-couple"></span>
                <span>Ghế Couple</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-selected"></span>
                <span>Ghế đang chọn</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-held"></span>
                <span>Giao dịch tại quầy/nơi khác</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-booked"></span>
                <span>Ghế đã mua</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showtimeId && selectedSeatIds.size > 0 && (
        <div className="booking-summary">
          <h3>Thông tin đặt vé</h3>
          <p>
            <strong>Phim:</strong> {movie?.title || "Chưa chọn phim"}
          </p>
          <p>
            <strong>Rạp:</strong>{" "}
            {theatersList.find((t: any) => String(t.id) === String(theaterId))
              ?.name || ""}
          </p>
          <p>
            <strong>Suất chiếu:</strong> {showDate} {selectedShowtime?.showTime}
          </p>
          <p>
            <strong>Ghế đã chọn:</strong>{" "}
            {[...selectedSeatIds]
              .map(
                (sid) =>
                  seatsList.find((s: any) => String(s.id) === String(sid))
                    ?.seatNumber
              )
              .join(", ")}
          </p>
          <p>
            <strong>Số lượng vé:</strong> {selectedSeatIds.size}
          </p>
          <p>
            <strong>Tổng tiền:</strong>{" "}
            {[...selectedSeatIds]
              .reduce((total: number, seatId) => {
                const seat = seatsList.find(
                  (s: any) => String(s.id) === String(seatId)
                );
                if (!seat || !selectedShowtime) return total;

                // Calculate price based on seat type
                const seatType = (seat.seatType || "").toUpperCase();
                const typeMultiplier = seatType === "COUPLE" ? 2 : 1;

                const basePrice =
                  seatType === "VIP"
                    ? selectedShowtime.priceVip || 0
                    : selectedShowtime.priceStandard || 0;

                return total + Math.round(Number(basePrice) * typeMultiplier);
              }, 0)
              .toLocaleString("vi-VN")}{" "}
            VND
          </p>

          {!showPaymentForm ? (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="fd-btn"
                onClick={() => setShowPaymentForm(true)}
              >
                Tiếp tục thanh toán
              </button>
            </div>
          ) : (
            <div className="payment-form">
              <h4>Thông tin khách hàng</h4>
              {userProfile && (
                <div style={{ 
                  padding: "12px", 
                  background: "#e8f5e9", 
                  borderRadius: "8px", 
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "#2e7d32"
                }}>
                  ✓ Thông tin được lấy từ hồ sơ của bạn
                </div>
              )}
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập họ tên"
                  required
                  className={customerName ? "valid" : ""}
                  readOnly={!!userProfile}
                  style={userProfile ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                />
                {!customerName && showPaymentForm && (
                  <small className="error-message">Vui lòng nhập họ tên</small>
                )}
              </div>
              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  required
                  className={customerPhone ? "valid" : ""}
                  readOnly={!!userProfile}
                  style={userProfile ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                />
                {!customerPhone && showPaymentForm && (
                  <small className="error-message">
                    Vui lòng nhập số điện thoại
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Nhập email"
                  required
                  className={customerEmail ? "valid" : ""}
                  readOnly={!!userProfile}
                  style={userProfile ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                />
                {!customerEmail && showPaymentForm && (
                  <small className="error-message">
                    Vui lòng nhập email
                  </small>
                )}
              </div>
              <div className="payment-actions">
                <button
                  type="button"
                  className={`fd-btn ${!customerName || !customerPhone || !customerEmail || isProcessingPayment ? "disabled" : ""}`}
                  disabled={
                    !customerName || !customerPhone || !customerEmail || isProcessingPayment
                  }
                  onClick={handlePayment}
                >
                  {isProcessingPayment ? "Đang xử lý..." : "Thanh toán VietQR (SePay)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Lỗi" })}
      />

      {/* SePay QR Modal */}
      {/* SePay QR Modal - Premium Design */}
      {showQRModal && (
        <div 
          className="custom-modal-overlay" 
          style={{ 
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div 
            className="custom-modal" 
            style={{ 
              width: "90%",
              maxWidth: "420px",
              background: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
              animation: "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* Header */}
            <div className="modal-header" style={{ 
              padding: "24px 24px 0", 
              background: "transparent",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#1a1a1a", fontWeight: 700 }}>Thanh Toán</h2>
                <span style={{ fontSize: "0.85rem", color: "#666" }}>Quét mã QR để hoàn tất</span>
              </div>
              <button 
                onClick={async () => {
                  try {
                    if (currentPaymentCode) {
                       await bookingApi.cancelByPaymentCode(currentPaymentCode);
                    }
                  } catch (e) {
                    console.error("Failed to cancel", e);
                  } finally {
                    setShowQRModal(false);
                    setSelectedSeatIds(new Set()); 
                    setShowPaymentForm(false);
                    refetchSeats(); // Refresh immediately to show seats as available
                  }
                }}
                className="close-btn-modern"
                style={{ 
                  background: "transparent", 
                  border: "1px solid #ff4d4f", 
                  padding: "6px 14px", 
                  borderRadius: "20px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  cursor: "pointer", 
                  color: "#ff4d4f", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  transition: "all 0.2s" 
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#fff1f0";
                }}
                onMouseOut={(e) => {
                   e.currentTarget.style.background = "transparent";
                }}
              >
                Hủy thanh toán
              </button>
            </div>

            <div className="modal-body" style={{ padding: "24px" }}>
              {!paymentTimedOut ? (
                <>
                  {/* Amount Card */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #FFB800 0%, #FF9900 100%)", 
                    padding: "8px", 
                    marginBottom: "24px",
                    color: "white",
                    textAlign: "center",
                    boxShadow: "0 8px 16px rgba(255, 153, 0, 0.25)"
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, opacity: 0.9, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Tổng thanh toán</div>
                    <div style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                      {paymentAmount.toLocaleString("vi-VN")} <span style={{ fontSize: "20px", fontWeight: 600 }}>đ</span>
                    </div>
                  </div>
                  
                  {/* QR Code Container */}
                  <div style={{ 
                    background: "#ffffff", 
                    padding: "16px", 
                    borderRadius: "16px", 
                    border: "2px dashed #e0e0e0",
                    marginBottom: "24px",
                    textAlign: "center",
                    position: "relative"
                  }}>
                    <div style={{
                       position: "absolute",
                       top: "-12px",
                       left: "50%",
                       transform: "translateX(-50%)",
                       background: "#fff",
                       padding: "0 12px",
                       color: "#666",
                       fontSize: "12px",
                       fontWeight: 600
                    }}>
                      VietQR
                    </div>
                    <img 
                      src={qrUrl} 
                      alt="SePay QR" 
                      style={{ 
                        width: "100%", 
                        maxWidth: "240px", 
                        borderRadius: "8px",
                        display: "block",
                        margin: "0 auto"
                      }}
                    />
                  </div>
                  
                  {/* Transaction Info */}
                  <div style={{ 
                    background: "#f8f9fa", 
                    padding: "16px", 
                    marginBottom: "20px",
                    border: "1px solid #edf2f7"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#666" }}>Nội dung chuyển khoản</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ 
                        fontSize: "16px", 
                        fontWeight: "700", 
                        color: "#2d3748", 
                        flex: 1,
                        fontFamily: "monospace",
                        letterSpacing: "0.5px"
                      }}>
                        {currentPaymentCode}
                      </div>
                      <button
                        onClick={copyPaymentCode}
                        style={{
                          background: "white",
                          color: "#4a5568",
                          border: "1px solid #e2e8f0",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                           e.currentTarget.style.borderColor = "#cbd5e0";
                           e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseOut={(e) => {
                           e.currentTarget.style.borderColor = "#e2e8f0";
                           e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Status & Timer */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "8px",
                      marginBottom: "8px"
                    }}>
                      <div className="spinner-border" style={{ width: "16px", height: "16px", borderWidth: "2px", borderColor: "#FFB800", borderRightColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}>Đang chờ thanh toán...</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#a0aec0" }}>
                      Hết hạn trong <strong style={{ color: "#e53e3e" }}>
                        {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                      </strong>
                    </div>
                  </div>
                  
                  <style>{`
                    @keyframes slideUpFade {
                      from { opacity: 0; transform: translateY(20px) scale(0.98); }
                      to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </>
              ) : (
                /* Timeout State */
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "56px", marginBottom: "20px", display: "block" }}>⏰</div>
                  <h3 style={{ color: "#2d3748", marginBottom: "12px", fontSize: "1.5rem" }}>Đã hết thời gian</h3>
                  <p style={{ color: "#718096", marginBottom: "32px", lineHeight: "1.6" }}>
                    Giao dịch đã bị hủy do quá thời hạn thanh toán.<br/>Vui lòng thực hiện lại yêu cầu đặt vé.
                  </p>
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      setPaymentTimedOut(false);
                      setSelectedSeatIds(new Set());
                      setShowPaymentForm(false);
                    }}
                    className="fd-btn"
                    style={{ 
                      width: "100%", 
                      maxWidth: "200px",
                      margin: "0 auto",
                      background: "#edf2f7",
                      color: "#4a5568",
                      border: "none"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#edf2f7"}
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
