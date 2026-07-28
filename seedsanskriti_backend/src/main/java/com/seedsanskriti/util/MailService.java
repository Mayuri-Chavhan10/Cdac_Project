package com.seedsanskriti.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
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

    /**
     * Plain-text email. Kept for any simple/internal notifications that
     * don't need a styled template.
     */
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

        } catch (MailException e) {
            // Never let a mail failure break the calling flow (e.g. a
            // password reset should still succeed even if the email
            // provider is temporarily down) - just log it.
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * HTML email (e.g. the password-reset link) with a plain-text fallback
     * for mail clients that don't render HTML. Same fail-safe behaviour as
     * send(): a mail/SMTP failure is logged, never thrown, so it can't break
     * whatever flow triggered the email.
     */
    public void sendHtml(String to, String subject, String htmlBody, String plainTextFallback) {

        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Would send HTML email to {} | subject: {} | body: {}",
                    to, subject, plainTextFallback);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainTextFallback, htmlBody);

            mailSender.send(mimeMessage);

        } catch (MessagingException | MailException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }
}
