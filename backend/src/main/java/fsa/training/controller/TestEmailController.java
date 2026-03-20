package fsa.training.controller;

import fsa.training.service.mail.MailService;
import fsa.training.service.mail.TicketEmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestEmailController {

    private final TicketEmailService ticketEmailService;
    private final MailService mailService;

    public TestEmailController(TicketEmailService ticketEmailService, MailService mailService) {
        this.ticketEmailService = ticketEmailService;
        this.mailService = mailService;
    }

    @GetMapping("/send-test-email")
    public String sendTestEmail(@RequestParam(defaultValue = "phamthanhtrung178@gmail.com") String email) {
        System.out.println("=== TEST EMAIL ENDPOINT CALLED ===");
        System.out.println("Email: " + email);
        
        try {
            // Test gửi email đơn giản trước (không có attachment)
            mailService.sendMail(email, "Test Simple Email", "<h1>Test</h1><p>This is a test email without attachment.</p>");
            System.out.println("Simple email sent");
            
            // Sau đó test với QR code
            if (ticketEmailService == null) {
                System.err.println("ERROR: TicketEmailService is NULL!");
                return "Error: TicketEmailService is null";
            }
            
            // Tạo một booking giả để test
            fsa.training.entity.Booking testBooking = new fsa.training.entity.Booking();
            testBooking.setPaymentCode("TEST" + System.currentTimeMillis());
            testBooking.setEmail(email);
            
            // Set các thông tin giả
            fsa.training.entity.Showtime testShowtime = new fsa.training.entity.Showtime();
            
            fsa.training.entity.Movie testMovie = new fsa.training.entity.Movie();
            testMovie.setTitle("AVATAR: THE WAY OF WATER");
            testShowtime.setMovie(testMovie);
            
            fsa.training.entity.Theater testTheater = new fsa.training.entity.Theater();
            testTheater.setName("MyCinema Hà Nội");
            testShowtime.setTheater(testTheater);
            
            fsa.training.entity.Room testRoom = new fsa.training.entity.Room();
            testRoom.setName("Phòng 1");
            testShowtime.setRoom(testRoom);
            
            testShowtime.setShowDate(java.time.LocalDate.now().plusDays(1));
            testShowtime.setShowTime(java.time.LocalTime.of(19, 30));
            
            testBooking.setShowtime(testShowtime);
            
            fsa.training.entity.Seat testSeat = new fsa.training.entity.Seat();
            testSeat.setSeatNumber("A5");
            testSeat.setSeatType(fsa.training.entity.SeatType.STANDARD);
            testBooking.setSeat(testSeat);
            
            System.out.println("Calling ticketEmailService.sendTicketEmail...");
            ticketEmailService.sendTicketEmail(testBooking);
            System.out.println("ticketEmailService.sendTicketEmail() completed");
            
            return "Test emails sent to: " + email + ". Check your inbox (including spam)!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
