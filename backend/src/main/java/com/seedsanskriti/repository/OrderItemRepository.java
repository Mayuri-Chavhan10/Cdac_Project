package com.seedsanskriti.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.OrderItem;
import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.OrderStatus;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
	
	List<OrderItem> findByOrder(Order order);
	
	List<OrderItem> findByProductSupplier(Supplier supplier);

	@Query("select count(oi) > 0 from OrderItem oi " +
			"where oi.order.user = :user " +
			"and oi.product = :product " +
			"and oi.order.orderStatus = :status")
	boolean existsByUserAndProductAndOrderStatus(
			@Param("user") User user,
			@Param("product") Product product,
			@Param("status") OrderStatus status);

}
