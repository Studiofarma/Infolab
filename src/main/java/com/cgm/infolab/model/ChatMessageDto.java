package com.cgm.infolab.model;

import com.cgm.infolab.db.ID;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Objects;

import static com.cgm.infolab.helper.DateTimeHelper.PATTERN_WITH_SPACE;


public class ChatMessageDto {
    private long id;
    private String content;

    @JsonFormat(pattern = PATTERN_WITH_SPACE)
    private LocalDateTime timestamp;
    private String sender;
    private String roomName;
    private String status;

    private ChatMessageDto() {
    }

    private ChatMessageDto(long id, String content, LocalDateTime timestamp, String sender, String roomName, String status) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.roomName = roomName;
        this.status = status;
    }

    public static ChatMessageDto of(long id) {
        return new ChatMessageDto(id, "", null, "", "", null);
    }

    public static ChatMessageDto of(long id, String content) {
        return new ChatMessageDto(id, content, null, "", "", null);
    }

    public static ChatMessageDto of(String content, String sender) {
        return new ChatMessageDto(ID.None, content, null, sender, "", null);
    }
    public static ChatMessageDto of(long id, String content, LocalDateTime timestamp, String sender, String roomName, String status) {
        return new ChatMessageDto(id, content, timestamp, sender, roomName, status);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "ChatMessageDto{" +
                "id=" + id +
                ", content='" + content + '\'' +
                ", timestamp=" + timestamp +
                ", sender='" + sender + '\'' +
                ", roomName='" + roomName + '\'' +
                ", status='" + status + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessageDto that = (ChatMessageDto) o;
        return Objects.equals(content, that.content) && Objects.equals(timestamp, that.timestamp) && Objects.equals(sender, that.sender);
    }

    @Override
    public int hashCode() {
        return Objects.hash(content, timestamp, sender);
    }
}

