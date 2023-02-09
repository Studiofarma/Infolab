package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Objects;

public class ChatMessageEntity {
    private long id;
    private UserEntity sender;
    private RoomEntity room;
    private LocalDateTime timestamp;
    private String content;

    private ChatMessageEntity(long id, UserEntity sender, RoomEntity room, LocalDateTime timestamp, String content) {
        this.id = id;
        this.sender = sender;
        this.room = room;
        this.timestamp = timestamp;
        this.content = content;
    }

    public static ChatMessageEntity of(UserEntity sender, RoomEntity room, LocalDateTime timestamp, String content) {
        return new ChatMessageEntity(ID.None, sender, room, timestamp, content);
    }

    public static ChatMessageEntity emptyMessage() {
        return new ChatMessageEntity(ID.None, null, null, null, null);
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
        ChatMessageEntity message = (ChatMessageEntity) o;
        return id == message.id && Objects.equals(sender, message.sender) && Objects.equals(content, message.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sender, content);
    }
}
