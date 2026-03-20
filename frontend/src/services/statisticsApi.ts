import api from "./apiClient";

export interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  dailyRevenue: Record<string, number>;
}

export interface TopMovie {
  movieCode: string;
  title: string;
  posterUrl: string;
  bookings: number;
}

export interface SummaryStats {
  monthRevenue: number;
  monthBookings: number;
  bestMonth?: string;
  bestMonthRevenue?: number;
  bestMovie?: string;
  bestMovieBookings?: number;
}
export interface TheaterRevenue {
  theaterId: number;
  theaterName: string;
  revenue: number;
  bookings: number;
}

export const statisticsApi = {
  getRevenue: (from: string, to: string) => 
    api.get<RevenueStats>("/api/statistics/revenue", { params: { from, to } }),

  getTopMovies: (limit: number = 5) => 
    api.get<TopMovie[]>("/api/statistics/top-movies", { params: { limit } }),

  getSummary: (from: string, to: string) => 
    api.get<SummaryStats>("/api/statistics/summary", { params: { from, to } }),

  getTheaterRevenue: (from: string, to: string) =>
    api.get<TheaterRevenue[]>("/api/statistics/theaters", { params: { from, to } }),
};
