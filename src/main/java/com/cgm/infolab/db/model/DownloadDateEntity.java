package com.cgm.infolab.db.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class DownloadDateEntity {
    private LocalDateTime timestamp;
    private long userId;
    private long roomId;

    private DownloadDateEntity(LocalDateTime timestamp, long userId, long roomId) {
        this.timestamp = timestamp;
        this.userId = userId;
        this.roomId = roomId;
    }

    public static DownloadDateEntity of(LocalDateTime timestamp, long userId, long roomId) {
        return new DownloadDateEntity(timestamp, userId, roomId);
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public long getRoomId() {
        return roomId;
    }

    public void setRoomId(long roomId) {
        this.roomId = roomId;
    }

    @Override
    public String toString() {
        return "DownloadDateEntity{" +
                "timestamp=" + timestamp +
                ", userId=" + userId +
                ", roomId=" + roomId +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DownloadDateEntity that = (DownloadDateEntity) o;
        return userId == that.userId && roomId == that.roomId && Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(timestamp, userId, roomId);
    }
}
