package com.cgm.infolab.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class LastMessageDto {
    private String preview;
    private LocalDateTime timestamp;

    private LastMessageDto() {
    }

    private LastMessageDto(String preview, LocalDateTime timestamp) {
        this.preview = preview;
        this.timestamp = timestamp;
    }

    public static LastMessageDto of(String lastMessagePreview, LocalDateTime lastMessageTimestamp) {
        return new LastMessageDto(lastMessagePreview, lastMessageTimestamp);
    }

    public static LastMessageDto empty() {
        return new LastMessageDto(null, null);
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
}
