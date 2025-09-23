package fsa.training.scheduling.domain;

import fsa.training.entity.Room;

public class RoomResource {
    private Long id;
    private String name;
    private String supportedFormats; // pipe-separated
    private Long theaterId;

    public static RoomResource from(Room room) {
        RoomResource rr = new RoomResource();
        rr.id = room.getId();
        rr.name = room.getName();
        rr.supportedFormats = room.getSupportedFormats();
        rr.theaterId = room.getTheater().getId();
        return rr;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSupportedFormats() { return supportedFormats; }
    public Long getTheaterId() { return theaterId; }
}


