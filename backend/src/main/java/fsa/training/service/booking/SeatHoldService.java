package fsa.training.service.booking;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class SeatHoldService {
    private static final long DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes

    private final long ttlMs;
    private final ConcurrentMap<Long, ConcurrentMap<Long, SeatHold>> holdsByShowtime = new ConcurrentHashMap<>();
    private final ConcurrentMap<Long, ReentrantLock> locksByShowtime = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleaner;

    public SeatHoldService() {
        this(DEFAULT_TTL_MS);
    }

    public SeatHoldService(long ttlMs) {
        this.ttlMs = Math.max(ttlMs, 30_000); // at least 30s 
        this.cleaner = Executors.newSingleThreadScheduledExecutor();
        this.cleaner.scheduleAtFixedRate(this::cleanupExpired, 30, 30, TimeUnit.SECONDS);
    }

    private ReentrantLock lockForShowtime(Long showtimeId) {
        return locksByShowtime.computeIfAbsent(showtimeId, id -> new ReentrantLock());
    }

    private long now() {
        return System.currentTimeMillis();
    }

    public boolean hold(Long showtimeId, Long seatId, String ownerKey) {

        ReentrantLock lock = lockForShowtime(showtimeId);
        if (!lock.tryLock()) return false;
        try {
            long expiresAt = now() + ttlMs;
            ConcurrentMap<Long, SeatHold> map = holdsByShowtime.computeIfAbsent(showtimeId, id -> new ConcurrentHashMap<>());
            SeatHold existing = map.get(seatId);
            if (existing != null && !existing.isExpired(now())) {
                // allow re-hold by same owner to refresh TTL
                if (existing.ownerKey.equals(ownerKey)) {
                    map.put(seatId, new SeatHold(ownerKey, expiresAt));
                    return true;
                }
                return false;
            }
            map.put(seatId, new SeatHold(ownerKey, expiresAt));
            return true;
        } finally {
            lock.unlock();
        }
    }

    public boolean release(Long showtimeId, Long seatId, String ownerKey) {
        ReentrantLock lock = lockForShowtime(showtimeId);
        if (!lock.tryLock()) return false;
        try {
            ConcurrentMap<Long, SeatHold> map = holdsByShowtime.get(showtimeId);
            if (map == null) return true;
            SeatHold existing = map.get(seatId);
            if (existing == null) return true;
            if (existing.isExpired(now()) || existing.ownerKey.equals(ownerKey)) {
                map.remove(seatId);
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }

    public boolean validateOwnedHolds(Long showtimeId, List<Long> seatIds, String ownerKey) {
        ConcurrentMap<Long, SeatHold> map = holdsByShowtime.get(showtimeId);
        if (map == null) return false;
        long now = now();
        for (Long seatId : seatIds) {
            SeatHold h = map.get(seatId);
            if (h == null || h.isExpired(now) || !h.ownerKey.equals(ownerKey)) {
                return false;
            }
        }
        return true;
    }

    public void releaseAll(Long showtimeId, List<Long> seatIds) {
        ReentrantLock lock = lockForShowtime(showtimeId);
        if (!lock.tryLock()) return;
        try {
            ConcurrentMap<Long, SeatHold> map = holdsByShowtime.get(showtimeId);
            if (map == null) return;
            seatIds.forEach(map::remove);
        } finally {
            lock.unlock();
        }
    }

    private void cleanupExpired() {
        long now = now();
        for (Map.Entry<Long, ConcurrentMap<Long, SeatHold>> e : holdsByShowtime.entrySet()) {
            ConcurrentMap<Long, SeatHold> map = e.getValue();
            map.values().removeIf(h -> h.isExpired(now));
        }
    }

    private static final class SeatHold {
        final String ownerKey;
        final long expiresAt;

        SeatHold(String ownerKey, long expiresAt) {
            this.ownerKey = ownerKey;
            this.expiresAt = expiresAt;
        }

        boolean isExpired(long now) {
            return now >= expiresAt;
        }
    }
}