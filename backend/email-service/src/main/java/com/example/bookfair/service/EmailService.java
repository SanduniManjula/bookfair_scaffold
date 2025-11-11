package com.example.bookfair.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.File;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    // Fallback to a default email if not configured
    private String getFromEmail() {
        return fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "noreply@bookfair.com";
    }

    public void sendWelcomeEmail(String email, String username) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            logger.info("Email service not configured. Would send welcome email to: {}", email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(getFromEmail());
            helper.setTo(email);
            helper.setSubject("Welcome to Colombo International Bookfair");

            String htmlContent = buildWelcomeEmailContent(username, email);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Welcome email sent successfully to: {}", email);
        } catch (MessagingException e) {
            logger.error("Failed to send welcome email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendReservationRequestEmail(String email, String username, String stallName, String stallSize, Long reservationId, String createdAt) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            logger.info("Email service not configured. Would send reservation request email to: {} for stall: {} ({})", 
                    email, stallName, stallSize);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(getFromEmail());
            helper.setTo(email);
            helper.setSubject("Reservation Request Received - Colombo International Bookfair");

            String htmlContent = buildReservationRequestEmailContent(username, stallName, stallSize, reservationId, createdAt);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Reservation request email sent successfully to: {} for reservation ID: {}", email, reservationId);
        } catch (MessagingException e) {
            logger.error("Failed to send reservation request email to {} for reservation ID {}: {}", 
                    email, reservationId, e.getMessage(), e);
            throw new RuntimeException("Failed to send reservation request email", e);
        }
    }

    public void sendReservationConfirmation(String email, String username, String stallName, String stallSize, Long reservationId, String createdAt, String qrCodePath) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            logger.info("Email service not configured. Would send confirmation email to: {} for stall: {} ({}) with QR: {}", 
                    email, stallName, stallSize, qrCodePath);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(getFromEmail());
            helper.setTo(email);
            helper.setSubject("Reservation Confirmation - Colombo International Bookfair");

            String htmlContent = buildReservationConfirmationContent(username, stallName, stallSize, reservationId, createdAt);
            helper.setText(htmlContent, true);

            // Attach QR code if provided
            if (qrCodePath != null && !qrCodePath.isEmpty()) {
                File qrFile = new File(qrCodePath);
                if (qrFile.exists()) {
                    helper.addAttachment("qr-code.png", qrFile);
                    logger.debug("QR code attached to confirmation email: {}", qrCodePath);
                } else {
                    logger.warn("QR code file not found: {}", qrCodePath);
                }
            }

            mailSender.send(message);
            logger.info("Confirmation email sent successfully to: {} for reservation ID: {}", email, reservationId);
        } catch (MessagingException e) {
            logger.error("Failed to send confirmation email to {} for reservation ID {}: {}", 
                    email, reservationId, e.getMessage(), e);
            throw new RuntimeException("Failed to send confirmation email", e);
        }
    }

    private String buildWelcomeEmailContent(String username, String email) {
        return "<html><body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>" +
                "<h2 style='color: #0070f3; text-align: center;'>Welcome to Colombo International Bookfair!</h2>" +
                "<p>Dear " + username + ",</p>" +
                "<p>Thank you for registering with the Colombo International Bookfair reservation system. We're excited to have you join us!</p>" +
                "<h3 style='color: #333;'>Your Account Details:</h3>" +
                "<ul style='line-height: 1.8;'>" +
                "<li><strong>Email:</strong> " + email + "</li>" +
                "<li><strong>Business Name:</strong> " + username + "</li>" +
                "</ul>" +
                "<p>You can now:</p>" +
                "<ul style='line-height: 1.8;'>" +
                "<li>Browse available stalls on the interactive map</li>" +
                "<li>Reserve up to 3 stalls for the bookfair</li>" +
                "<li>Manage your reservations through your dashboard</li>" +
                "</ul>" +
                "<p style='margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;'>If you have any questions, please don't hesitate to contact us.</p>" +
                "<p>We look forward to seeing you at the bookfair!</p>" +
                "<p style='margin-top: 30px;'>Best regards,<br><strong>Colombo International Bookfair Team</strong></p>" +
                "</div></body></html>";
    }

    private String buildReservationRequestEmailContent(String username, String stallName, String stallSize, Long reservationId, String createdAt) {
        return "<html><body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>" +
                "<h2 style='color: #0070f3; text-align: center;'>Reservation Request Received</h2>" +
                "<p>Dear " + username + ",</p>" +
                "<p>We have received your reservation request for the Colombo International Bookfair.</p>" +
                "<h3 style='color: #333;'>Reservation Details:</h3>" +
                "<ul style='line-height: 1.8;'>" +
                "<li><strong>Reservation ID:</strong> " + reservationId + "</li>" +
                "<li><strong>Stall Name:</strong> " + stallName + "</li>" +
                "<li><strong>Stall Size:</strong> " + stallSize + "</li>" +
                "<li><strong>Request Date:</strong> " + createdAt + "</li>" +
                "</ul>" +
                "<p style='background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;'>" +
                "Your reservation is being processed. You will receive a confirmation email shortly with your QR code.</p>" +
                "<p style='margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;'>If you have any questions, please contact us.</p>" +
                "<p>Best regards,<br><strong>Colombo International Bookfair Team</strong></p>" +
                "</div></body></html>";
    }

    private String buildReservationConfirmationContent(String username, String stallName, String stallSize, Long reservationId, String createdAt) {
        return "<html><body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>" +
                "<h2 style='color: #4caf50; text-align: center;'>Reservation Confirmed!</h2>" +
                "<p>Dear " + username + ",</p>" +
                "<p>Your stall reservation for the Colombo International Bookfair has been <strong style='color: #4caf50;'>confirmed</strong>.</p>" +
                "<h3 style='color: #333;'>Reservation Details:</h3>" +
                "<ul style='line-height: 1.8;'>" +
                "<li><strong>Reservation ID:</strong> " + reservationId + "</li>" +
                "<li><strong>Stall Name:</strong> " + stallName + "</li>" +
                "<li><strong>Stall Size:</strong> " + stallSize + "</li>" +
                "<li><strong>Reservation Date:</strong> " + createdAt + "</li>" +
                "</ul>" +
                "<p style='background-color: #d4edda; padding: 15px; border-left: 4px solid #4caf50; border-radius: 4px;'>" +
                "<strong>Important:</strong> Your unique QR code is attached to this email. Please download and save it as it will be required for entry to the exhibition premises.</p>" +
                "<p>Please arrive at the venue with your QR code ready for scanning.</p>" +
                "<p style='margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;'>We look forward to seeing you at the bookfair!</p>" +
                "<p>Best regards,<br><strong>Colombo International Bookfair Team</strong></p>" +
                "</div></body></html>";
    }
}

