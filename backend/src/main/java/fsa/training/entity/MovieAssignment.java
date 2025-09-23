package fsa.training.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "movie_assignment", uniqueConstraints = @UniqueConstraint(columnNames = {"movie_id", "theater_id"}))
public class MovieAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(name = "active_from")
    private LocalDate activeFrom;

    @Column(name = "active_to")
    private LocalDate activeTo;

    @Column(name = "formats", length = 255)
    private String formats;

    @Column(name = "languages", length = 255)
    private String languages;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }
    public LocalDate getActiveFrom() { return activeFrom; }
    public void setActiveFrom(LocalDate activeFrom) { this.activeFrom = activeFrom; }
    public LocalDate getActiveTo() { return activeTo; }
    public void setActiveTo(LocalDate activeTo) { this.activeTo = activeTo; }
    public String getFormats() { return formats; }
    public void setFormats(String formats) { this.formats = formats; }
    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
}


