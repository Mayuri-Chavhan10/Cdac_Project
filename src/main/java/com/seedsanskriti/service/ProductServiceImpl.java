package com.seedsanskriti.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import com.seedsanskriti.dto.AddProductRequest;
import com.seedsanskriti.dto.PagedResponse;
import com.seedsanskriti.dto.ProductResponse;
import com.seedsanskriti.dto.UpdateProductRequest;  
import com.seedsanskriti.entity.Product;
import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.Category;
import com.seedsanskriti.enums.SupplierStatus;
import com.seedsanskriti.repository.ProductRepository;
import com.seedsanskriti.repository.ReviewRepository;
import com.seedsanskriti.repository.SupplierRepository;
import com.seedsanskriti.repository.UserRepository;
import com.seedsanskriti.specification.ProductSpecifications;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService{
	
	private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public String addProduct(AddProductRequest request,
                             Authentication authentication) {

        // Logged-in user's email
        String email = authentication.getName();

        // Find User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Find Supplier
        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));

        // Only suppliers approved by an admin may list products
        if (supplier.getSupplierStatus() != SupplierStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your supplier account is not yet approved");
        }

        // Create Product
        Product product = new Product();

        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());

        product.setSupplier(supplier);

        productRepository.save(product);

        return "Product Added Successfully";
    }

	@Override
	public List<ProductResponse> getAllProducts() {
		 List<Product> products = productRepository.findAll();

		    return products.stream()
		            .map(this::mapToResponse)
		            .toList();
	}

	@Override
	public ProductResponse getProductById(Long id) {

	   

	    Product product = productRepository.findById(id)
	    		.orElseThrow(() ->
	    	    new ResponseStatusException(
	    	        HttpStatus.NOT_FOUND,
	    	        "Product not found"));
	           

	    

	    return mapToResponse(product);
	}

	@Override
	public String updateProduct(Long productId, UpdateProductRequest request, Authentication authentication) {
		
		// Logged-in user's email
	    String email = authentication.getName();
	    
	 // Find User
	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

	    // Find Supplier
	    Supplier supplier = supplierRepository.findByUser(user)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));
	    
	 // Find Product
	    Product product = productRepository.findById(productId)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

	    // Check ownership
	    if (!product.getSupplier().getId().equals(supplier.getId())) {
	        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this product");
	    }
	    
	    
	 // Update fields
	    product.setProductName(request.getProductName());
	    product.setDescription(request.getDescription());
	    product.setPrice(request.getPrice());
	    product.setStock(request.getStock());
	    product.setImageUrl(request.getImageUrl());

	    productRepository.save(product);

	    return "Product updated successfully";
	}

	@Override
	public String deleteProduct(Long productId, Authentication authentication) {
		
		// Logged-in user's email
	    String email = authentication.getName();

	    // Find User
	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

	    // Find Supplier
	    Supplier supplier = supplierRepository.findByUser(user)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));

	    // Find Product
	    Product product = productRepository.findById(productId)
	    		.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

	    // Check ownership
	    if (!product.getSupplier().getId().equals(supplier.getId())) {
	    	throw new ResponseStatusException(
	    	        HttpStatus.FORBIDDEN,
	    	        "You are not authorized to delete this product");
	    }
	    
	    productRepository.delete(product);

	    return "Product deleted successfully";
	}

	@Override
	public List<ProductResponse> getSupplierProducts(Authentication authentication) {
		 String email = authentication.getName();

		 Supplier supplier = supplierRepository.findByUserEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));

		    List<Product> products = productRepository.findBySupplier(supplier);

		    return products.stream()
		            .map(this::mapToResponse)
		            .toList();
	}
	
	@Override
	public PagedResponse<ProductResponse> searchProducts(
			String keyword,
			Category category,
			Double minPrice,
			Double maxPrice,
			Boolean inStockOnly,
			int page,
			int size,
			String sortBy,
			String sortDir) {

		int safePage = Math.max(page, 0);
		int safeSize = size <= 0 ? 12 : Math.min(size, 100);

		String sortProperty = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
		Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
				? Sort.Direction.DESC
				: Sort.Direction.ASC;

		PageRequest pageRequest = PageRequest.of(
				safePage, safeSize, Sort.by(direction, sortProperty));

		Page<Product> productPage = productRepository.findAll(
				ProductSpecifications.withFilters(
						keyword, category, minPrice, maxPrice, inStockOnly),
				pageRequest);

		List<ProductResponse> content = productPage.getContent()
				.stream()
				.map(this::mapToResponse)
				.toList();

		return new PagedResponse<>(
				content,
				productPage.getNumber(),
				productPage.getSize(),
				productPage.getTotalElements(),
				productPage.getTotalPages(),
				productPage.isLast());
	}

	@Override
	public List<Category> getCategories() {
		return Arrays.asList(Category.values());
	}

	private ProductResponse mapToResponse(Product product) {

	    double averageRating = reviewRepository.findAverageRatingByProduct(product);
	    long reviewCount = reviewRepository.countByProduct(product);

	    return ProductResponse.builder()
	            .id(product.getId())
	            .productName(product.getProductName())
	            .description(product.getDescription())
	            .price(product.getPrice())
	            .stock(product.getStock())
	            .imageUrl(product.getImageUrl())
	            .category(product.getCategory())
	            .supplierName(product.getSupplier().getBusinessName())
	            .averageRating(Math.round(averageRating * 10.0) / 10.0)
	            .reviewCount(reviewCount)
	            .build();
	}

}
