package fsa.training.scheduling.constraints;

import fsa.training.scheduling.domain.ShowtimeAssignment;
import org.optaplanner.core.api.score.buildin.hardsoft.HardSoftScore;
import org.optaplanner.core.api.score.stream.Constraint;
import org.optaplanner.core.api.score.stream.ConstraintFactory;
import org.optaplanner.core.api.score.stream.ConstraintProvider;
import org.optaplanner.core.api.score.stream.ConstraintCollectors;

public class SchedulingConstraintProvider implements ConstraintProvider {
    @Override
    public Constraint[] defineConstraints(ConstraintFactory factory) {
        return new Constraint[] {
                // HARD CONSTRAINTS - Core requirements
                roomOverlapByDuration(factory), // Main overlap constraint with buffer
                roomConflictSameStart(factory), // Same start time conflict
                endWithinOperatingHours(factory), // Operating hours limit
                missingRoomOrTime(factory), // Must have room and time
                
                // SOFT CONSTRAINTS - Optimization preferences
                softPreferHighPriorityAndDemand(factory), // Prefer high priority movies
                softBalanceRooms(factory), // Balance room usage
                softStaggerSameMovie(factory), // Stagger same movie times
                softBalancedTimeDistribution(factory), // Balanced time distribution
                softCoverTimeBuckets(factory), // Cover all time periods
                softBaselineShowsPerRoomDay(factory), // Ensure baseline shows per room-day
                softSpreadMovieAcrossDates(factory) // Spread same movie across dates
        };
    }

