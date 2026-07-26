package com.seedsanskriti.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.Cart;
import com.seedsanskriti.entity.CartItem;
import com.seedsanskriti.entity.Product;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

	List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    void deleteByCart(Cart cart);
}
