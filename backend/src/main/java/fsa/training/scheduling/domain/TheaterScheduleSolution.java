package fsa.training.scheduling.domain;

import java.util.List;
import org.optaplanner.core.api.domain.solution.PlanningSolution;
import org.optaplanner.core.api.domain.solution.ProblemFactCollectionProperty;
import org.optaplanner.core.api.domain.valuerange.ValueRangeProvider;
import org.optaplanner.core.api.score.buildin.hardsoft.HardSoftScore;
import org.optaplanner.core.api.domain.solution.PlanningScore;
import org.optaplanner.core.api.domain.solution.PlanningEntityCollectionProperty;

@PlanningSolution
public class TheaterScheduleSolution {
    @ValueRangeProvider(id = "roomRange")
    @ProblemFactCollectionProperty
    private List<RoomResource> rooms;

    @ValueRangeProvider(id = "timeRange")
    @ProblemFactCollectionProperty
    private List<TimeGrain> times;

    @PlanningEntityCollectionProperty
    private List<ShowtimeAssignment> assignments;

    @PlanningScore
    private HardSoftScore score;

    // Config for constraints - passed as problem fact
    private SchedulingConfig config = new SchedulingConfig();

    public TheaterScheduleSolution() {}

    public TheaterScheduleSolution(List<RoomResource> rooms, List<TimeGrain> times, List<ShowtimeAssignment> assignments) {
        this.rooms = rooms;
        this.times = times;
        this.assignments = assignments;
    }

    public List<RoomResource> getRooms() { return rooms; }
    public List<TimeGrain> getTimes() { return times; }
    public List<ShowtimeAssignment> getAssignments() { return assignments; }
    public HardSoftScore getScore() { return score; }
    public SchedulingConfig getConfig() { return config; }

    public void setRooms(List<RoomResource> rooms) { this.rooms = rooms; }
    public void setTimes(List<TimeGrain> times) { this.times = times; }
    public void setAssignments(List<ShowtimeAssignment> assignments) { this.assignments = assignments; }
    public void setScore(HardSoftScore score) { this.score = score; }
    public void setConfig(SchedulingConfig config) { this.config = config; }
}