    private Constraint missingRoomOrTime(ConstraintFactory factory) {
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getRoom() == null || a.getTimeGrain() == null)
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("assignment must have room and time");
    }

    // Strict same start conflict (safety net)
    private Constraint roomConflictSameStart(ConstraintFactory factory) {
        return factory.forEachUniquePair(ShowtimeAssignment.class,
                        org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getRoom() == null ? null : a.getRoom().getId()),
                        org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getTimeGrain() == null ? null : a.getTimeGrain().getDate()),
                        org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getTimeGrain() == null ? null : a.getTimeGrain().getStart()))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("room same start conflict");
    }

    // Overlap by duration (+ buffer)
    private Constraint roomOverlapByDuration(ConstraintFactory factory) {
        final int BUFFER_MIN = 5; // Reduce buffer from 15 to 5 minutes
        return factory.forEachUniquePair(ShowtimeAssignment.class,
                        org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getRoom() == null ? null : a.getRoom().getId()),
                        org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getTimeGrain() == null ? null : a.getTimeGrain().getDate()))
                .filter((a, b) -> {
                    if (a.getTimeGrain() == null || b.getTimeGrain() == null) return false;
                    if (a.getMovieRequest() == null || b.getMovieRequest() == null) return false;
                    if (a.getMovieRequest().getMovie() == null || b.getMovieRequest().getMovie() == null) return false;
                    Integer da = a.getMovieRequest().getMovie().getDuration();
                    Integer db = b.getMovieRequest().getMovie().getDuration();
                    if (da == null || db == null) return false;
                    java.time.LocalTime sa = a.getTimeGrain().getStart();
                    java.time.LocalTime sb = b.getTimeGrain().getStart();
                    java.time.LocalTime ea = sa.plusMinutes(da + BUFFER_MIN);
                    java.time.LocalTime eb = sb.plusMinutes(db + BUFFER_MIN);
                    // overlap if start < other.end && other.start < end
                    return sa.isBefore(eb) && sb.isBefore(ea);
                })
                .penalize(HardSoftScore.ofHard(10)) // Further reduce penalty to allow assignments
                .asConstraint("room overlap by duration");
    }


    // Ensure end-time within operating hours (simple cap at 23:00)
    private Constraint endWithinOperatingHours(ConstraintFactory factory) {
        final java.time.LocalTime CLOSE = java.time.LocalTime.of(23, 0);
        final int BUFFER_MIN = 15;
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> {
                    if (a.getTimeGrain() == null || a.getMovieRequest() == null || a.getMovieRequest().getMovie() == null) return false;
                    Integer d = a.getMovieRequest().getMovie().getDuration();
                    if (d == null) return false;
                    java.time.LocalTime end = a.getTimeGrain().getStart().plusMinutes(d + BUFFER_MIN);
                    return end.isAfter(CLOSE);
                })
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("end within operating hours");
    }

    // TỐI ƯU: Constraint duy nhất cho phân bố thời gian cân bằng
    private Constraint softBalancedTimeDistribution(ConstraintFactory factory) {
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getRoom() != null && a.getTimeGrain() != null)
                .reward(HardSoftScore.ONE_SOFT, a -> {
                    int hour = a.getTimeGrain().getStart().getHour();
                    // Phân bố cân bằng theo khung giờ thực tế - cân bằng thực sự
                    if (hour >= 8 && hour < 10) return 1; // Early morning: 2 điểm
                    if (hour >= 10 && hour < 12) return 2; // Morning: 2 điểm
                    if (hour >= 12 && hour < 15) return 2; // Early afternoon: 2 điểm  
                    if (hour >= 15 && hour < 18) return 2; // Late afternoon: 2 điểm
                    if (hour >= 18 && hour < 21) return 3; // Prime time: 3 điểm (cao nhất)
                    if (hour >= 21 && hour < 23) return 1; // Late evening: 1 điểm
                    return 0;
                })
                .asConstraint("balanced time distribution");
    }



    // Bucket coverage per room per day: reward distinct 2-hour buckets used
    private int bucketOf(java.time.LocalTime t) {
        int h = t.getHour();
        // 2-hour buckets starting at 8
        if (h < 8) return 0;
        return (h - 8) / 2; // 8-10 ->0, 10-12 ->1, 12-14 ->2, ... 20-22 ->6
    }

    private Constraint softCoverTimeBuckets(ConstraintFactory factory) {
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getRoom() != null && a.getTimeGrain() != null)
                .groupBy(a -> a.getRoom().getId(),
                         a -> a.getTimeGrain().getDate(),
                         ConstraintCollectors.countDistinct(a -> bucketOf(a.getTimeGrain().getStart())))
                .reward(HardSoftScore.ONE_SOFT, (roomId, date, distinctBuckets) -> distinctBuckets * 2) // Cân bằng reward
                .asConstraint("cover time buckets per room-day");
    }
    
    // Reward having at least N shows per room per day to avoid empty days
    private Constraint softBaselineShowsPerRoomDay(ConstraintFactory factory) {
        final int BASELINE = 2; // target minimum shows per room-day
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getRoom() != null && a.getTimeGrain() != null)
                .groupBy(a -> a.getRoom().getId(), a -> a.getTimeGrain().getDate(), ConstraintCollectors.count())
                .reward(HardSoftScore.ONE_SOFT, (roomId, date, count) -> Math.max(0, Math.min(count, BASELINE)))
                .asConstraint("baseline shows per room-day");
    }
    
    // Reward each movie appearing on more distinct dates (distribution across days)
    private Constraint softSpreadMovieAcrossDates(ConstraintFactory factory) {
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getMovieRequest() != null && a.getTimeGrain() != null)
                .groupBy(a -> a.getMovieRequest().getMovie().getCode(),
                         ConstraintCollectors.countDistinct(a -> a.getTimeGrain().getDate()))
                .reward(HardSoftScore.ONE_SOFT, (movieCode, distinctDates) -> distinctDates)
                .asConstraint("spread movie across dates");
    }


    private Constraint softPreferHighPriorityAndDemand(ConstraintFactory factory) {
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getMovieRequest() != null)
                .reward(HardSoftScore.ONE_SOFT, a -> {
                    Integer p = a.getMovieRequest().getPriority();
                    Double d = a.getMovieRequest().getDemandScore();
                    int pw = p != null ? p : 0;
                    int dw = d != null ? (int)Math.round(d * 5) : 0; // Giảm scale từ 10 xuống 5
                    return Math.max(1, pw * 5 + dw); // Giảm scale để cân bằng với time distribution
                })
                .asConstraint("prefer high priority & demand");
    }

    // Encourage distribution across rooms by penalizing quadratic load per room
    private Constraint softBalanceRooms(ConstraintFactory factory) {
        return factory.forEach(ShowtimeAssignment.class)
                .filter(a -> a.getRoom() != null)
                .groupBy(a -> a.getRoom().getId(), ConstraintCollectors.count())
                .penalize(HardSoftScore.ONE_SOFT, (roomId, count) -> count * count / 2) // Giảm penalty để không quá mạnh
                .asConstraint("balance rooms (quadratic load)");
    }

    // Stagger same movie times - penalize if same movie starts at same time
    private Constraint softStaggerSameMovie(ConstraintFactory factory) {
        return factory.forEachUniquePair(ShowtimeAssignment.class,
                org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getMovieRequest() == null ? null : a.getMovieRequest().getMovie().getCode()),
                org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getTimeGrain() == null ? null : a.getTimeGrain().getDate()),
                org.optaplanner.core.api.score.stream.Joiners.equal(a -> a.getTimeGrain() == null ? null : a.getTimeGrain().getStart()))
                .penalize(HardSoftScore.ONE_SOFT, (a, b) -> 10) // High penalty for same movie same time
                .asConstraint("stagger same movie times");
    }


}


