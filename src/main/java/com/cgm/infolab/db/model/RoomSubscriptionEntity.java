package com.cgm.infolab.db.model;

import java.util.Objects;

public class RoomSubscriptionEntity {
    private RoomName roomName;
    private Username username;

    private RoomSubscriptionEntity() {
    }

    private RoomSubscriptionEntity(RoomName roomName, Username username) {
        this.roomName = roomName;
        this.username = username;
    }

    public static RoomSubscriptionEntity empty() {
        return new RoomSubscriptionEntity(RoomName.empty(), Username.empty());
    }

    public RoomName getRoomName() {
        return roomName;
    }

    public void setRoomName(RoomName roomName) {
        this.roomName = roomName;
    }

    public Username getUsername() {
        return username;
    }

    public void setUsername(Username username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "RoomSubscriptionEntity{" +
                "roomName=" + roomName +
                ", username=" + username +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoomSubscriptionEntity that = (RoomSubscriptionEntity) o;
        return Objects.equals(roomName, that.roomName) && Objects.equals(username, that.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomName, username);
    }
}
