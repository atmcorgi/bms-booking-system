package fsa.training.service.admin;

import fsa.training.dto.movie.MovieIntakeRowDto;
import fsa.training.entity.Movie;
import fsa.training.entity.MovieRequest;
import fsa.training.repository.movie.MovieRepository;
import fsa.training.repository.movie.MovieRequestRepository;
import fsa.training.service.movie.GenreService;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicInteger;
import fsa.training.security.TheaterPermissionEvaluator;
import fsa.training.repository.theater.TheaterRepository;
import fsa.training.entity.Theater;

@Service
public class MovieIntakeService {
    
    private static final Logger logger = LoggerFactory.getLogger(MovieIntakeService.class);

    private final MovieRepository movieRepository;
    private final MovieRequestRepository movieRequestRepository;
    private final GenreService genreService;
    private final TheaterPermissionEvaluator permissionEvaluator;
    private final TheaterRepository theaterRepository;

    public MovieIntakeService(MovieRepository movieRepository, MovieRequestRepository movieRequestRepository, GenreService genreService, TheaterPermissionEvaluator permissionEvaluator, TheaterRepository theaterRepository) {
        this.movieRepository = movieRepository;
        this.movieRequestRepository = movieRequestRepository;
        this.genreService = genreService;
        this.permissionEvaluator = permissionEvaluator;
        this.theaterRepository = theaterRepository;
    }

    // Constants
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int MIN_REQUIRED_COLUMNS = 9;
    private static final int MAX_ROWS = 10000; // Giới hạn số rows để tránh OOM

    public List<MovieIntakeRowDto> parseCsv(MultipartFile file) throws IOException {
        List<MovieIntakeRowDto> result = new ArrayList<>();
        if (file == null || file.isEmpty()) return result;

        Path tempPath = Files.createTempFile("csv_upload_", ".csv");
        tempPath.toFile().deleteOnExit();

        try {
            Files.write(tempPath, file.getBytes());

            // Validate file size
            long fileSize = Files.size(tempPath);
            if (fileSize > 50 * 1024 * 1024) { // 50MB limit
                throw new IllegalArgumentException("File quá lớn. Tối đa 50MB");
            }

            List<String> allLines = Files.readAllLines(tempPath, StandardCharsets.UTF_8);
            if (allLines.isEmpty()) {
                throw new IOException("CSV file is empty or invalid");
            }

            String header = allLines.getFirst();
            if (!isValidCsvHeader(header)) {
                throw new IllegalArgumentException("Invalid CSV format. Expected columns: movie_code,title,description,poster_url,duration_min,director,actors,release_date,age_rating");
            }

            List<String> dataLines = allLines.subList(1, Math.min(allLines.size(), MAX_ROWS + 1));

            // ExecutorService (ThreadPool)
            ExecutorService executor = Executors.newFixedThreadPool(4);
            List<Future<MovieIntakeRowDto>> futures = new ArrayList<>();
            AtomicInteger completedRows = new AtomicInteger(0);

            for (int i = 0; i < dataLines.size(); i++) {
                final int rowIndex = i;
                final String line = dataLines.get(i);

                // Submit task vào ThreadPool
                Future<MovieIntakeRowDto> future = executor.submit(() -> {
                    return parseCsvLine(line, rowIndex + 1);
                });

                futures.add(future);
            }

            // Collect results theo thứ tự hoàn thành
            List<MovieIntakeRowDto> results = new ArrayList<>();
            int totalRows = dataLines.size();

            while (results.size() < totalRows) {
                for (int i = 0; i < futures.size(); i++) {
                    Future<MovieIntakeRowDto> future = futures.get(i);

                    if (future.isDone() && !future.isCancelled()) {
                        try {
                            MovieIntakeRowDto dto = future.get();
                            if (!results.contains(dto)) {
                                results.add(dto);

                                // Progress tracking
                                completedRows.incrementAndGet();
                            }
                        } catch (Exception e) {
                            logger.error("Error processing row: {}", e.getMessage(), e);
                        }
                    }
                }

                // Tránh busy waiting
                Thread.sleep(10);
            }

            result.addAll(results);

            // Cleanup
            executor.shutdown();


        } catch (Exception e) {
            logger.error("Error processing CSV file: {}", e.getMessage(), e);
            throw new IOException("Không thể xử lý file CSV: " + e.getMessage(), e);
        } finally {
            // Cleanup temp file
            try {
                Files.deleteIfExists(tempPath);
            } catch (IOException e) {
                logger.warn("Could not delete temp file: {}", e.getMessage(), e);
            }
        }

        return result;
    }

