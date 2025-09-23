package fsa.training.specification;

import fsa.training.entity.Showtime;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.time.LocalDate;

public class ShowtimeSpecification {

    public static Specification<Showtime> withMovie(Long movieId) {
        return (root, query, criteriaBuilder) -> {
            if (movieId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> movieJoin = root.join("movie", JoinType.INNER);
            return criteriaBuilder.equal(movieJoin.get("id"), movieId);
        };
    }

    public static Specification<Showtime> withTheater(Long theaterId) {
        return (root, query, criteriaBuilder) -> {
            if (theaterId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> theaterJoin = root.join("theater", JoinType.INNER);
            return criteriaBuilder.equal(theaterJoin.get("id"), theaterId);
        };
    }

    public static Specification<Showtime> withShowDate(LocalDate showDate) {
        return (root, query, criteriaBuilder) -> {
            if (showDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("showDate"), showDate);
        };
    }
}
