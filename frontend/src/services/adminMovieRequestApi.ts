import api from "./apiClient";
import type { PagedResponse } from "./adminMovieAssignmentApi"; // Re-use from assignment api

export interface MovieRequest {
  id: number;
  movieId: number;
  movieCode: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieDuration?: number;
  theaterId: number;
  theaterName: string;
  theaterCode: string;
  status: string;
  priority: number;
  demandScore: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const adminMovieRequestApi = {
  list: (params: { 
    q?: string;
    status?: string; 
    theaterId?: number;
    page?: number; 
    size?: number;
  }) => api.get<PagedResponse<MovieRequest>>("/api/admin/movie-requests", { params }),
  
  getById: (id: number) => api.get<MovieRequest>(`/api/admin/movie-requests/${id}`),
  
  // REMOVED: approve() and reject() - simplified workflow to PENDING → SCHEDULED only
  
  remove: (id: number) => api.delete(`/api/admin/movie-requests/${id}`),
};
