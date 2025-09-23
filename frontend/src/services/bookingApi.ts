import api from "./apiClient";

export const bookingApi = {
  getLocations(params: { movieId?: number | string; showDate?: string }) {
    return api.get("/booking/api/locations", { params });
  },
  getDistricts(params: {
    provinceId: number | string;
    movieId?: number | string;
    showDate?: string;
  }) {
    return api.get("/booking/api/districts", { params });
  },
  getTheaters(params: {
    provinceId: number | string;
    districtId: number | string;
    movieId?: number | string;
    showDate?: string;
  }) {
    return api.get("/booking/api/theaters", { params });
  },
  getShowDates(params: {
    theaterId: number | string;
    movieId?: number | string;
  }) {
    return api.get("/booking/api/showdates", { params });
  },
  getShowtimes(params: {
    theaterId: number | string;
    movieId?: number | string;
    showDate?: string;
  }) {
    return api.get("/booking/api/showtimes", { params });
  },
  getSeats(params: {
    theaterId: number | string;
    showtimeId?: number | string;
  }) {
    return api.get("/booking/api/seats", { params });
  },
  holdSeat(showtimeId: number | string, seatId: number | string) {
    return api.post(`/booking/api/shows/${showtimeId}/holds`, null, {
      params: { seatId },
    });
  },
  releaseSeat(showtimeId: number | string, seatId: number | string) {
    return api.delete(`/booking/api/shows/${showtimeId}/holds`, {
      params: { seatId },
    });
  },
  createBooking(bookingData: {
    showtimeId: number | string;
    seatIds: (number | string)[];
    customerName: string;
    customerPhone: string;
  }) {
    return api.post("/booking/api/booking", bookingData);
  },
  getBookingById(bookingId: number | string) {
    return api.get(`/booking/api/booking/${bookingId}`);
  },
  getBookingsByIds(bookingIds: string) {
    return api.get(`/booking/api/bookings?ids=${bookingIds}`);
  },
};
