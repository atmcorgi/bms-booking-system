package fsa.training.service.movie;

import fsa.training.dto.movie.MovieCardProjection;
import fsa.training.dto.movie.MovieStatusProjection;
import fsa.training.entity.Movie;
import fsa.training.entity.MovieRequest;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.specification.MovieSpecification;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class MovieService {
    
    private static final Logger logger = LoggerFactory.getLogger(MovieService.class);
    
    private final MovieRepository movieRepository;
    private final MovieRequestRepository movieRequestRepository;

    public MovieService(MovieRepository movieRepository, MovieRequestRepository movieRequestRepository) {
        this.movieRepository = movieRepository;
        this.movieRequestRepository = movieRequestRepository;
    }

    @Transactional(readOnly = true)
    public Page<MovieCardProjection> getNowShowingProjections(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRepository.findNowShowingProjections(pageable, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Page<MovieCardProjection> getComingSoonProjections(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRepository.findComingSoonProjections(pageable, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Page<MovieStatusProjection> getWorkflowProjectionsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRepository.findWorkflowProjectionsByStatus(status, pageable);
    }

    // Assignment-based APIs for shared movie model
    @Transactional(readOnly = true)
    public Page<MovieStatusProjection> getWorkflowProjectionsByStatusAndTheater(String status, Long theaterId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRepository.findWorkflowProjectionsByStatusAndTheater(status, theaterId, pageable);
    }

    @Transactional(readOnly = true)
    public long countMoviesByStatusAndTheater(String status, Long theaterId) {
        return movieRepository.countMoviesByStatusAndTheater(status, theaterId);
    }

    @Transactional(readOnly = true)
    public long getMovieCountByStatus(String status) {
        return movieRepository.countMoviesByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Transactional(readOnly = true)
    public int countAssignedMoviesByTheater(Long theaterId) {
        return movieRepository.countAssignedMoviesByTheater(theaterId);
    }

    @Transactional(readOnly = true)
    public Page<MovieStatusProjection> getAssignedMoviesByTheater(Long theaterId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRepository.findAssignedMoviesByTheater(theaterId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MovieStatusProjection> getAllAssignedMoviesByTheater(Long theaterId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRepository.findAllAssignedMoviesByTheater(theaterId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MovieRequest> getMovieRequestsByQBE(Integer priority, String formats, String languages, int page, int size) {
        
        MovieRequest probe = new MovieRequest();
        probe.setStatus("PENDING");
        if (priority != null) {
            probe.setPriority(priority);
        }
        // formats/languages được lọc qua Movie liên kết; ở đây không set vào probe
        ExampleMatcher matcher = ExampleMatcher.matching()
            .withIgnoreNullValues()
            .withIgnorePaths("id", "movie", "createdAt", "updatedAt")
            .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING)
            .withIgnoreCase();
        
        Example<MovieRequest> example = Example.of(probe, matcher);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return movieRequestRepository.findAll(example, pageable);
    }

    @Transactional(readOnly = true)
    public List<Movie> getMoviesByTheaterIdFromToday(Long theaterId) {
        return movieRepository.findMoviesByTheaterIdFromDate(theaterId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Movie> searchMoviesWithFilters(String keyword, String genre, String sYear) {
        List<Specification<Movie>> parts = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            parts.add(MovieSpecification.withKeyword(keyword.trim()));
        }

        if (genre != null && !genre.trim().isEmpty()) {
            parts.add(MovieSpecification.withGenre(genre.trim()));
        }

        if (sYear != null && !sYear.trim().isEmpty()) {
            String[] sYearSplit = sYear.split(",");
            List<Integer> years = new java.util.ArrayList<>();
            for (String year : sYearSplit) {
                if (year == null || year.isEmpty()) continue;
                try {
                    years.add(Integer.parseInt(year));
                } catch (NumberFormatException e) {
                    logger.warn("Invalid year format: {}", year, e);
                }
            }
            if (!years.isEmpty()) {
                parts.add(MovieSpecification.withYears(years));
            }
        }

        Specification<Movie> spec = parts.isEmpty()
            ? (root, q, cb) -> cb.conjunction()
            : Specification.allOf(parts);

        return movieRepository.findAll(spec);
    }

    @Transactional(readOnly = true)
    public Page<MovieCardProjection> searchMovies(String searchTerm, String genre, String year, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        
        // Debug logging
        logger.debug("Search parameters: searchTerm={}, genre={}, year={}", searchTerm, genre, year);
        
        // Use the existing searchMoviesWithFilters logic but return as projections
        List<Movie> filteredMovies = searchMoviesWithFilters(searchTerm, genre, year);
        
        logger.debug("Filtered movies count: {}", filteredMovies.size());
        
        // Convert to projections (không phụ thuộc status)
        List<MovieCardProjection> projections = filteredMovies.stream()
            .map(this::convertToMovieCardProjection)
            .toList();
        
        logger.debug("Projections count: {}", projections.size());
        
        // Create a custom page implementation
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), projections.size());
        List<MovieCardProjection> pageContent = projections.subList(start, end);
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent, 
            pageable, 
            projections.size()
        );
    }
    
    private MovieCardProjection convertToMovieCardProjection(Movie movie) {
        return new MovieCardProjection() {
            @Override
            public Long getId() { return movie.getId(); }
            
            @Override
            public String getTitle() { return movie.getTitle(); }
            
            @Override
            public String getPosterUrl() { return movie.getPosterUrl(); }
            
            @Override
            public Integer getDuration() { return movie.getDuration(); }
            
            @Override
            public String getAgeRating() { return movie.getAgeRating(); }
            
            @Override
            public java.time.LocalDate getReleaseDate() { return movie.getReleaseDate(); }
            
            @Override
            public String getDirector() { return movie.getDirector(); }
            
            @Override
            public String getGenres() { 
                return movie.getGenres().stream()
                    .map(g -> g.getName())
                    .collect(java.util.stream.Collectors.joining(", "));
            }
        };
    }

    /**
     * Publish movie for specific theater (Staff function)
     * Only publish movies that are SCHEDULED and assigned to the theater
     */
    @Transactional
    public boolean publishMovieForTheater(String movieCode, Long theaterId) {
        Optional<Movie> movieOpt = movieRepository.findByCode(movieCode);
        if (!movieOpt.isPresent()) {
            return false;
        }
        
        Movie movie = movieOpt.get();
        
        // Chỉ publish phim đang ở trạng thái SCHEDULED
        if (!"SCHEDULED".equals(movie.getStatus())) {
            return false;
        }
        
        // Publish phim
        movie.setStatus("PUBLISHED");
        movieRepository.save(movie);
        
        return true;
    }
}