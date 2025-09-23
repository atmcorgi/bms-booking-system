package fsa.training.service;

import fsa.training.entity.Movie;
import fsa.training.repository.movie.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImageMigrationService {

    private static final Logger logger = LoggerFactory.getLogger(ImageMigrationService.class);

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    /**
     * Migrate all movie posters from external URLs to Cloudinary
     */
    @Transactional
    public void migrateAllMoviePosters() {
        List<Movie> movies = movieRepository.findAll();
        int migrated = 0;
        int failed = 0;

        logger.info("Starting migration of {} movie posters", movies.size());

        for (Movie movie : movies) {
            try {
                if (movie.getPosterUrl() != null && 
                    !movie.getPosterUrl().isEmpty() && 
                    !movie.getPosterUrl().contains("cloudinary.com")) {
                    
                    String newUrl = imageUploadService.uploadFromUrl(movie.getPosterUrl(), movie.getTitle());
                    
                    if (!newUrl.equals(movie.getPosterUrl())) {
                        movie.setPosterUrl(newUrl);
                        movieRepository.save(movie);
                        migrated++;
                        logger.info("Migrated: {} -> {}", movie.getTitle(), newUrl);
                    }
                }
            } catch (Exception e) {
                failed++;
                logger.error("Failed to migrate poster for movie: {}", movie.getTitle(), e);
            }
        }

        logger.info("Migration completed. Migrated: {}, Failed: {}", migrated, failed);
    }

    /**
     * Migrate specific movie poster
     */
    @Transactional
    public boolean migrateMoviePoster(Long movieId) {
        try {
            Movie movie = movieRepository.findById(movieId).orElse(null);
            if (movie == null) {
                logger.warn("Movie not found with ID: {}", movieId);
                return false;
            }

            if (movie.getPosterUrl() == null || 
                movie.getPosterUrl().isEmpty() || 
                movie.getPosterUrl().contains("cloudinary.com")) {
                logger.info("Movie {} already has Cloudinary URL or no URL", movie.getTitle());
                return true;
            }

            String newUrl = imageUploadService.uploadFromUrl(movie.getPosterUrl(), movie.getTitle());
            
            if (!newUrl.equals(movie.getPosterUrl())) {
                movie.setPosterUrl(newUrl);
                movieRepository.save(movie);
                logger.info("Successfully migrated: {} -> {}", movie.getTitle(), newUrl);
                return true;
            }

            return false;
        } catch (Exception e) {
            logger.error("Failed to migrate poster for movie ID: {}", movieId, e);
            return false;
        }
    }

    /**
     * Get migration statistics
     */
    public MigrationStats getMigrationStats() {
        List<Movie> allMovies = movieRepository.findAll();
        long totalMovies = allMovies.size();
        long cloudinaryMovies = allMovies.stream()
                .filter(movie -> movie.getPosterUrl() != null && 
                               movie.getPosterUrl().contains("cloudinary.com"))
                .count();
        long externalMovies = allMovies.stream()
                .filter(movie -> movie.getPosterUrl() != null && 
                               !movie.getPosterUrl().contains("cloudinary.com") &&
                               !movie.getPosterUrl().startsWith("/"))
                .count();
        long noUrlMovies = allMovies.stream()
                .filter(movie -> movie.getPosterUrl() == null || movie.getPosterUrl().isEmpty())
                .count();

        return new MigrationStats(totalMovies, cloudinaryMovies, externalMovies, noUrlMovies);
    }

    public static class MigrationStats {
        public final long totalMovies;
        public final long cloudinaryMovies;
        public final long externalMovies;
        public final long noUrlMovies;

        public MigrationStats(long totalMovies, long cloudinaryMovies, long externalMovies, long noUrlMovies) {
            this.totalMovies = totalMovies;
            this.cloudinaryMovies = cloudinaryMovies;
            this.externalMovies = externalMovies;
            this.noUrlMovies = noUrlMovies;
        }
    }
}
