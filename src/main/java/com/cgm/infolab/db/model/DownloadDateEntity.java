package com.cgm.infolab.db.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class DownloadDateEntity {
    private LocalDateTime timestamp;
    private long userId;
    private Username username;
    private long messageId;

    private DownloadDateEntity(LocalDateTime timestamp, long userId, Username username, long messageId) {
        this.timestamp = timestamp;
        this.userId = userId;
        this.username = username;
        this.messageId = messageId;
    }

    public static DownloadDateEntity of(LocalDateTime timestamp, long userId, Username username, long roomId) {
        return new DownloadDateEntity(timestamp, userId, username, roomId);
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

    public Username getUsername() {
        return username;
    }

    public void setUsername(Username username) {
        this.username = username;
    }

    public long getMessageId() {
        return messageId;
    }

    public void setMessageId(long messageId) {
        this.messageId = messageId;
    }

    @Override
    public String toString() {
        return "DownloadDateEntity{" +
                "timestamp=" + timestamp +
                ", userId=" + userId +
                ", messageId=" + messageId +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DownloadDateEntity that = (DownloadDateEntity) o;
        return userId == that.userId && messageId == that.messageId && Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(timestamp, userId, messageId);
    }
}
