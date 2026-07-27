package com.seedsanskriti.config;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.Role;
import com.seedsanskriti.enums.UserStatus;
import com.seedsanskriti.repository.UserRepository;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {

        return args -> {
            if (!userRepository.existsByEmail("admin@seedsanskriti.com")) {

                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@seedsanskriti.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setPhoneNumber("9999999999");
                admin.setAddress("Pune");
                admin.setCity("Pune");
                admin.setPincode("411001");
                admin.setRole(Role.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);

                userRepository.save(admin);
            }
        };
    }
}