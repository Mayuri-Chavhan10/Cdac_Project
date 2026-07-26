package com.seedsanskriti.entity;



import com.seedsanskriti.enums.Category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product  extends BaseEntity {

	  @Column(name = "product_name", nullable = false)
	    private String productName;

	    @Column(name = "description")
	    private String description;

	    @Column(name = "price", nullable = false)
	    private double price;

	    @Column(name = "stock", nullable = false)
	    private Integer stock;

	    @Column(name = "image_url")
	    private String imageUrl;

	    @ManyToOne
	    @JoinColumn(name = "supplier_id", nullable = false)
	    private Supplier supplier;

	    @Enumerated(EnumType.STRING)
	    @Column(name = "category", nullable = false)
	    private Category category;
}
