package com.seedsanskriti.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.entity.WishlistItem;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUser(User user);

    Optional<WishlistItem> findByUserAndProduct(User user, Product product);

    boolean existsByUserAndProduct(User user, Product product);

    void deleteByUserAndProduct(User user, Product product);
}
