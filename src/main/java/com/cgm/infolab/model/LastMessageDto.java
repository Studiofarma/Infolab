package com.cgm.infolab.model;

import com.cgm.infolab.db.model.UserEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class LastMessageDto {
    private String content;
    private LocalDateTime timestamp;
    private String sender;
    private String status;

    private LastMessageDto() {
    }

    private LastMessageDto(String content, LocalDateTime timestamp, String sender, String status) {
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.status = status;
    }

    public static LastMessageDto of(String lastMessagePreview, LocalDateTime lastMessageTimestamp, UserEntity sender, String status) {
        return new LastMessageDto(lastMessagePreview, lastMessageTimestamp, sender.getName().value(), status);
    }

    public static LastMessageDto empty() {
        return new LastMessageDto(null, null, null, null);
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSender() {
        return this.sender;
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
}
