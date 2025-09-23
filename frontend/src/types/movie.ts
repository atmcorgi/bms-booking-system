export type MovieItem = {
  id?: number | string;
  title?: string;
  posterUrl?: string;
  duration?: number;
  durationMin?: number;
  ageRating?: string;
  releaseDate?: string;
  director?: string;
  genres?: string;
};

export type MovieCardProps = {
  movie: MovieItem;
  showTrailer?: boolean;
  trailerUrl?: string;
};
