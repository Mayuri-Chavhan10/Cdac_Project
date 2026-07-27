package com.seedsanskriti.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order,Long>{

	List<Order> findByUserId(Long userId);

	List<Order> findByUser(User user);

	long countByOrderStatus(OrderStatus status);
}
