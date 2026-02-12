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
import fsa.training.dto.movie.MovieSearchResultDTO;
import java.util.stream.Collectors;

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
    public MovieSearchResultDTO searchAndCategorizeMovies(String searchTerm, String genre, String year, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        LocalDate today = LocalDate.now();

        // 1. Build the base specification from filters
        List<Specification<Movie>> parts = new ArrayList<>();
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            parts.add(MovieSpecification.withKeyword(searchTerm.trim()));
        }
        if (genre != null && !genre.trim().isEmpty()) {
            parts.add(MovieSpecification.withGenre(genre.trim()));
        }
        if (year != null && !year.trim().isEmpty()) {
            String[] sYearSplit = year.split(",");
            List<Integer> years = new ArrayList<>();
            for (String y : sYearSplit) {
                if (y == null || y.isEmpty()) continue;
                try {
                    years.add(Integer.parseInt(y));
                } catch (NumberFormatException e) {
                    logger.warn("Invalid year format: {}", y, e);
                }
            }
            if (!years.isEmpty()) {
                parts.add(MovieSpecification.withYears(years));
            }
        }
        Specification<Movie> baseSpec = Specification.allOf(parts);

        // 2. Create categorized specifications
        Specification<Movie> nowShowingSpec = baseSpec.and(MovieSpecification.isNowShowing(today));
        Specification<Movie> comingSoonSpec = baseSpec.and(MovieSpecification.isComingSoon(today));

        // 3. Execute find queries
        Page<Movie> nowShowingMovies = movieRepository.findAll(nowShowingSpec, pageable);
        Page<Movie> comingSoonMovies = movieRepository.findAll(comingSoonSpec, pageable);

        // 4. Convert to projections
        Page<MovieCardProjection> nowShowingProjections = nowShowingMovies.map(this::convertToMovieCardProjection);
        Page<MovieCardProjection> comingSoonProjections = comingSoonMovies.map(this::convertToMovieCardProjection);

        return new MovieSearchResultDTO(nowShowingProjections, comingSoonProjections);
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
                if (movie.getGenres() == null) return "";
                return movie.getGenres().stream()
                    .map(g -> g.getName())
                    .collect(Collectors.joining(", "));
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