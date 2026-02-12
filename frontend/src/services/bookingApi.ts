import api from "./apiClient";

export const bookingApi = {
  getLocations(params: { movieId?: number | string; showDate?: string }) {
    return api.get("/api/booking/locations", { params });
  },
  getDistricts(params: {
    provinceId: number | string;
    movieId?: number | string;
    showDate?: string;
  }) {
    return api.get("/api/booking/districts", { params });
  },
  getTheaters(params: {
    provinceId: number | string;
    districtId: number | string;
    movieId?: number | string;
    showDate?: string;
  }) {
    return api.get("/api/booking/theaters", { params });
  },
  getShowDates(params: {
    theaterId: number | string;
    movieId?: number | string;
  }) {
    return api.get("/api/booking/showdates", { params });
  },
  getShowtimes(params: {
    theaterId: number | string;
    movieId?: number | string;
    showDate?: string;
  }) {
    return api.get("/api/booking/showtimes", { params });
  },
  getSeats(params: {
    theaterId: number | string;
    showtimeId?: number | string;
  }) {
    return api.get("/api/booking/seats", { params });
  },
  holdSeat(showtimeId: number | string, seatId: number | string) {
    return api.post(`/api/booking/shows/${showtimeId}/holds`, null, {
      params: { seatId },
    });
  },
  releaseSeat(showtimeId: number | string, seatId: number | string) {
    return api.delete(`/api/booking/shows/${showtimeId}/holds`, {
      params: { seatId },
    });
  },
  createBooking(bookingData: {
    showtimeId: number | string;
    seatIds: (number | string)[];
    customerName: string;
    customerPhone: string;
    email?: string;
  }) {
    return api.post("/api/booking/booking", bookingData);
  },
  cancelBooking(bookingId: number | string) {
    return api.post(`/api/booking/cancel/${bookingId}`);
  },
  cancelByPaymentCode(paymentCode: string) {
    return api.post(`/api/booking/cancel-by-code/${paymentCode}`);
  },
  getBookingById(bookingId: number | string) {
    return api.get(`/api/booking/booking/${bookingId}`);
  },
  getBookingsByIds(bookingIds: string) {
    return api.get(`/api/booking/bookings?ids=${bookingIds}`);
  },
};
