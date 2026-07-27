package com.seedsanskriti.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seedsanskriti.entity.PasswordResetToken;
import com.seedsanskriti.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(User user);
}
