package com.seedsanskriti.specification;

import org.springframework.data.jpa.domain.Specification;

import com.seedsanskriti.entity.Product;
import com.seedsanskriti.enums.Category;

/**
 * Builds dynamic JPA Specifications for product search/filtering so the
 * catalog endpoint can combine keyword, category, and price-range filters
 * without needing a hand-written query for every combination.
 */
public class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> withFilters(
            String keyword,
            Category category,
            Double minPrice,
            Double maxPrice,
            Boolean inStockOnly) {

        return (root, query, cb) -> {

            var predicates = cb.conjunction();

            if (keyword != null && !keyword.isBlank()) {
                String likePattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates = cb.and(predicates,
                        cb.or(
                                cb.like(cb.lower(root.get("productName")), likePattern),
                                cb.like(cb.lower(root.get("description")), likePattern)
                        ));
            }

            if (category != null) {
                predicates = cb.and(predicates, cb.equal(root.get("category"), category));
            }

            if (minPrice != null) {
                predicates = cb.and(predicates, cb.ge(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates = cb.and(predicates, cb.le(root.get("price"), maxPrice));
            }

            if (Boolean.TRUE.equals(inStockOnly)) {
                predicates = cb.and(predicates, cb.greaterThan(root.get("stock"), 0));
            }

            return predicates;
        };
    }
}
