package com.seedsanskriti.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.enums.Category;

public interface ProductRepository extends JpaRepository<Product,Long>, JpaSpecificationExecutor<Product>{

	List<Product> findByCategory(Category category);
	
	List<Product> findBySupplier(Supplier supplier);
}
