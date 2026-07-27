package com.seedsanskriti.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Thin wrapper around JavaMailSender so the rest of the app doesn't need to
 * know whether real SMTP credentials have been configured.
 *
 * When app.mail.enabled=false (the default until real SMTP credentials are
 * supplied via environment variables), emails are logged instead of sent -
 * this keeps password-reset and other notification flows fully functional
 * in local/dev environments with zero mail server setup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:no-reply@seedsanskriti.com}")
    private String fromAddress;

    public void send(String to, String subject, String body) {

        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Would send email to {} | subject: {} | body: {}",
                    to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

        } catch (Exception e) {
            // Never let a mail failure break the calling flow (e.g. a
            // password reset should still succeed even if the email
            // provider is temporarily down) - just log it.
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
