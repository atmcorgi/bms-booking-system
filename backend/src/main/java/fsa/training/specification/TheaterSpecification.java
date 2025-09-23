package fsa.training.specification;

import fsa.training.entity.Theater;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

public class TheaterSpecification {

    public static Specification<Theater> withLatitudeRange(Double minLat, Double maxLat) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (minLat != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("latitude"),
                    minLat
                ));
            }
            
            if (maxLat != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("latitude"),
                    maxLat
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Theater> withLongitudeRange(Double minLon, Double maxLon) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (minLon != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("longitude"),
                    minLon
                ));
            }
            
            if (maxLon != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("longitude"),
                    maxLon
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
