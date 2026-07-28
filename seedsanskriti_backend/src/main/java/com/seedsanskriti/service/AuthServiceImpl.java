package com.seedsanskriti.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.seedsanskriti.dto.ForgotPasswordRequest;
import com.seedsanskriti.dto.LoginRequest;
import com.seedsanskriti.dto.RegisiterCustomerRequest;
import com.seedsanskriti.dto.RegisterSupplierRequest;
import com.seedsanskriti.dto.ResetPasswordRequest;
import com.seedsanskriti.entity.PasswordResetToken;
import com.seedsanskriti.entity.Supplier;
import com.seedsanskriti.entity.User;
import com.seedsanskriti.enums.Role;
import com.seedsanskriti.enums.SupplierStatus;
import com.seedsanskriti.enums.UserStatus;
import com.seedsanskriti.repository.PasswordResetTokenRepository;
import com.seedsanskriti.repository.SupplierRepository;
import com.seedsanskriti.repository.UserRepository;
import com.seedsanskriti.security.JwtUtil;
import com.seedsanskriti.util.MailService;

import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
	
	private final UserRepository userRepository;
	private final SupplierRepository supplierRepository;
	private final PasswordEncoder passwordEncoder;
	 private final JwtUtil jwtUtil;
	 private final PasswordResetTokenRepository passwordResetTokenRepository;
	 private final MailService mailService;

	 @Value("${app.password-reset.token-expiry-minutes:30}")
	 private int tokenExpiryMinutes;

	 @Value("${app.frontend.reset-password-url:http://localhost:3000/reset-password}")
	 private String resetPasswordUrl;

	@Override
	public String registerCustomer(RegisiterCustomerRequest request) {
		
		if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered");
        }
		
		User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

       
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setPincode(request.getPincode());

        user.setRole(Role.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);

        return "Customer registered successfully";
	}
	

	@Override
	@Transactional
	public String registerSupplier(RegisterSupplierRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
	        throw new ResponseStatusException(
	                HttpStatus.CONFLICT,
	                "Email already registered");
	    }

	    User user = new User();
	    user.setName(request.getName());
	    user.setEmail(request.getEmail());
	    user.setPassword(passwordEncoder.encode(request.getPassword()));
	    user.setPhoneNumber(request.getPhoneNumber());
	    user.setAddress(request.getAddress());
	    user.setCity(request.getCity());
	    user.setPincode(request.getPincode());
	    user.setRole(Role.SUPPLIER);
	    user.setStatus(UserStatus.ACTIVE);

	    User savedUser = userRepository.save(user);

	    Supplier supplier = new Supplier();
	    supplier.setBusinessName(request.getBusinessName());
	    supplier.setGstNumber(request.getGstNumber());
	    supplier.setSupplierStatus(SupplierStatus.PENDING);
	    supplier.setUser(savedUser);

	    supplierRepository.save(supplier);

	    return "Supplier registered successfully";
	}
	
	@Override
	public String login(LoginRequest request) {

	    User user = userRepository.findByEmail(request.getEmail())
	            .orElseThrow(() ->
	                    new ResponseStatusException(
	                            HttpStatus.UNAUTHORIZED,
	                            "Invalid email or password"));

	    if (!passwordEncoder.matches(
	            request.getPassword(),
	            user.getPassword())) {

	        // Use the same generic message as "user not found" above so we
	        // don't leak which part (email vs password) was wrong.
	        throw new ResponseStatusException(
	                HttpStatus.UNAUTHORIZED,
	                "Invalid email or password");
	    }

	    if (user.getStatus() != UserStatus.ACTIVE) {
	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "Your account is " + user.getStatus().toString().toLowerCase()
	                        + ". Please contact support.");
	    }

	    String token = jwtUtil.generateToken(user.getEmail());

	    return token;
	}

	@Override
	@Transactional
	public String forgotPassword(ForgotPasswordRequest request) {

	    // Always return the same generic message whether or not the email
	    // exists, so this endpoint can't be used to check which emails are
	    // registered.
	    String genericMessage =
	            "If an account exists for that email, a password reset link has been sent";

	    User user = userRepository.findByEmail(request.getEmail()).orElse(null);

	    if (user == null) {
	        log.debug("Password reset requested for unknown email");
	        return genericMessage;
	    }

	    // Invalidate any previous outstanding tokens for this user before
	    // issuing a new one.
	    passwordResetTokenRepository.deleteByUser(user);

	    PasswordResetToken resetToken = new PasswordResetToken();
	    resetToken.setUser(user);
	    resetToken.setToken(UUID.randomUUID().toString());
	    resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpiryMinutes));
	    resetToken.setUsed(false);

	    passwordResetTokenRepository.save(resetToken);

	    String resetLink = resetPasswordUrl + "?token=" + resetToken.getToken();

	    String plainTextBody = "We received a request to reset your password. This link expires in "
	            + tokenExpiryMinutes + " minutes:\n\n" + resetLink
	            + "\n\nIf you didn't request this, you can safely ignore this email.";

	    mailService.sendHtml(
	            user.getEmail(),
	            "Reset your SeedSanskriti password",
	            buildPasswordResetHtml(user.getName(), resetLink, tokenExpiryMinutes),
	            plainTextBody);

	    return genericMessage;
	}

	/**
	 * Simple, self-contained (inline-styled, no external assets) HTML email
	 * template for the password-reset link. Kept inline rather than pulled
	 * from a templating engine since the project has no Thymeleaf/Freemarker
	 * dependency and this is the only templated email the app sends.
	 */
	private String buildPasswordResetHtml(String userName, String resetLink, int expiryMinutes) {
	    String safeName = (userName == null || userName.isBlank()) ? "there" : userName;
	    return "<!DOCTYPE html>"
	            + "<html><body style=\"margin:0;padding:0;background-color:#f4f1ea;font-family:'Segoe UI',Arial,sans-serif;\">"
	            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f1ea;padding:32px 0;\">"
	            + "<tr><td align=\"center\">"
	            + "<table role=\"presentation\" width=\"480\" cellpadding=\"0\" cellspacing=\"0\" "
	            + "style=\"background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);\">"
	            + "<tr><td style=\"background-color:#2f6f4f;padding:24px 32px;\">"
	            + "<span style=\"color:#ffffff;font-size:20px;font-weight:600;\">&#127793; SeedSanskriti</span>"
	            + "</td></tr>"
	            + "<tr><td style=\"padding:32px;\">"
	            + "<h1 style=\"margin:0 0 16px;font-size:20px;color:#2c2c2c;\">Reset your password</h1>"
	            + "<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a4a4a;\">Hi " + safeName + ",</p>"
	            + "<p style=\"margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;\">"
	            + "We received a request to reset the password for your SeedSanskriti account. "
	            + "Click the button below to choose a new password. This link will expire in "
	            + expiryMinutes + " minutes.</p>"
	            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\">"
	            + "<tr><td style=\"border-radius:8px;background-color:#c96f4a;\">"
	            + "<a href=\"" + resetLink + "\" target=\"_blank\" "
	            + "style=\"display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;\">"
	            + "Reset Password</a>"
	            + "</td></tr></table>"
	            + "<p style=\"margin:24px 0 0;font-size:13px;line-height:1.6;color:#8a8a8a;\">"
	            + "If the button doesn't work, copy and paste this link into your browser:<br>"
	            + "<a href=\"" + resetLink + "\" style=\"color:#2f6f4f;word-break:break-all;\">" + resetLink + "</a></p>"
	            + "<p style=\"margin:24px 0 0;font-size:13px;line-height:1.6;color:#8a8a8a;\">"
	            + "If you didn't request a password reset, you can safely ignore this email - "
	            + "your password will remain unchanged.</p>"
	            + "</td></tr>"
	            + "<tr><td style=\"background-color:#f4f1ea;padding:20px 32px;text-align:center;\">"
	            + "<span style=\"font-size:12px;color:#a0a0a0;\">&copy; " + java.time.Year.now()
	            + " SeedSanskriti. All rights reserved.</span>"
	            + "</td></tr>"
	            + "</table>"
	            + "</td></tr>"
	            + "</table>"
	            + "</body></html>";
	}

	@Override
	@Transactional
	public String resetPassword(ResetPasswordRequest request) {

	    PasswordResetToken resetToken = passwordResetTokenRepository
	            .findByToken(request.getToken())
	            .orElseThrow(() -> new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    "Invalid or expired reset token"));

	    if (resetToken.isUsed()) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "This reset link has already been used");
	    }

	    if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "This reset link has expired. Please request a new one");
	    }

	    User user = resetToken.getUser();
	    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
	    userRepository.save(user);

	    resetToken.setUsed(true);
	    passwordResetTokenRepository.save(resetToken);

	    return "Password reset successfully. You can now log in with your new password";
	}

}
