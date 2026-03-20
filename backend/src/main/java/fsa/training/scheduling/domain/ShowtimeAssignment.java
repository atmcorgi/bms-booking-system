package fsa.training.scheduling.domain;

import fsa.training.entity.MovieRequest;
import org.optaplanner.core.api.domain.entity.PlanningEntity;
import org.optaplanner.core.api.domain.lookup.PlanningId;
import org.optaplanner.core.api.domain.variable.PlanningVariable;
import org.optaplanner.core.api.domain.entity.PlanningPin;

@PlanningEntity
public class ShowtimeAssignment {
    @PlanningId
    private Long id; // transient id for solving
    private MovieRequest movieRequest;

    @PlanningVariable(valueRangeProviderRefs = {"roomRange"})
    private RoomResource room;

    @PlanningVariable(valueRangeProviderRefs = {"timeRange"})
    private TimeGrain timeGrain;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MovieRequest getMovieRequest() { return movieRequest; }
    public void setMovieRequest(MovieRequest movieRequest) { this.movieRequest = movieRequest; }

    public RoomResource getRoom() { return room; }
    public void setRoom(RoomResource room) { this.room = room; }

    public TimeGrain getTimeGrain() { return timeGrain; }
    public void setTimeGrain(TimeGrain timeGrain) { this.timeGrain = timeGrain; }
    
    // Transient field to hold validation errors from solver
    private java.util.List<String> planningErrors = new java.util.ArrayList<>();

    public java.util.List<String> getPlanningErrors() { return planningErrors; }
    public void setPlanningErrors(java.util.List<String> planningErrors) { this.planningErrors = planningErrors; }
    public void addPlanningError(String error) { this.planningErrors.add(error); }

    // Difficulty comparison for FIRST_FIT_DECREASING
    public int getDifficulty() {
        if (movieRequest == null) return 0;
        Integer priority = movieRequest.getPriority();
        Double demand = movieRequest.getDemandScore();
        int p = priority != null ? priority : 0;
        int d = demand != null ? (int)Math.round(demand * 10) : 0;
        return p * 10 + d; // Higher priority and demand = more difficult
    }

    // Config fields (set from SchedulingConfig before solving)
    private int bufferMinutes = 5;
    private int closeHour = 23;
    private int closeMinute = 0;

    public int getBufferMinutes() { return bufferMinutes; }
    public void setBufferMinutes(int bufferMinutes) { this.bufferMinutes = bufferMinutes; }
    public int getCloseHour() { return closeHour; }
    public void setCloseHour(int closeHour) { this.closeHour = closeHour; }
    public int getCloseMinute() { return closeMinute; }
    public void setCloseMinute(int closeMinute) { this.closeMinute = closeMinute; }

    private int primeTimeWeight = 3;
    private int roomBalanceWeight = 2;

    public int getPrimeTimeWeight() { return primeTimeWeight; }
    public void setPrimeTimeWeight(int primeTimeWeight) { this.primeTimeWeight = primeTimeWeight; }
    public int getRoomBalanceWeight() { return roomBalanceWeight; }
    public void setRoomBalanceWeight(int roomBalanceWeight) { this.roomBalanceWeight = roomBalanceWeight; }
}


