package com.cgm.infolab.db;

public class RoomEntity {
    private long id;
    private String name;

    // TODO: rimuovere
    public RoomEntity(String name) {
        this(ID.None, name);
    }

    private RoomEntity(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public static RoomEntity of(String name) {
        return new RoomEntity(ID.None, name);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
