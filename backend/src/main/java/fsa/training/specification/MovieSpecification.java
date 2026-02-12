package fsa.training.specification;

import fsa.training.entity.Movie;
import fsa.training.entity.MovieRequest;
import fsa.training.entity.Showtime;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;

import java.time.LocalDate;
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
            // Ensure distinct results when joining
            query.distinct(true);
            Join<Object, Object> genreJoin = root.join("genres", JoinType.INNER);
            return criteriaBuilder.like(
                criteriaBuilder.lower(genreJoin.get("name")),
                "%" + genre.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Movie> isComingSoon(LocalDate today) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.greaterThan(root.get("releaseDate"), today);
    }

    public static Specification<Movie> isNowShowing(LocalDate today) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            // Subquery for MovieRequest
            Subquery<MovieRequest> movieRequestSubquery = query.subquery(MovieRequest.class);
            Root<MovieRequest> movieRequestRoot = movieRequestSubquery.from(MovieRequest.class);
            movieRequestSubquery.select(movieRequestRoot)
                .where(
                    criteriaBuilder.equal(movieRequestRoot.get("movie"), root), // Correlated subquery
                    criteriaBuilder.equal(movieRequestRoot.get("status"), "PUBLISHED")
                );

            // Subquery for Showtime
            Subquery<Showtime> showtimeSubquery = query.subquery(Showtime.class);
            Root<Showtime> showtimeRoot = showtimeSubquery.from(Showtime.class);
            showtimeSubquery.select(showtimeRoot)
                .where(
                    criteriaBuilder.equal(showtimeRoot.get("movie"), root), // Correlated subquery
                    criteriaBuilder.greaterThanOrEqualTo(showtimeRoot.get("showDate"), today)
                );

            // The movie must exist in both contexts
            return criteriaBuilder.and(
                criteriaBuilder.exists(movieRequestSubquery),
                criteriaBuilder.exists(showtimeSubquery)
            );
        };
    }
}