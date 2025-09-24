package fsa.training.controller.booking;

import fsa.training.service.booking.SeatHoldService;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.HashMap;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    private final SeatHoldService seatHoldService;

    public BookingController( SeatHoldService seatHoldService) {
        this.seatHoldService = seatHoldService;
    }

    // Hold a seat for current session (TTL-based)
    @PostMapping("/shows/{showtimeId}/holds")
    public Map<String, Object> holdSeat(@PathVariable Long showtimeId,
                                        @RequestParam Long seatId,
                                        jakarta.servlet.http.HttpSession session) {
        String ownerKey = session.getId();
        boolean ok = seatHoldService.hold(showtimeId, seatId, ownerKey);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", ok);
        if (!ok) {
            resp.put("message", "Seat is currently held by someone else");
        }
        return resp;
    }

    // Release a seat hold for current session
    @DeleteMapping("/shows/{showtimeId}/holds")
    public Map<String, Object> releaseSeat(@PathVariable Long showtimeId,
                                           @RequestParam Long seatId,
                                           jakarta.servlet.http.HttpSession session) {
        String ownerKey = session.getId();
        boolean ok = seatHoldService.release(showtimeId, seatId, ownerKey);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", ok);
        return resp;
    }
    
   
    



} 