package com.example.bookfair.util;

import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;

@Service
public class EmailService {
    @Autowired private JavaMailSender mailSender;

    public void sendSimpleEmail(String to, String subject, String text){
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        // mailSender.send(msg); // configure mail properties in application.properties
    }
}
