package com.seedsanskriti.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.Role;

public interface UserRepository extends JpaRepository<User,Long>{

	Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);
}
