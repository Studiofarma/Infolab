package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

public class RoomSubscriptionEntity {
    private long roomId;
    private long userId;

    private RoomSubscriptionEntity() {
    }

    private RoomSubscriptionEntity(long roomId, long userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    public static RoomSubscriptionEntity empty() {
        return new RoomSubscriptionEntity(ID.None, ID.None);
    }

    public long getRoomId() {
        return roomId;
    }

    public void setRoomId(long roomId) {
        this.roomId = roomId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "RoomSubscriptionEntity{" +
                "roomId=" + roomId +
                ", userId=" + userId +
                "}";
    }
}
