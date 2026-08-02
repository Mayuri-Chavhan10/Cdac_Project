package com.seedsanskriti.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.Delivery;
import com.seedsanskriti.entity.Order;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

	Optional<Delivery> findByOrder(Order order);
}