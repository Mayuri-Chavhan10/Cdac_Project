package com.seedsanskriti.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.seedsanskriti.entity.Order;
import com.seedsanskriti.entity.Payment;
import com.seedsanskriti.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment,Long>{
	
	    Optional<Payment> findByOrder(Order order);

	    List<Payment> findByOrderUserId(Long userId);

	    @Query("select coalesce(sum(p.amount), 0.0) from Payment p where p.paymentStatus = :status")
	    Double sumAmountByPaymentStatus(@Param("status") PaymentStatus status);

}
