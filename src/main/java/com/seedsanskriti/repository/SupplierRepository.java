package com.seedsanskriti.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.SupplierStatus;

public interface SupplierRepository extends JpaRepository<Supplier,Long>{
	
	Optional<Supplier> findByUser(User user);
	 Optional<Supplier> findByUserEmail(String email);

	 long countBySupplierStatus(SupplierStatus status);

}
