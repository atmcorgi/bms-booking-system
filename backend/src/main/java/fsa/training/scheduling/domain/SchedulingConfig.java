package fsa.training.scheduling.domain;

/**
 * Configuration object for scheduling constraints. All parameters are configurable from the frontend.
 * Provides sensible defaults matching the current hardcoded values.
 */
public class SchedulingConfig {
    private int openHour = 8;       // Theater opens at 08:00
    private int openMinute = 0;
    private int closeHour = 23;     // Theater closes at 23:00
    private int closeMinute = 0;
    private int bufferMinutes = 5;  // Buffer between movies
    private int timeGrainMinutes = 30; // Resolution of time slots
    private int maxShowsPerMoviePerDay = 8; // Max assignments per movie per day

    // Soft constraint weights (1-5 scale)
    private int primeTimeWeight = 3;     // How much to prefer 18–21h
    private int roomBalanceWeight = 2;   // How much to balance room usage
    private boolean spreadMoviesAcrossDays = true;

    public SchedulingConfig() {}

    // Fluent builder-like setters
    public SchedulingConfig withOpenTime(int hour, int minute) {
        this.openHour = hour;
        this.openMinute = minute;
        return this;
    }

    public SchedulingConfig withCloseTime(int hour, int minute) {
        this.closeHour = hour;
        this.closeMinute = minute;
        return this;
    }

    public SchedulingConfig withBufferMinutes(int minutes) {
        this.bufferMinutes = minutes;
        return this;
    }

    public SchedulingConfig withTimeGrainMinutes(int minutes) {
        this.timeGrainMinutes = minutes;
        return this;
    }

    public SchedulingConfig withMaxShowsPerMoviePerDay(int max) {
        this.maxShowsPerMoviePerDay = max;
        return this;
    }

    // Getters
    public int getOpenHour() { return openHour; }
    public int getOpenMinute() { return openMinute; }
    public int getCloseHour() { return closeHour; }
    public int getCloseMinute() { return closeMinute; }
    public int getBufferMinutes() { return bufferMinutes; }
    public int getTimeGrainMinutes() { return timeGrainMinutes; }
    public int getMaxShowsPerMoviePerDay() { return maxShowsPerMoviePerDay; }
    public int getPrimeTimeWeight() { return primeTimeWeight; }
    public int getRoomBalanceWeight() { return roomBalanceWeight; }
    public boolean isSpreadMoviesAcrossDays() { return spreadMoviesAcrossDays; }

    public void setOpenHour(int openHour) { this.openHour = openHour; }
    public void setOpenMinute(int openMinute) { this.openMinute = openMinute; }
    public void setCloseHour(int closeHour) { this.closeHour = closeHour; }
    public void setCloseMinute(int closeMinute) { this.closeMinute = closeMinute; }
    public void setBufferMinutes(int bufferMinutes) { this.bufferMinutes = bufferMinutes; }
    public void setTimeGrainMinutes(int timeGrainMinutes) { this.timeGrainMinutes = timeGrainMinutes; }
    public void setMaxShowsPerMoviePerDay(int maxShowsPerMoviePerDay) { this.maxShowsPerMoviePerDay = maxShowsPerMoviePerDay; }
    public void setPrimeTimeWeight(int primeTimeWeight) { this.primeTimeWeight = primeTimeWeight; }
    public void setRoomBalanceWeight(int roomBalanceWeight) { this.roomBalanceWeight = roomBalanceWeight; }
    public void setSpreadMoviesAcrossDays(boolean spreadMoviesAcrossDays) { this.spreadMoviesAcrossDays = spreadMoviesAcrossDays; }

    @Override
    public String toString() {
        return String.format("SchedulingConfig{open=%02d:%02d, close=%02d:%02d, buffer=%dmin, grain=%dmin, maxPerDay=%d}",
                openHour, openMinute, closeHour, closeMinute, bufferMinutes, timeGrainMinutes, maxShowsPerMoviePerDay);
    }
}
