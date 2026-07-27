package com.seedsanskriti.entity;

import com.seedsanskriti.enums.Role;
import com.seedsanskriti.enums.UserStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity{
	
	 @Column(name = "name", nullable = false, length = 50)
	    private String Name;

	    @Column(nullable = false, unique = true, length = 100)
	    private String email;

	    @Column(nullable = false)
	    private String password;

	    @Column(name = "phone_number", unique = true, length = 15)
	    private String phoneNumber;

	    @Column(length = 255)
	    private String address;
	    
	    @Column(name = "city", nullable = false,length = 50)
	    private String city;
	    
	    @Column(name = "pincode", nullable = false, length = 12)
	    private String pincode;

	    @Enumerated(EnumType.STRING)
	    private Role role;

	    @Enumerated(EnumType.STRING)
	    private UserStatus status;
	

}
