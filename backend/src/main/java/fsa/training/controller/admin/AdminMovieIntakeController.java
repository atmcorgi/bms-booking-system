package fsa.training.controller.admin;

import fsa.training.dto.movie.MovieIntakeRowDto;
import fsa.training.service.admin.MovieIntakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Admin Movie Intake Controller - REST API for React frontend
 */
@RestController
@RequestMapping("/api/admin/movies")
public class AdminMovieIntakeController {

    @Autowired
    private MovieIntakeService movieIntakeService;

    /**
     * Preview CSV import - returns parsed rows with validation
     */
    @PostMapping("/import/preview")
    public ResponseEntity<?> previewImport(@RequestParam("file") MultipartFile file) {
        try {
            List<MovieIntakeRowDto> rows = movieIntakeService.parseCsv(file);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("total", rows.size());
            response.put("errorCount", rows.stream().mapToLong(r -> r.getErrors().size()).sum());
            List<Map<String, Object>> responseRows = rows.stream().map(row -> {
                Map<String, Object> rowMap = new java.util.HashMap<>();
                rowMap.put("line", row.getRowNumber());
                Map<String, Object> dataMap = new java.util.HashMap<>();
                dataMap.put("code", row.getMovieCode());
                dataMap.put("title", row.getTitle());
                dataMap.put("description", row.getDescription());
                dataMap.put("posterUrl", row.getPosterUrl());
                dataMap.put("duration", row.getDurationMin());
                dataMap.put("director", row.getDirector());
                dataMap.put("actors", row.getActors());
                dataMap.put("releaseDate", row.getReleaseDate());
                dataMap.put("ageRating", row.getAgeRating());
                dataMap.put("formats", row.getFormats());
                dataMap.put("languages", row.getLanguages());
                dataMap.put("priority", row.getPriority());
                dataMap.put("demandScore", row.getDemandScore());
                dataMap.put("genres", row.getGenreNames());
                dataMap.put("allowedTheaters", row.getAllowedTheaters());
                dataMap.put("trailerUrl", row.getTrailerUrl());
                dataMap.put("youtubeUrl", row.getYoutubeUrl());
                rowMap.put("data", dataMap);
                rowMap.put("errors", row.getErrors());
                rowMap.put("warnings", List.of());
                return rowMap;
            }).collect(java.util.stream.Collectors.toList());
            response.put("rows", responseRows);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể đọc file CSV: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi xử lý file: " + e.getMessage()));
        }
    }

    /**
     * Confirm CSV import - processes selected rows
     */
    @PostMapping("/import/confirm")
    public ResponseEntity<?> confirmImport(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rows = (List<Map<String, Object>>) request.get("rows");
            if (rows == null || rows.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không có dữ liệu để import"));
            }
            List<MovieIntakeRowDto> commitRows = rows.stream()
                .map(rowData -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) rowData.get("data");
                    MovieIntakeRowDto dto = new MovieIntakeRowDto();
                    // line number
                    Object ln = rowData.get("line");
                    if (ln instanceof Number) dto.setRowNumber(((Number) ln).intValue());
                    // required fields
                    dto.setMovieCode(asString(data.get("code")));
                    dto.setTitle(asString(data.get("title")));
                    dto.setDescription(asString(data.get("description")));
                    dto.setPosterUrl(asString(data.get("posterUrl")));
                    dto.setDirector(asString(data.get("director")));
                    dto.setActors(asString(data.get("actors")));
                    dto.setAgeRating(asString(data.get("ageRating")));
                    // numeric/date
                    Integer dur = asInteger(data.get("duration"));
                    dto.setDurationMin(dur);
                    dto.setReleaseDate(data.get("releaseDate") != null ?
                        java.time.LocalDate.parse(data.get("releaseDate").toString()) : null);
                    // optional extras
                    dto.setFormats(asString(data.get("formats")));
                    dto.setLanguages(asString(data.get("languages")));
                    dto.setPriority(asInteger(data.get("priority")));
                    dto.setDemandScore(asDouble(data.get("demandScore")));
                    dto.setTrailerUrl(asString(data.get("trailerUrl")));
                    dto.setYoutubeUrl(asString(data.get("youtubeUrl")));
                    @SuppressWarnings("unchecked")
                    List<String> genres = (List<String>) data.get("genres");
                    dto.setGenreNames(genres != null ? genres : List.of());
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
            MovieIntakeService.CommitResult result = movieIntakeService.processCommitRows(commitRows);
            return ResponseEntity.ok(Map.of(
                "imported", result.getCreated(),
                "updated", result.getUpdated(),
                "skipped", commitRows.size() - result.getCreated() - result.getUpdated()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi import: " + e.getMessage()));
        }
    }

    private static String asString(Object v) {
        return v == null ? null : v.toString();
    }

    private static Integer asInteger(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return null; }
    }

    private static Double asDouble(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return null; }
    }
}


