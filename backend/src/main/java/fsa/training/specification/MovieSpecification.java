package fsa.training.specification;

import fsa.training.entity.Movie;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;

import java.util.List;

public class MovieSpecification {

    public static Specification<Movie> withKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String searchTerm = "%" + keyword.toLowerCase() + "%";

            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchTerm),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("director")), searchTerm),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchTerm)
            );
        };
    }

    public static Specification<Movie> withYear(Integer year) {
        return (root, query, criteriaBuilder) -> {
            if (year == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.function("YEAR", Integer.class, root.get("releaseDate")),
                year
            );
        };
    }

    public static Specification<Movie> withYears(List<Integer> years) {
        return (root, query, criteriaBuilder) -> {
            if (years == null || years.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.function("YEAR", Integer.class, root.get("releaseDate")).in(years);
        };
    }

    public static Specification<Movie> withGenre(String genre) {
        return (root, query, criteriaBuilder) -> {
            if (genre == null || genre.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> genreJoin = root.join("genres", JoinType.LEFT);
            return criteriaBuilder.like(
                criteriaBuilder.lower(genreJoin.get("name")),
                "%" + genre.toLowerCase() + "%"
            );
        };
    }
}