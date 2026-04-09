package fsa.training.controller;

import fsa.training.service.booking.QRTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TicketValidationController {

    private final QRTokenService qrTokenService;

    public TicketValidationController(QRTokenService qrTokenService) {
        this.qrTokenService = qrTokenService;
    }

    /**
     * Validate QR code and check-in (mark as used)
     * POST /api/ticket/validate
     * Body: { "qrData": "BMSxxx|timestamp|signature" }
     */
    @PostMapping("/ticket/validate")
    public ResponseEntity<?> validateTicket(@RequestBody Map<String, String> request) {
        String qrData = request.get("qrData");
        
        if (qrData == null || qrData.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "status", "INVALID",
                "message", "QR data is required"
            ));
        }
        
        QRTokenService.ValidationResult result = qrTokenService.validateAndUseToken(qrData);
        
        return ResponseEntity.ok(Map.of(
            "success", result.isValid(),
            "status", result.getStatus(),
            "message", result.getMessage(),
            "customerName", result.getCustomerName() != null ? result.getCustomerName() : "",
            "showInfo", result.getShowInfo() != null ? result.getShowInfo() : "",
            "seatInfo", result.getSeatInfo() != null ? result.getSeatInfo() : ""
        ));
    }

    /**
     * Check ticket validity (without marking as used)
     * POST /api/ticket/check
     * Body: { "qrData": "BMSxxx|timestamp|signature" }
     */
    @PostMapping("/ticket/check")
    public ResponseEntity<?> checkTicket(@RequestBody Map<String, String> request) {
        String qrData = request.get("qrData");
        
        if (qrData == null || qrData.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "status", "INVALID",
                "message", "QR data is required"
            ));
        }
        
        QRTokenService.ValidationResult result = qrTokenService.validateTokenOnly(qrData);
        
        return ResponseEntity.ok(Map.of(
            "success", result.isValid(),
            "status", result.getStatus(),
            "message", result.getMessage(),
            "customerName", result.getCustomerName() != null ? result.getCustomerName() : ""
        ));
    }
}
