package com.seedsanskriti.service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.seedsanskriti.dto.AddProductRequest;
import com.seedsanskriti.dto.PagedResponse;
import com.seedsanskriti.dto.ProductResponse;
import com.seedsanskriti.dto.UpdateProductRequest;
import com.seedsanskriti.enums.Category;

public interface ProductService {
	
	 String addProduct(AddProductRequest request,
             Authentication authentication);
	 
	 List<ProductResponse> getAllProducts();
	 
	 ProductResponse getProductById(Long id);
	 
	 String updateProduct(Long productId,
             UpdateProductRequest request,
             Authentication authentication);
	 
	 String deleteProduct(Long productId, Authentication authentication);

	 List<ProductResponse> getSupplierProducts(Authentication authentication);

	 PagedResponse<ProductResponse> searchProducts(
			 String keyword,
			 Category category,
			 Double minPrice,
			 Double maxPrice,
			 Boolean inStockOnly,
			 int page,
			 int size,
			 String sortBy,
			 String sortDir);

	 List<Category> getCategories();

}
