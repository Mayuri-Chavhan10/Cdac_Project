package com.seedsanskriti.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;

import com.seedsanskriti.dto.AddProductRequest;
import com.seedsanskriti.dto.PagedResponse;
import com.seedsanskriti.dto.ProductResponse;
import com.seedsanskriti.dto.UpdateProductRequest;
import com.seedsanskriti.enums.Category;
import com.seedsanskriti.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;
	
	
	 @PostMapping
	 @PreAuthorize("hasRole('SUPPLIER')")
	    public ResponseEntity<String> addProduct(
	            @Valid @RequestBody AddProductRequest request,
	            Authentication authentication) {

	        return ResponseEntity.status(HttpStatus.CREATED).body(
	                productService.addProduct(request, authentication));
	        
	       
	    }
	 
	 
	 @GetMapping
	 public ResponseEntity<List<ProductResponse>> getAllProducts() {

	     return ResponseEntity.ok(productService.getAllProducts());
	 }

	 // Catalog search/filter/pagination - e.g.
	 // /api/products/search?keyword=tomato&category=VEGETABLE_SEEDS&minPrice=10&maxPrice=200&inStock=true&page=0&size=12&sortBy=price&sortDir=asc
	 @GetMapping("/search")
	 public ResponseEntity<PagedResponse<ProductResponse>> searchProducts(
	         @RequestParam(required = false) String keyword,
	         @RequestParam(required = false) Category category,
	         @RequestParam(required = false) Double minPrice,
	         @RequestParam(required = false) Double maxPrice,
	         @RequestParam(required = false) Boolean inStock,
	         @RequestParam(defaultValue = "0") int page,
	         @RequestParam(defaultValue = "12") int size,
	         @RequestParam(defaultValue = "id") String sortBy,
	         @RequestParam(defaultValue = "asc") String sortDir) {

	     return ResponseEntity.ok(productService.searchProducts(
	             keyword, category, minPrice, maxPrice, inStock,
	             page, size, sortBy, sortDir));
	 }

	 @GetMapping("/categories")
	 public ResponseEntity<List<Category>> getCategories() {

	     return ResponseEntity.ok(productService.getCategories());
	 }
	 
	 
	 @GetMapping("/{id}")
	 public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {

	     return ResponseEntity.ok(productService.getProductById(id));
	 }
	 
	 @PutMapping("/{id}")
	 @PreAuthorize("hasRole('SUPPLIER')")
	 public ResponseEntity<String> updateProduct(
	         @PathVariable Long id,
	         @Valid @RequestBody UpdateProductRequest request,
	         Authentication authentication) {

	     return ResponseEntity.ok(
	             productService.updateProduct(id, request, authentication));
	 }
	 
	 @DeleteMapping("/{id}")
	 @PreAuthorize("hasRole('SUPPLIER')")
	 public ResponseEntity<String> deleteProduct(
	         @PathVariable Long id,
	         Authentication authentication) {

	     return ResponseEntity.ok(
	             productService.deleteProduct(id, authentication));
	 }
	 
}
