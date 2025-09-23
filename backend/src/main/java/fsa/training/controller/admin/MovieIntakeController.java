package fsa.training.controller.admin;

import fsa.training.dto.movie.MovieIntakeRowDto;
import fsa.training.service.admin.MovieIntakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Admin Movie Intake Controller - CSV import for ADMIN
 */
@Controller
@RequestMapping("/admin/movie/intake")
public class MovieIntakeController {

    // Constants
    private static final String SESSION_PREFIX = "adminMovieIntake:";

    @Autowired
    private MovieIntakeService movieIntakeService;

    @GetMapping({"", "/", "/upload"})
    public String uploadForm(Model model) {
        model.addAttribute("pageTitle", "Nhập phim từ CSV - Admin");
        return "admin/movie/intake-form";
    }

    @PostMapping("/preview")
    public String preview(@RequestParam("file") MultipartFile file, Model model, HttpSession session) throws IOException {
        List<MovieIntakeRowDto> rows = movieIntakeService.parseCsv(file);
        String token = UUID.randomUUID().toString();
        session.setAttribute(SESSION_PREFIX + token, rows);
        return "redirect:/admin/movie/intake/preview?token=" + token;
    }
    
    @GetMapping("/preview")
    public String previewPaginated(@RequestParam("token") String token,
                                   @RequestParam(value = "page", defaultValue = "0") int page,
                                   @RequestParam(value = "size", defaultValue = "20") int size,
                                   Model model, HttpSession session) {
        @SuppressWarnings("unchecked")
        List<MovieIntakeRowDto> rows = (List<MovieIntakeRowDto>) session.getAttribute(SESSION_PREFIX + token);
        
        if (rows == null) {
            model.addAttribute("error", "Session expired. Please upload again.");
            return "admin/movie/intake-form";
        }
        
        // Create pagination
        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), rows.size());
        Page<MovieIntakeRowDto> pageRows = new PageImpl<>(rows.subList(start, end), pageable, rows.size());
        
        model.addAttribute("rows", pageRows.getContent());
        model.addAttribute("page", pageRows);
        model.addAttribute("token", token);
        model.addAttribute("pageTitle", "Xem trước dữ liệu phim - Admin");
        return "admin/movie/intake-preview";
    }

    @PostMapping("/commit")
    public String commit(@RequestParam("token") String token,
                         @RequestParam(value = "selected", required = false) List<Integer> selected,
                         Model model,
                         HttpSession session) {
        @SuppressWarnings("unchecked")
        List<MovieIntakeRowDto> rows = (List<MovieIntakeRowDto>) session.getAttribute(SESSION_PREFIX + token);
        
        if (rows == null) {
            model.addAttribute("summary", "Session expired. Vui lòng upload lại.");
            model.addAttribute("pageTitle", "Kết quả nhập dữ liệu - Admin");
            return "admin/movie/intake-result";
        }

        Set<Integer> selectedSet = selected != null ? selected.stream().collect(Collectors.toSet()) : null;
        List<MovieIntakeRowDto> commitRows = rows.stream()
                .filter(r -> r.getErrors() == null || r.getErrors().isEmpty())
                .filter(r -> selectedSet == null || selectedSet.contains(r.getRowNumber()))
                .collect(Collectors.toList());

        MovieIntakeService.CommitResult result = movieIntakeService.processCommitRows(commitRows);
        
        session.removeAttribute(SESSION_PREFIX + token);
        model.addAttribute("summary", String.format("Created: %d, Updated: %d, Skipped invalid: %d", 
                result.getCreated(), result.getUpdated(), rows.size() - commitRows.size()));
        model.addAttribute("pageTitle", "Kết quả nhập dữ liệu - Admin");
        return "admin/movie/intake-result";
    }
}
