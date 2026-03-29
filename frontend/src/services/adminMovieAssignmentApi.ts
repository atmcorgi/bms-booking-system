import api from "./apiClient";

export interface MovieAssignment {
  id: number;
  movieId: number;
  movieCode: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieDuration?: number;
  theaterId: number;
  theaterName: string;
  theaterCode: string;
  activeFrom?: string;
  activeTo?: string;
  formats?: string;
  languages?: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

export const adminMovieAssignmentApi = {
  // List all assignments with pagination and filtering
  list: (params?: { 
    q?: string; 
    theaterId?: number;
    page?: number; 
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get<PagedResponse<MovieAssignment>>("/api/admin/movie-assignments", { params }),
  
  // List assignments for a specific theater (using the NEW endpoint)
  listByTheater: (theaterId: number) =>
    api.get<MovieAssignment[]>(`/api/admin/theaters/${theaterId}/movies`),

  // NEW: List available (unassigned) movies for a theater
  getAvailableMovies: (theaterId: number, params?: { q?: string, page?: number, size?: number }) =>
    api.get<PagedResponse<any>>(`/api/admin/theaters/${theaterId}/movies/available`, { params }),

  getById: (id: number) => api.get<MovieAssignment>(`/api/admin/movie-assignments/${id}`),

  create: (payload: {
    movieId: number;
    theaterId: number;
    activeFrom?: string;
    activeTo?: string;
    formats?: string;
    languages?: string;
  }) => api.post("/api/admin/movie-assignments", payload),
  
  update: (id: number, payload: {
    activeFrom?: string;
    activeTo?: string;
    formats?: string;
    languages?: string;
  }) => api.put(`/api/admin/movie-assignments/${id}`, payload),

  remove: (id: number) => api.delete(`/api/admin/movie-assignments/${id}`),
  
  // Assign movie to theater (NEW workflow: creates MovieAssignment + auto-creates MovieRequest)
  assign: (theaterId: number, payload: { movieCode: string, [key: string]: any }) =>
    api.post(`/api/admin/theaters/${theaterId}/movies/assign`, payload),

  // Bulk Assign
  assignBulk: (theaterId: number, payload: { movieCodes: string[], [key: string]: any }) =>
    api.post(`/api/admin/theaters/${theaterId}/movies/bulk`, payload),

  // Unassign movie from theater (deletes both MovieAssignment and MovieRequest)
  unassign: (theaterId: number, movieCode: string) =>
    api.delete(`/api/admin/theaters/${theaterId}/movies/${movieCode}`),

  // Delete all expired assignments (activeTo < today)
  clearExpired: () => api.delete("/api/admin/movie-assignments/clear-expired"),
};
