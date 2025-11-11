package com.example.bookfair.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        // Only create bean if username is configured and not placeholder
        // Check if credentials are valid (not empty and not placeholder values)
        boolean hasValidCredentials = username != null && 
            !username.isEmpty() && 
            !username.equals("your_email@gmail.com") && 
            password != null && 
            !password.isEmpty() && 
            !password.equals("your_app_password_or_password");
        
        if (!hasValidCredentials) {
            // Return a no-op implementation that won't fail but won't send emails
            return new NoOpJavaMailSender();
        }
        
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        props.put("mail.debug", "false");

        return mailSender;
    }
    
    // No-op implementation for when mail is not configured
    private static class NoOpJavaMailSender extends JavaMailSenderImpl {
        private static final Logger logger = LoggerFactory.getLogger(NoOpJavaMailSender.class);
        
        @Override
        public void send(org.springframework.mail.SimpleMailMessage simpleMessage) {
            String recipient = simpleMessage != null && simpleMessage.getTo() != null && simpleMessage.getTo().length > 0 
                ? simpleMessage.getTo()[0] : "unknown";
            logger.info("Email service not configured - email would be sent to: {}", recipient);
        }
        
        @Override
        public void send(org.springframework.mail.SimpleMailMessage... simpleMessages) {
            for (org.springframework.mail.SimpleMailMessage msg : simpleMessages) {
                send(msg);
            }
        }
        
        @Override
        public void send(jakarta.mail.internet.MimeMessage mimeMessage) {
            try {
                String[] recipients = mimeMessage.getAllRecipients() != null 
                    ? java.util.Arrays.stream(mimeMessage.getAllRecipients())
                        .map(r -> r.toString())
                        .toArray(String[]::new)
                    : new String[]{"unknown"};
                logger.info("Email service not configured - email would be sent to: {}", String.join(", ", recipients));
            } catch (Exception e) {
                logger.warn("Email service not configured - email sending skipped: {}", e.getMessage());
            }
        }
        
        @Override
        public void send(jakarta.mail.internet.MimeMessage... mimeMessages) {
            for (jakarta.mail.internet.MimeMessage msg : mimeMessages) {
                send(msg);
            }
        }
    }
}

