package com.seedsanskriti.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Review;
import com.seedsanskriti.entity.User;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductOrderByCreatedAtDesc(Product product);

    Optional<Review> findByProductAndUser(Product product, User user);

    long countByProduct(Product product);

    @Query("select coalesce(avg(r.rating), 0.0) from Review r where r.product = :product")
    Double findAverageRatingByProduct(@Param("product") Product product);
}
