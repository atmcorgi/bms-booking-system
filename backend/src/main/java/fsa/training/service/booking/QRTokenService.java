package fsa.training.service.booking;

import fsa.training.entity.Booking;
import fsa.training.repository.booking.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class QRTokenService {

    private final BookingRepository bookingRepository;
    
    @Value("${app.qr.secret:default_secret_key_for_qr_signing}")
    private String qrSecret;
    
    @Value("${app.qr.expiry-hours:48}")
    private int qrExpiryHours;

    public QRTokenService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Generate a signed QR token for a booking
     * Format: paymentCode|timestamp|signature
     */
    public String generateQRToken(Booking booking) {
        long timestamp = Instant.now().toEpochMilli();
        String data = booking.getPaymentCode() + "|" + timestamp;
        String signature = generateHmacSha256(data);
        
        return data + "|" + signature;
    }

    /**
     * Validate QR token and mark as used
     * Returns: ValidationResult with status and message
     */
    public ValidationResult validateAndUseToken(String qrData) {
        if (qrData == null || qrData.isBlank()) {
            return new ValidationResult(false, "INVALID", "QR data is empty");
        }
        
        String[] parts = qrData.split("\\|");
        if (parts.length != 3) {
            return new ValidationResult(false, "INVALID", "Invalid QR format");
        }
        
        String paymentCode = parts[0];
        long timestamp;
        String signature = parts[2];
        
        try {
            timestamp = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            return new ValidationResult(false, "INVALID", "Invalid timestamp");
        }
        
        // Verify signature
        String data = paymentCode + "|" + timestamp;
        String expectedSignature = generateHmacSha256(data);
        if (!signature.equals(expectedSignature)) {
            return new ValidationResult(false, "INVALID", "Invalid signature");
        }
        
        // Check expiry (48 hours default)
        long now = Instant.now().toEpochMilli();
        long expiryMs = qrExpiryHours * 60 * 60 * 1000L;
        if (now - timestamp > expiryMs) {
            return new ValidationResult(false, "EXPIRED", "QR code has expired");
        }
        
        // Find booking by payment code
        var bookings = bookingRepository.findByPaymentCode(paymentCode);
        if (bookings.isEmpty()) {
            return new ValidationResult(false, "NOT_FOUND", "Booking not found");
        }
        
        Booking booking = bookings.get(0);
        
        // Check if already used
        if (Boolean.TRUE.equals(booking.getUsed())) {
            return new ValidationResult(false, "ALREADY_USED", 
                "Ticket already used at " + booking.getUsedAt());
        }
        
        // Check if paid
        if (!"PAID".equals(booking.getStatus())) {
            return new ValidationResult(false, "NOT_PAID", "Booking not paid");
        }
        
        // Mark as used
        booking.setUsed(true);
        booking.setUsedAt(Instant.now());
        bookingRepository.save(booking);
        
        // Return success with booking info
        String showInfo = "";
        if (booking.getShowtime() != null) {
            if (booking.getShowtime().getMovie() != null) {
                showInfo = booking.getShowtime().getMovie().getTitle();
            }
            if (booking.getShowtime().getShowDate() != null) {
                showInfo += " | " + booking.getShowtime().getShowDate();
            }
            if (booking.getShowtime().getShowTime() != null) {
                showInfo += " " + booking.getShowtime().getShowTime();
            }
        }
        
        String seatInfo = "";
        if (booking.getSeat() != null) {
            seatInfo = "Ghế: " + booking.getSeat().getSeatNumber();
        }
        
        return new ValidationResult(true, "SUCCESS", 
            "Check-in successful!", 
            booking.getCustomerName(),
            showInfo,
            seatInfo);
    }

    /**
     * Validate QR token WITHOUT marking as used (for preview/checking)
     */
    public ValidationResult validateTokenOnly(String qrData) {
        if (qrData == null || qrData.isBlank()) {
            return new ValidationResult(false, "INVALID", "QR data is empty");
        }
        
        String[] parts = qrData.split("\\|");
        if (parts.length != 3) {
            return new ValidationResult(false, "INVALID", "Invalid QR format");
        }
        
        String paymentCode = parts[0];
        long timestamp;
        String signature = parts[2];
        
        try {
            timestamp = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            return new ValidationResult(false, "INVALID", "Invalid timestamp");
        }
        
        // Verify signature
        String data = paymentCode + "|" + timestamp;
        String expectedSignature = generateHmacSha256(data);
        if (!signature.equals(expectedSignature)) {
            return new ValidationResult(false, "INVALID", "Invalid signature");
        }
        
        // Find booking
        var bookings = bookingRepository.findByPaymentCode(paymentCode);
        if (bookings.isEmpty()) {
            return new ValidationResult(false, "NOT_FOUND", "Booking not found");
        }
        
        Booking booking = bookings.get(0);
        
        if (!"PAID".equals(booking.getStatus())) {
            return new ValidationResult(false, "NOT_PAID", "Booking not paid");
        }
        
        if (Boolean.TRUE.equals(booking.getUsed())) {
            return new ValidationResult(false, "ALREADY_USED", "Ticket already used");
        }
        
        return new ValidationResult(true, "VALID", "Valid ticket", booking.getCustomerName());
    }

    private String generateHmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                qrSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC", e);
        }
    }

    // Inner class for validation result
    public static class ValidationResult {
        private final boolean valid;
        private final String status;
        private final String message;
        private final String customerName;
        private final String showInfo;
        private final String seatInfo;
        
        public ValidationResult(boolean valid, String status, String message) {
            this.valid = valid;
            this.status = status;
            this.message = message;
            this.customerName = null;
            this.showInfo = null;
            this.seatInfo = null;
        }
        
        public ValidationResult(boolean valid, String status, String message, String customerName) {
            this.valid = valid;
            this.status = status;
            this.message = message;
            this.customerName = customerName;
            this.showInfo = null;
            this.seatInfo = null;
        }
        
        public ValidationResult(boolean valid, String status, String message, 
                              String customerName, String showInfo, String seatInfo) {
            this.valid = valid;
            this.status = status;
            this.message = message;
            this.customerName = customerName;
            this.showInfo = showInfo;
            this.seatInfo = seatInfo;
        }
        
        public boolean isValid() { return valid; }
        public String getStatus() { return status; }
        public String getMessage() { return message; }
        public String getCustomerName() { return customerName; }
        public String getShowInfo() { return showInfo; }
        public String getSeatInfo() { return seatInfo; }
    }
}
