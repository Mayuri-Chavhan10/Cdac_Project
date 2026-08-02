package com.seedsanskriti.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.seedsanskriti.payment.entity.Payment;
import com.seedsanskriti.payment.enums.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);

    List<Payment> findByUserIdOrderByPaymentDateDesc(Long userId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = :status")
    double sumAmountByPaymentStatus(@Param("status") PaymentStatus status);
}
