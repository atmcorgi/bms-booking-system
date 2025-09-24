package fsa.training.controller.payment;

import fsa.training.entity.Booking;
import fsa.training.util.VnpayUtil;
import fsa.training.service.booking.SeatHoldService;
import fsa.training.config.VnpayConfig;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpServletRequest;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/vnpay")
public class PaymentController {
    private final VnpayConfig vnpayConfig;
    private final ZoneId businessZoneId;
    private final SeatHoldService seatHoldService;

    public PaymentController(VnpayConfig vnpayConfig, 
                           ZoneId businessZoneId, SeatHoldService seatHoldService) {
        this.vnpayConfig = vnpayConfig;
        this.businessZoneId = businessZoneId;
        this.seatHoldService = seatHoldService;
    }

    // Bước 1: Khởi tạo thanh toán, redirect sang VNPAY - xử lý nhiều vé
    @PostMapping("/pay")
    public String pay(@RequestParam Long showtimeId,
                     @RequestParam String[] seatIds, 
                     @RequestParam String customerName,
                     @RequestParam String customerPhone,
                     HttpServletRequest request) {
        return showtimeService.getById(showtimeId)
            .map(showtime -> {
                // Convert String[] to List<Long>
                List<Long> seatIdList = Arrays.stream(seatIds)
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

                // Validate holds for current session before redirecting to payment
                String ownerKey = request.getSession().getId();
                boolean holdsOk = seatHoldService.validateOwnedHolds(showtimeId, seatIdList, ownerKey);
                if (!holdsOk) {
                    return "redirect:/booking/payment-fail";
                }
                
                // Tạo orderId ngẫu nhiên
                String orderId = String.valueOf(System.currentTimeMillis());
                String vnp_TxnRef = orderId;
                String vnp_OrderInfo = "Thanh toan " + seatIdList.size() + " ve xem phim - " + customerName;
                
                // Tính tổng tiền theo loại ghế + cuối tuần
                final double multiplier = showtime.getShowDate() != null && 
                    (showtime.getShowDate().getDayOfWeek() == java.time.DayOfWeek.SATURDAY || 
                     showtime.getShowDate().getDayOfWeek() == java.time.DayOfWeek.SUNDAY) 
                    ? 1.15 : 1.0; // weekend 15%
                long sumVnd = seatIdList.stream()
                    .map(seatService::getById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .mapToLong(seat -> {
                        int base = 0;
                        if (seat.getSeatType() != null && seat.getSeatType().name().equals("VIP")) {
                            base = showtime.getPriceVip() != null ? showtime.getPriceVip() : 0;
                        } else {
                            base = showtime.getPriceStandard() != null ? showtime.getPriceStandard() : 0;
                        }
                        return Math.round(base * multiplier);
                    })
                    .sum();
                int totalAmount = (int) Math.max(0, Math.min(Integer.MAX_VALUE, sumVnd * 100)); // nhân 100 theo yêu cầu VNPAY
                String vnp_Amount = String.valueOf(totalAmount);
                
                String vnp_Locale = "vn";
                String vnp_BankCode = "NCB";
                DateTimeFormatter vnpFormatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                ZonedDateTime now = ZonedDateTime.now(businessZoneId);
                String vnp_CreateDate = now.format(vnpFormatter);
                String vnp_ExpireDate = now.plusMinutes(15).format(vnpFormatter);
                String vnp_IpAddr = request.getRemoteAddr();
                if ("0:0:0:0:0:0:0:1".equals(vnp_IpAddr)) vnp_IpAddr = "127.0.0.1";
                
                Map<String, String> vnp_Params = new HashMap<>();
                vnp_Params.put("vnp_Version", "2.1.0");
                vnp_Params.put("vnp_Command", "pay");
                vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
                vnp_Params.put("vnp_Amount", vnp_Amount);
                vnp_Params.put("vnp_CurrCode", "VND");
                vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
                vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
                vnp_Params.put("vnp_OrderType", "billpayment");
                vnp_Params.put("vnp_Locale", vnp_Locale);
                vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
                vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
                vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
                vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
                vnp_Params.put("vnp_BankCode", vnp_BankCode);
                
                // Lưu thông tin tạm vào session (hoặc DB nếu muốn)
                request.getSession().setAttribute("pay_showtimeId", showtimeId);
                request.getSession().setAttribute("pay_seatIds", seatIdList); // Sử dụng seatIdList đã convert
                request.getSession().setAttribute("pay_customerName", customerName);
                request.getSession().setAttribute("pay_customerPhone", customerPhone);
                
                // Sinh URL thanh toán
                String paymentUrl = VnpayUtil.getPaymentUrl(vnp_Params, vnpayConfig.getHashSecret(), vnpayConfig.getPayUrl());
                if (paymentUrl.contains("{") || paymentUrl.contains("}")) {
                    throw new IllegalArgumentException("VNPAY paymentUrl contains invalid characters: " + paymentUrl);
                }
                return "redirect:" + paymentUrl;
            })
            .orElse("redirect:/booking/payment-fail");
    }

    // Bước 2: Nhận kết quả thanh toán từ VNPAY (returnUrl)
    @GetMapping("/return")
    public String vnpayReturn(HttpServletRequest request, Model model) {
        Map<String, String[]> params = request.getParameterMap();
        Map<String, String> vnp_Params = params.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> entry.getValue()[0]
            ));
        String vnp_ResponseCode = vnp_Params.get("vnp_ResponseCode");
        String vnp_SecureHash = vnp_Params.get("vnp_SecureHash");
        vnp_Params.remove("vnp_SecureHash");
        vnp_Params.remove("vnp_SecureHashType");
        // Kiểm tra checksum
        String hashDataCheck = buildHashData(vnp_Params);
        String signValue = VnpayUtil.hmacSHA512(vnpayConfig.getHashSecret(), hashDataCheck);
        if (signValue.equals(vnp_SecureHash) && "00".equals(vnp_ResponseCode)) {
            // Thanh toán thành công, tạo booking
            Object showtimeObj = request.getSession().getAttribute("pay_showtimeId");
            Object seatIdsObj = request.getSession().getAttribute("pay_seatIds");
            String customerName = (String) request.getSession().getAttribute("pay_customerName");
            String customerPhone = (String) request.getSession().getAttribute("pay_customerPhone");
            Long showtimeId = showtimeObj instanceof Long ? (Long) showtimeObj : Long.valueOf(showtimeObj.toString());
            List<Long> seatIds = seatIdsObj instanceof List ? (List<Long>) seatIdsObj : Collections.emptyList();

            // Validate holds again and release on success
            String ownerKey = request.getSession().getId();
            boolean holdsOk = seatHoldService.validateOwnedHolds(showtimeId, seatIds, ownerKey);
            if (!holdsOk) {
                return "redirect:/booking/payment-fail";
            }
            seatHoldService.releaseAll(showtimeId, seatIds);
            List<Booking> bookings = bookingService.bookMultiple(showtimeId, seatIds, customerName, customerPhone);
            if (!bookings.isEmpty()) {
                // Redirect đến trang hiển thị tất cả vé đã đặt
                String bookingIds = bookings.stream().map(b -> b.getId().toString()).collect(Collectors.joining(","));
                return "redirect:/booking/tickets?bookingIds=" + bookingIds;
            }
            return "redirect:/booking/payment-fail";
        } else {
            model.addAttribute("message", "Thanh toán thất bại hoặc bị hủy!");
            return "booking/payment-fail";
        }
    }


    private String buildHashData(Map<String, String> params) {
        return params.entrySet().stream()
            .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                String fieldName = entry.getKey();
                String value = entry.getValue();
                try {
                    return fieldName + "=" + java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.US_ASCII.toString());
                } catch (Exception e) {
                    return fieldName + "=" + value; // fallback nếu encode lỗi
                }
            })
            .collect(Collectors.joining("&"));
    }
}