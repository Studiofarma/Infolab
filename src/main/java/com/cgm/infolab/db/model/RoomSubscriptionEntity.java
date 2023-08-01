package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

public class RoomSubscriptionEntity {
    private long roomId;
    private RoomName roomName;
    private long userId;
    private Username username;

    private RoomSubscriptionEntity() {
    }

    private RoomSubscriptionEntity(long roomId, RoomName roomName, long userId, Username username) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.userId = userId;
        this.username = username;
    }

    public static RoomSubscriptionEntity empty() {
        return new RoomSubscriptionEntity(ID.None, RoomName.empty(), ID.None, Username.empty());
    }

    public long getRoomId() {
        return roomId;
    }

    public void setRoomId(long roomId) {
        this.roomId = roomId;
    }

    public RoomName getRoomName() {
        return roomName;
    }

    public void setRoomName(RoomName roomName) {
        this.roomName = roomName;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
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
                "roomId=" + roomId +
                ", userId=" + userId +
                "}";
    }
}
