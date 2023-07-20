package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.enums.StatusEnum;

import java.time.LocalDateTime;
import java.util.Objects;

public class ChatMessageEntity {
    private long id;
    private UserEntity sender;
    private RoomEntity room;
    private LocalDateTime timestamp;
    private String content;
    private StatusEnum status;

    private ChatMessageEntity(long id, UserEntity sender, RoomEntity room, LocalDateTime timestamp, String content, StatusEnum status) {
        this.id = id;
        this.sender = sender;
        this.room = room;
        this.timestamp = timestamp;
        this.content = content;
        this.status = status;
    }

    public static ChatMessageEntity of(UserEntity sender, RoomEntity room, LocalDateTime timestamp, String content) {
        return new ChatMessageEntity(ID.None, sender, room, timestamp, content, null);
    }

    public static ChatMessageEntity of(long id, UserEntity sender, RoomEntity room, LocalDateTime timestamp, String content, StatusEnum status) {
        return new ChatMessageEntity(id, sender, room, timestamp, content, status);
    }

    public static ChatMessageEntity empty() {
        return new ChatMessageEntity(ID.None, UserEntity.empty(), RoomEntity.empty(), null, "", null);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public UserEntity getSender() {
        return sender;
    }

    public void setSender(UserEntity sender) {
        this.sender = sender;
    }

    public RoomEntity getRoom() {
        return room;
    }

    public void setRoom(RoomEntity room) {
        this.room = room;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public StatusEnum getStatus() {
        return status;
    }

    public void setStatus(StatusEnum status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "ChatMessageEntity{" +
                "id=" + id +
                ", sender=" + sender +
                ", room=" + room +
                ", timestamp=" + timestamp +
                ", content='" + content + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessageEntity that = (ChatMessageEntity) o;
        return id == that.id && Objects.equals(sender, that.sender) && Objects.equals(room, that.room) && Objects.equals(timestamp, that.timestamp) && Objects.equals(content, that.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, sender, room, timestamp, content);
    }
}
