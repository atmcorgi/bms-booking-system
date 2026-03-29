package fsa.training.service.mail;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import fsa.training.entity.Booking;
import fsa.training.entity.Showtime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;
import fsa.training.repository.booking.BookingRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class TicketEmailService {

    private final MailService mailService;
    private final BookingRepository bookingRepository;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    public TicketEmailService(MailService mailService, BookingRepository bookingRepository) {
        this.mailService = mailService;
        this.bookingRepository = bookingRepository;
    }

    @Async
    @Transactional(readOnly = true)
    public void sendTicketEmail(Booking bookingParam) {
        // Fetch to avoid lazy init exception
        Booking booking = bookingRepository.findById(bookingParam.getId()).orElse(null);
        if (booking == null) return;
        if (booking.getEmail() == null || booking.getEmail().isBlank()) {
            System.out.println("No email for booking " + booking.getId() + ", skipping ticket email");
            return;
        }

        try {
            byte[] qrCodeImage = generateQRCodeImage(booking.getPaymentCode());
            String html = buildTicketEmailHtml(booking);
            
            mailService.sendMailWithAttachment(
                booking.getEmail(), 
                "Vé xem phim - MyCinema", 
                html, 
                qrCodeImage, 
                "qrcode.png",
                "image/png"
            );
            System.out.println("Ticket email sent to: " + booking.getEmail() + " for booking: " + booking.getId());
        } catch (Exception e) {
            System.err.println("Failed to send ticket email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    @Transactional(readOnly = true)
    public void sendTicketEmailsForPaymentCodeAsync(String paymentCode) {
        List<Booking> bookings = bookingRepository.findByPaymentCodeWithDetails(paymentCode);
        if (bookings == null || bookings.isEmpty()) {
            return;
        }

        Booking firstBooking = bookings.get(0);
        String email = firstBooking.getEmail();
        if (email == null || email.isBlank()) {
            System.out.println("No email for payment code " + paymentCode + ", skipping ticket emails");
            return;
        }

        try {
            byte[] qrCodeImage = generateQRCodeImage(paymentCode);
            String html = buildTicketEmailHtmlMultiple(bookings, paymentCode);
            
            mailService.sendMailWithAttachment(
                email, 
                "Vé xem phim - MyCinema", 
                html, 
                qrCodeImage, 
                "qrcode.png",
                "image/png"
            );
            System.out.println("Ticket email sent to: " + email + " for " + bookings.size() + " bookings with payment code: " + paymentCode);
        } catch (Exception e) {
            System.err.println("Failed to send ticket emails: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private byte[] generateQRCodeImage(String content) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = Map.of(
            EncodeHintType.CHARACTER_SET, "UTF-8",
            EncodeHintType.MARGIN, 2
        );
        
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 200, 200, hints);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }

    private String buildTicketEmailHtml(Booking booking) {
        Showtime showtime = booking.getShowtime();
        String movieName = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "N/A";
        String theaterName = showtime.getTheater() != null ? showtime.getTheater().getName() : "N/A";
        String roomName = showtime.getRoom() != null ? showtime.getRoom().getName() : "N/A";
        String dateStr = showtime.getShowDate() != null ? showtime.getShowDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
        String timeStr = showtime.getShowTime() != null ? showtime.getShowTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "N/A";
        String seatName = booking.getSeat() != null ? booking.getSeat().getSeatNumber() : "N/A";
        String seatType = booking.getSeat() != null && booking.getSeat().getSeatType() != null ? " (" + booking.getSeat().getSeatType().name() + ")" : "";

        return """
            <table bgcolor="#F4F5F6" border="0" cellpadding="0" cellspacing="0" width="100%%">
                <tbody>
                    <tr>
                        <td align="center" style="padding:15px" valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                <tbody>
                                    <tr>
                                        <td align="center" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" style="min-width:600px;width:600px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px" bgcolor="#ffffff" width="600">
                                                <tbody>
                                                    <tr>
                                                        <td bgcolor="#ffffff" valign="top">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                <tbody><tr>
                                                                    <td align="center" style="padding:24px 16px 24px 16px" valign="top">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                            <tbody><tr>
                                                                                <td align="center" valign="top">
                                                                                    <h2 style="font-size: 36px; font-weight: 900; margin: 0 0 10px 0; color: #e50914; letter-spacing: -3px;">MY CINEMA</h2>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td align="center" valign="top" style="padding:8px 0 0 0">
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:16px;line-height:22px;padding:0;margin:0;font-weight:bold">Xác nhận đặt vé thành công</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody></table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="padding:0 16px" valign="top">
                                                                        <img src="cid:qrcode" alt="QR Code" style="width:180px;height:180px;border:1px solid #ddd;border-radius:8px;margin:16px 0;" />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" style="padding:0 16px 24px 16px" valign="top">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                            <tbody><tr>
                                                                                <td align="left" valign="top">
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Mã đặt vé: <span style="color:#e50914">%s</span></p>
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Phim: <span style="color:#333">%s</span></p>
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Rạp: <span style="color:#333">%s</span></p>
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Phòng: <span style="color:#333">%s</span></p>
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Ngày: <span style="color:#333">%s</span></p>
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Giờ chiếu: <span style="color:#333">%s</span></p>
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Ghế: <span style="color:#333">%s%s</span></p>
                                                                                    <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#777;font-size:12px;line-height:18px;padding:0;margin:0">Quý khách vui lòng đến trước giờ chiếu 15 phút. Mang theo email này hoặc mã QR để nhận vé tại quầy.</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody></table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding:20px 16px 20px 16px;background:#e7e4e1;color:#777e90;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px" valign="top" align="left">
                                                                        <table width="100%%" cellspacing="0" cellpadding="0" border="0">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td valign="top" align="left">
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0;font-weight:600">CÔNG TY TNHH MY CINEMA VIỆT NAM</p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0">Địa chỉ: Hà Nội, Việt Nam</p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0">Hotline: (028) 3775 2524</p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0">COPYRIGHT &copy; MYCINEMA - ALL RIGHTS RESERVED.</p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody></table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            """.formatted(booking.getPaymentCode(), movieName, theaterName, roomName, dateStr, timeStr, seatName, seatType);
    }

    private String buildTicketEmailHtmlMultiple(List<Booking> bookings, String paymentCode) {
        if (bookings.isEmpty()) {
            return "";
        }

        Booking firstBooking = bookings.get(0);
        Showtime showtime = firstBooking.getShowtime();
        String movieName = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "N/A";
        String posterUrl = showtime.getMovie() != null ? showtime.getMovie().getPosterUrl() : "";
        String theaterName = showtime.getTheater() != null ? showtime.getTheater().getName() : "N/A";
        String roomName = showtime.getRoom() != null ? showtime.getRoom().getName() : "N/A";
        String dateStr = showtime.getShowDate() != null ? showtime.getShowDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";
        String timeStr = showtime.getShowTime() != null ? showtime.getShowTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "N/A";
        
        int totalAmount = 0;
        StringBuilder seatsHtml = new StringBuilder();
        for (Booking b : bookings) {
            String seatName = b.getSeat() != null ? b.getSeat().getSeatNumber() : "N/A";
            String seatType = b.getSeat() != null && b.getSeat().getSeatType() != null ? " (" + b.getSeat().getSeatType().name() + ")" : "";
            seatsHtml.append("<span style=\"display:inline-block;background:#e50914;color:white;padding:2px 8px;border-radius:4px;margin-right:4px;margin-bottom:4px;font-size:12px;font-weight:bold;\">").append(seatName).append(seatType).append("</span>");
            
            // Calculate approximate amount if missing, but normally we just display seats.
            double basePrice = showtime.getPriceStandard() != null ? showtime.getPriceStandard() : 0;
            double typeMultiplier = 1.0;
            if (b.getSeat() != null && b.getSeat().getSeatType() != null) {
                if (b.getSeat().getSeatType().name().equals("VIP")) {
                    basePrice = showtime.getPriceVip() != null ? showtime.getPriceVip() : 0;
                } else if (b.getSeat().getSeatType().name().equals("COUPLE")) {
                    typeMultiplier = 2.0;
                }
            }
            totalAmount += Math.round(basePrice * typeMultiplier);
        }

        return """
            <table bgcolor="#F4F5F6" border="0" cellpadding="0" cellspacing="0" width="100%%">
                <tbody>
                    <tr>
                        <td align="center" style="padding:15px" valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                <tbody>
                                    <tr>
                                        <td align="center" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" style="min-width:600px;width:600px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px" bgcolor="#ffffff" width="600">
                                                <tbody>
                                                    <tr>
                                                        <td bgcolor="#ffffff" valign="top">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                <tbody><tr>
                                                                    <td align="center" style="padding:24px 16px 24px 16px" valign="top">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                            <tbody><tr>
                                                                                <td align="center" valign="top">
                                                                                    <h2 style="font-size: 36px; font-weight: 900; margin: 0 0 10px 0; color: #e50914; letter-spacing: -3px;">MY CINEMA</h2>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td align="center" valign="top" style="padding:8px 0 0 0">
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:16px;line-height:22px;padding:0;margin:0;font-weight:bold">Xác nhận đặt vé thành công</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody></table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="padding:0 16px" valign="top">
                                                                        <img src="cid:qrcode" alt="QR Code" style="width:180px;height:180px;border:1px solid #ddd;border-radius:8px;margin:16px 0;" />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" style="padding:0 16px 24px 16px" valign="top">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                            <tbody><tr>
                                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                                                    <tbody><tr>
                                                                                        <td width="120" valign="top">
                                                                                            <img src="%s" alt="Poster" style="width:100px;border-radius:4px;object-fit:cover;" />
                                                                                        </td>
                                                                                        <td align="left" valign="top" style="padding-left:16px;">
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Mã đặt vé: <span style="color:#e50914">%s</span></p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Phim: <span style="color:#333">%s</span></p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Rạp: <span style="color:#333">%s</span></p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Phòng: <span style="color:#333">%s</span></p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Thời gian: <span style="color:#333">%s - %s</span></p>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Số ghế: <span style="color:#333">%d ghế</span></p>
                                                                                            <div style="margin-bottom:8px;">%s</div>
                                                                                            <p style="font-family:Arial,Helvetica,sans-serif;color:#141416;font-size:14px;line-height:20px;padding:0;margin:0 0 8px 0;font-weight:bold">Tổng tiền: <span style="color:#e50914">%,d VND</span></p>
                                                                                        </td>
                                                                                    </tr></tbody>
                                                                                </table>
                                                                                    <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
                                                                                    <p style="font-family:Arial,Helvetica,sans-serif;color:#777;font-size:12px;line-height:18px;padding:0;margin:0">Quý khách vui lòng đến trước giờ chiếu 15 phút. Mang theo email này hoặc mã QR để nhận vé tại quầy.</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody></table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding:20px 16px 20px 16px;background:#e7e4e1;color:#777e90;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px" valign="top" align="left">
                                                                        <table width="100%%" cellspacing="0" cellpadding="0" border="0">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td valign="top" align="left">
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0;font-weight:600">CÔNG TY TNHH MY CINEMA VIỆT NAM</p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0">Địa chỉ: Hà Nội, Việt Nam</p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0 0 3px 0">Hotline: (028) 3775 2524</p>
                                                                                        <p style="font-family:Arial,Helvetica,sans-serif;color:#777e90;font-size:12px;line-height:20px;padding:0;margin:0">COPYRIGHT &copy; MYCINEMA - ALL RIGHTS RESERVED.</p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody></table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            """.formatted(posterUrl, paymentCode, movieName, theaterName, roomName, timeStr, dateStr, bookings.size(), seatsHtml.toString(), totalAmount);
    }
}
