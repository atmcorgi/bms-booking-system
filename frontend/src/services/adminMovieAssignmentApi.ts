import api from "./apiClient";

export const adminMovieAssignmentApi = {
  list: (theaterId: number) =>
    api.get(`/api/admin/theaters/${theaterId}/movies`),
  assign: (
    theaterId: number,
    payload: {
      movieCode: string;
      activeFrom?: string;
      activeTo?: string;
      formats?: string;
      languages?: string;
    }
  ) => api.post(`/api/admin/theaters/${theaterId}/movies/assign`, payload),
  unassign: (theaterId: number, movieCode: string) =>
    api.delete(
      `/api/admin/theaters/${theaterId}/movies/${encodeURIComponent(movieCode)}`
    ),
};
