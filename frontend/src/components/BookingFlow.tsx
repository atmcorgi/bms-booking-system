import { useEffect, useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../services/bookingApi";
import api from "../services/apiClient";

export default function BookingFlow({
  movieId,
  theaterId: initialTheaterId,
}: {
  movieId?: string | number;
  theaterId?: string | null;
}) {
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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  } = useQuery({
    queryKey: seatsQueryKey,
    enabled: !!showtimeId,
    queryFn: async () =>
      (await bookingApi.getSeats({ theaterId: theaterId!, showtimeId })).data,
    placeholderData: (prev) => prev,
  });
  const provincesList = Array.isArray(provinces) ? provinces : [];
  const districtsList = Array.isArray(districts) ? districts : [];
  const theatersList = Array.isArray(theaters) ? theaters : [];
  const showdatesList = Array.isArray(showdates) ? showdates : [];
  const showtimesList = Array.isArray(showtimes) ? showtimes : [];
  const seatsList = Array.isArray(seats) ? seats : [];

  // Reset local selection when showtime changes or seats refetch
  useEffect(() => {
    setSelectedSeatIds(new Set());
    setShowPaymentForm(false);
  }, [showtimeId]);

  // Fast lookup for booked ids
  const bookedSeatIds = useMemo(() => {
    const s = new Set<string | number>();
    for (const seat of seatsList) {
      if (seat.booked) s.add(seat.id);
    }
    return s;
  }, [seatsList]);

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
      selectedSeatIds.size === 0 ||
      !showtimeId
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
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
      };

      // Creating booking with validated data
      // Gọi API tạo booking và thanh toán VNPay
      const response = await bookingApi.createBooking(bookingData);
      // Booking created successfully

      if (response.data && response.data.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl;
      } else {
        alert("Có lỗi xảy ra khi tạo thanh toán");
      }
    } catch (error) {
      // Handle payment error
      setError("Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.");
      alert("Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsProcessingPayment(false);
    }
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
      className="main-content-container"
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
          <div className="step-label">Các bộ phim đang chiếu tại rạp</div>
          <div style={{ marginBottom: "20px", color: "#666" }}>Chọn phim:</div>
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
            ) : theaterMovies && theaterMovies.length > 0 ? (
              theaterMovies.map((movie: any) => (
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
                    <div className="lotte-movie-title">{movie.title}</div>
                    <div className="lotte-movie-meta">
                      {movie.duration} phút • {movie.ageRating}
                      {movie.genres && movie.genres.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                          {movie.genres
                            .map((genre: any) => genre.name)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedMovieId === movie.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#28a745",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        zIndex: 10,
                      }}
                    >
                      Đã chọn
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
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
                    gridTemplateColumns: "repeat(12, var(--seat-size))",
                  }}
                >
                  {seatsList.map((seat: any) => {
                    const isBooked = bookedSeatIds.has(seat.id);
                    const isSelected = selectedSeatIds.has(seat.id);
                    return (
                      <label
                        key={seat.id}
                        className={`seat-btn ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} ${seat.seatType === "VIP" ? "seat-type-vip" : "seat-type-standard"}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isBooked}
                          checked={isSelected}
                          onChange={async (e) => {
                            if (!showtimeId || isBooked) return;
                            try {
                              if (e.target.checked) {
                                // Holding seat for booking
                                await bookingApi.holdSeat(showtimeId, seat.id);
                                // Seat held successfully
                                setSelectedSeatIds((prev) =>
                                  new Set(prev).add(seat.id)
                                );
                              } else {
                                // Releasing seat
                                if (bookingApi.releaseSeat) {
                                  await bookingApi.releaseSeat(
                                    showtimeId,
                                    seat.id
                                  );
                                }
                                setSelectedSeatIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(seat.id);
                                  return next;
                                });
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
            <div className="seat-legend">
              <div className="legend-item">
                <span className="legend-box legend-standard"></span>
                <span>Ghế thường</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-vip"></span>
                <span>Ghế VIP</span>
              </div>
              <div className="legend-item">
                <span className="legend-box legend-selected"></span>
                <span>Ghế đang chọn</span>
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

                // Calculate price based on seat type and weekend multiplier
                const isWeekend =
                  selectedShowtime.showDate &&
                  (new Date(selectedShowtime.showDate).getDay() === 6 ||
                    new Date(selectedShowtime.showDate).getDay() === 0);
                const multiplier = isWeekend ? 1.15 : 1.0;

                const basePrice =
                  seat.seatType === "VIP"
                    ? selectedShowtime.priceVip || 0
                    : selectedShowtime.priceStandard || 0;

                return total + Math.round(Number(basePrice) * multiplier);
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
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập họ tên"
                  required
                  className={customerName ? "valid" : ""}
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
                />
                {!customerPhone && showPaymentForm && (
                  <small className="error-message">
                    Vui lòng nhập số điện thoại
                  </small>
                )}
              </div>
              <div className="payment-actions">
                <button
                  type="button"
                  className={`fd-btn ${!customerName || !customerPhone || isProcessingPayment ? "disabled" : ""}`}
                  disabled={
                    !customerName || !customerPhone || isProcessingPayment
                  }
                  onClick={handlePayment}
                >
                  {isProcessingPayment ? "Đang xử lý..." : "Thanh toán VNPay"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
