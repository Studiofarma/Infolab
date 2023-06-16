package com.cgm.infolab.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Objects;


public class ChatMessageDto {
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")

    private LocalDateTime timestamp;
    private String sender;
    private String roomName;

    private ChatMessageDto() {
    }

    public ChatMessageDto(String content, String sender) {
        this.sender = sender;
        this.content = content;
    }

    public ChatMessageDto(String content, LocalDateTime timestamp, String sender) {
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.roomName = "";
    }

    public ChatMessageDto(String content, LocalDateTime timestamp, String sender, String roomName) {
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.roomName = roomName;
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

