package fsa.training.service.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class MailService {

    private final JavaMailSender mailSender;
    
    @Value("${mail.from.address}")
    private String fromAddress;
    
    @Value("${mail.from.name:CineManager}")
    private String fromName;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendMail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = html
            
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendMailWithAttachment(String toEmail, String subject, String htmlContent, byte[] attachmentData, String attachmentName, String attachmentMimeType) {
        try {
            System.out.println("=== SENDING EMAIL WITH ATTACHMENT ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: " + subject);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = html
            
            // Add QR code as inline attachment using CID reference
            ByteArrayResource resource = new ByteArrayResource(attachmentData);
            helper.addInline("qrcode", resource, attachmentMimeType);
            
            mailSender.send(message);
            System.out.println("Email with QR attachment sent successfully to: " + toEmail);
            System.out.println("=== EMAIL SENT ===");
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}

