package com.cgm.infolab.model;

import com.cgm.infolab.db.ID;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Objects;


public class ChatMessageDto {
    private long id;
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")

    private LocalDateTime timestamp;
    private String sender;
    private String roomName;

    private ChatMessageDto() {
    }

    private ChatMessageDto(int id, String content, LocalDateTime timestamp, String sender, String roomName) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.roomName = roomName;
    }

    public static ChatMessageDto of(String content, String sender) {
        return new ChatMessageDto(ID.None, content, null, sender, "");
    }

    public static ChatMessageDto of(String content, LocalDateTime timestamp, String sender) {
        return new ChatMessageDto(ID.None, content, timestamp, sender, "");
    }

    public static ChatMessageDto of(String content, LocalDateTime timestamp, String sender, String roomName) {
        return new ChatMessageDto(ID.None, content, timestamp, sender, roomName);
    }
    public static ChatMessageDto of(int id, String content, LocalDateTime timestamp, String sender, String roomName) {
        return new ChatMessageDto(id, content, timestamp, sender, roomName);
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

    @Override
    public String toString() {
        return "ChatMessageDto{" +
                "content='" + content + '\'' +
                ", timestamp=" + timestamp +
                ", sender='" + sender + '\'' +
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

