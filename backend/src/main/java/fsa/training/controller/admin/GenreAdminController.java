package fsa.training.controller.admin;

import fsa.training.entity.Genre;
import fsa.training.service.movie.GenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

@Controller
@RequestMapping("/admin/genres")
public class GenreAdminController {

    @Autowired
    private GenreService genreService;

    @GetMapping
    public String list(@RequestParam(value = "q", required = false) String query,
                       @RequestParam(value = "page", defaultValue = "0") int page,
                       @RequestParam(value = "size", defaultValue = "10") int size,
                       Model model) {
        Page<Genre> pageData = genreService.searchGenres(query, page, size);
        model.addAttribute("genres", pageData.getContent());
        model.addAttribute("query", query);
        model.addAttribute("page", pageData);
        model.addAttribute("basePath", "/admin/genres");
        model.addAttribute("pageTitle", "Quản lý Thể loại");
        return "admin/genre/list";
    }

    @GetMapping("/archived")
    public String archived(@RequestParam(value = "page", defaultValue = "0") int page,
                           @RequestParam(value = "size", defaultValue = "10") int size,
                           Model model) {
        Page<Genre> deleted = genreService.getDeletedGenres(page, size);
        model.addAttribute("genres", deleted.getContent());
        model.addAttribute("page", deleted);
        model.addAttribute("basePath", "/admin/genres/archived");
        model.addAttribute("archived", true);
        model.addAttribute("pageTitle", "Thể loại đã xóa");
        return "admin/genre/list";
    }

    @GetMapping("/create")
    public String createForm(Model model) {
        model.addAttribute("genre", new Genre());
        model.addAttribute("pageTitle", "Thêm thể loại");
        return "admin/genre/form";
    }

    @PostMapping
    public String create(@ModelAttribute("genre") Genre genre, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("pageTitle", "Thêm thể loại");
            return "admin/genre/form";
        }
        genreService.saveGenre(genre);
        return "redirect:/admin/genres";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable("id") Long id, Model model) {
        return genreService.getGenreById(id)
            .map(genre -> {
                model.addAttribute("genre", genre);
                model.addAttribute("pageTitle", "Sửa thể loại");
                return "admin/genre/form";
            })
            .orElse("redirect:/admin/genres");
    }

    @PostMapping("/{id}")
    public String update(@PathVariable("id") Long id, @ModelAttribute("genre") Genre genre, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("pageTitle", "Sửa thể loại");
            return "admin/genre/form";
        }
        genre.setId(id);
        genreService.saveGenre(genre);
        return "redirect:/admin/genres";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable("id") Long id) {
        genreService.deleteGenre(id);
        return "redirect:/admin/genres";
    }

    @PostMapping("/{id}/restore")
    public String restore(@PathVariable("id") Long id) {
        genreService.restoreGenre(id);
        return "redirect:/admin/genres/archived";
    }
}