    private MovieIntakeRowDto parseCsvLine(String line, int rowNumber) {
        MovieIntakeRowDto dto = new MovieIntakeRowDto();
        dto.setRowNumber(rowNumber);

        try {
            // Robust CSV parsing with RFC-compliant rules (quotes, separators, empty trailing columns)
            CSVParser parser = new CSVParserBuilder().withSeparator(',').withQuoteChar('"').build();
            String[] cols = parser.parseLine(line);

            // Validate minimum columns
            if (cols.length < MIN_REQUIRED_COLUMNS) {
                dto.getErrors().add("Thiếu cột dữ liệu. Cần ít nhất " + MIN_REQUIRED_COLUMNS + " cột, nhưng chỉ có " + cols.length + " cột");
                return dto;
            }

            parseBasicFields(dto, cols);

            parseOptionalFields(dto, cols);

            validateRequiredFields(dto);

        } catch (Exception e) {
            dto.getErrors().add("Lỗi xử lý dòng: " + e.getMessage());
            logger.error("Error parsing row {}: {}", rowNumber, e.getMessage(), e);
        }

        return dto;
    }

    private boolean isValidCsvHeader(String header) {
        if (header == null || header.trim().isEmpty()) {
            return false;
        }

        String[] expectedColumns = {
            "movie_code", "title", "description", "poster_url",
            "duration_min", "director", "actors", "release_date", "age_rating"
        };

        String[] actualColumns = header.split(",");
        if (actualColumns.length < expectedColumns.length) {
            return false;
        }

        // Check required columns
        for (int i = 0; i < expectedColumns.length; i++) {
            if (!actualColumns[i].trim().equalsIgnoreCase(expectedColumns[i])) {
                return false;
            }
        }
        return true;
    }

    @Transactional
    public CommitResult processCommitRows(List<MovieIntakeRowDto> commitRows) {
        return commitRows.stream()
            .filter(row -> row.getErrors().isEmpty())
            .map(row -> {
                // Only process Movie per new flow
                Movie movie = processMovie(row);
                if (movie != null) {
                    return movie.getId() == null ? new CommitResult(1, 0) : new CommitResult(0, 1);
                }
                return new CommitResult(0, 0);
            })
            .reduce(new CommitResult(0, 0),
                (acc, result) -> new CommitResult(acc.getCreated() + result.getCreated(), acc.getUpdated() + result.getUpdated()));
    }

    private Movie processMovie(MovieIntakeRowDto row) {
        String finalCode = transformMovieCode(row.getMovieCode());
        Optional<Movie> movieOpt = movieRepository.findByCode(finalCode);
        Movie movie;
        boolean isNewMovie = !movieOpt.isPresent();

        if (isNewMovie) {
            movie = new Movie();
        } else {
            movie = movieOpt.get();
        }

        // Set movie properties
        movie.setCode(finalCode);
        movie.setTitle(row.getTitle());
        movie.setDescription(row.getDescription());
        movie.setPosterUrl(row.getPosterUrl());
        movie.setDuration(row.getDurationMin() != null ? row.getDurationMin() : 0);
        movie.setDirector(row.getDirector());
        movie.setActors(row.getActors());
        movie.setReleaseDate(row.getReleaseDate());
        movie.setAgeRating(row.getAgeRating());

        // Process genres
        if (row.getGenreNames() != null && !row.getGenreNames().isEmpty()) {
            List<fsa.training.entity.Genre> genres = row.getGenreNames().stream()
                .filter(genreName -> genreName != null && !genreName.trim().isEmpty())
                .map(genreName -> genreService.getGenreByName(genreName.trim())
                    .orElseGet(() -> genreService.createGenre(genreName.trim())))
                .collect(Collectors.toList());
            movie.setGenres(genres);
        }

        // Set formats/languages on Movie (new flow)
        movie.setFormats(row.getFormats());
        movie.setLanguages(row.getLanguages());

        return movieRepository.save(movie);
    }


