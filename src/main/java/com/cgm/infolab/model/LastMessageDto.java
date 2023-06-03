package com.cgm.infolab.model;

import com.cgm.infolab.db.model.UserEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class LastMessageDto {
    private String preview;
    private LocalDateTime timestamp;

    private String sender;

    private LastMessageDto() {
    }

    private LastMessageDto(String preview, LocalDateTime timestamp, String sender) {
        this.preview = preview;
        this.timestamp = timestamp;
        this.sender = sender;
    }

    public static LastMessageDto of(String lastMessagePreview, LocalDateTime lastMessageTimestamp, UserEntity sender) {
        return new LastMessageDto(lastMessagePreview, lastMessageTimestamp, sender.getName().value());
    }

    public static LastMessageDto empty() {
        return new LastMessageDto(null, null, null);
    }

    public String getPreview() {
        return preview;
    }

    public void setPreview(String preview) {
        this.preview = preview;
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
}
