package fsa.training.service.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
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
}