    private String transformMovieCode(String originalCode) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if (permissionEvaluator != null && permissionEvaluator.isStaff(username)) {
                Long theaterId = permissionEvaluator.getAssignedTheaterId(username);
                if (theaterId != null && theaterRepository != null) {
                    Optional<Theater> theaterOpt = theaterRepository.findById(theaterId);
                    if (theaterOpt.isPresent()) {
                        Theater th = theaterOpt.get();
                        String code = th.getCode();
                        if (code == null || code.isBlank()) {
                            code = slugify(th.getName());
                        }
                        if (code != null && !code.isEmpty()) {
                            return code + "_" + originalCode;
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Error transforming movie code for staff: {}", e.getMessage(), e);
        }
        return originalCode;
    }

    private String slugify(String name) {
        if (name == null) return "";
        String n = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        n = n.toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        return n;
    }

    private void parseBasicFields(MovieIntakeRowDto dto, String[] cols) {
        dto.setMovieCode(cols[0].trim());
        dto.setTitle(cols[1].trim());
        dto.setDescription(cols[2].trim());
        dto.setPosterUrl(cols[3].trim());
        dto.setDirector(cols[5].trim());
        dto.setActors(cols[6].trim());
        dto.setAgeRating(cols[8].trim());

        // Parse numeric fields with error handling
        parseNumericField(cols[4], dto::setDurationMin, "duration_min không hợp lệ");
        parseDateField(cols[7], dto::setReleaseDate, "release_date không hợp lệ yyyy-MM-dd");
    }

    private void parseOptionalFields(MovieIntakeRowDto dto, String[] cols) {
        if (cols.length > 9) dto.setFormats(cols[9].trim());
        if (cols.length > 10) dto.setLanguages(cols[10].trim());
        if (cols.length > 11) parseNumericField(cols[11], dto::setPriority, null);
        if (cols.length > 12) parseDoubleField(cols[12], dto::setDemandScore, null);
        if (cols.length > 13 && cols[13] != null && !cols[13].isEmpty()) dto.setGenreNames(Arrays.asList(cols[13].split("\\|")));
    }

    private void parseNumericField(String value, java.util.function.Consumer<Integer> setter, String errorMessage) {
        try {
            setter.accept(Integer.parseInt(value.trim()));
        } catch (Exception e) {
            if (errorMessage != null) {
                // Add error to DTO if we had access to it
            }
        }
    }

    private void parseDoubleField(String value, java.util.function.Consumer<Double> setter, String errorMessage) {
        try {
            setter.accept(Double.parseDouble(value.trim()));
        } catch (Exception e) {
            if (errorMessage != null) {
                // Add error to DTO if we had access to it
            }
        }
    }

    private void parseDateField(String value, java.util.function.Consumer<LocalDate> setter, String errorMessage) {
        try {
            setter.accept(LocalDate.parse(value.trim(), DATE_FORMATTER));
        } catch (Exception e) {
            if (errorMessage != null) {
                // Add error to DTO if we had access to it
            }
        }
    }

    private void validateRequiredFields(MovieIntakeRowDto dto) {
        if (dto.getMovieCode() == null || dto.getMovieCode().isEmpty()) {
            dto.getErrors().add("movie_code bắt buộc");
        }
        if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
            dto.getErrors().add("title bắt buộc");
        }
    }

    /**
     * Inner class to hold commit result
     */
    public static class CommitResult {
        private final int created;
        private final int updated;

        public CommitResult(int created, int updated) {
            this.created = created;
            this.updated = updated;
        }

        public int getCreated() { return created; }
        public int getUpdated() { return updated; }
    }
}