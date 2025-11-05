package com.example.bookfair.util;

import com.example.bookfair.user.model.Reservation;
import com.example.bookfair.user.model.Stall;
import com.example.bookfair.user.model.User;
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
    
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendReservationConfirmation(User user, Stall stall, Reservation reservation, String qrCodePath) {
        if (mailSender == null || fromEmail.isEmpty()) {
            System.out.println("Email service not configured. Would send email to: " + user.getEmail());
            System.out.println("Subject: Reservation Confirmation - Colombo International Bookfair");
            System.out.println("Stall: " + stall.getName() + " (" + stall.getSize() + ")");
            System.out.println("QR Code: " + qrCodePath);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Reservation Confirmation - Colombo International Bookfair");

            String htmlContent = buildEmailContent(user, stall, reservation);
            helper.setText(htmlContent, true);

            // Attach QR code
            File qrFile = new File(qrCodePath);
            if (qrFile.exists()) {
                helper.addAttachment("qr-code.png", qrFile);
            }

            mailSender.send(message);
            System.out.println("Confirmation email sent to: " + user.getEmail());
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildEmailContent(User user, Stall stall, Reservation reservation) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
                "<h2>Reservation Confirmed!</h2>" +
                "<p>Dear " + user.getUsername() + ",</p>" +
                "<p>Your stall reservation for the Colombo International Bookfair has been confirmed.</p>" +
                "<h3>Reservation Details:</h3>" +
                "<ul>" +
                "<li><strong>Stall Name:</strong> " + stall.getName() + "</li>" +
                "<li><strong>Stall Size:</strong> " + stall.getSize() + "</li>" +
                "<li><strong>Reservation ID:</strong> " + reservation.getId() + "</li>" +
                "<li><strong>Reservation Date:</strong> " + reservation.getCreatedAt() + "</li>" +
                "</ul>" +
                "<p>Your unique QR code is attached to this email. Please download and save it as it will be required for entry to the exhibition premises.</p>" +
                "<p>We look forward to seeing you at the bookfair!</p>" +
                "<p>Best regards,<br>Colombo International Bookfair Team</p>" +
                "</body></html>";
    }
}
