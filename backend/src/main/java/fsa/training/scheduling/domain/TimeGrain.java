package fsa.training.scheduling.domain;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * A discrete time slot used by the solver. Usually 30-minute steps.
 */
public class TimeGrain {
    private LocalDate date;
    private LocalTime start;

    public TimeGrain() {}

    public TimeGrain(LocalDate date, LocalTime start) {
        this.date = date;
        this.start = start;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStart() { return start; }
    public void setStart(LocalTime start) { this.start = start; }
}


