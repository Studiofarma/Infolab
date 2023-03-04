package com.cgm.infolab.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class LastMessageDto {
    private String lastMessagePreview;
    private LocalDateTime lastMessageTimestamp;

    private LastMessageDto() {
    }

    private LastMessageDto(String lastMessagePreview, LocalDateTime lastMessageTimestamp) {
        this.lastMessagePreview = lastMessagePreview;
        this.lastMessageTimestamp = lastMessageTimestamp;
    }

    public static LastMessageDto of(String lastMessagePreview, LocalDateTime lastMessageTimestamp) {
        return new LastMessageDto(lastMessagePreview, lastMessageTimestamp);
    }

    public static LastMessageDto empty() {
        return new LastMessageDto(null, null);
    }

    public String getLastMessagePreview() {
        return lastMessagePreview;
    }

    public void setLastMessagePreview(String lastMessagePreview) {
        this.lastMessagePreview = lastMessagePreview;
    }

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public LocalDateTime getLastMessageTimestamp() {
        return lastMessageTimestamp;
    }

    public void setLastMessageTimestamp(LocalDateTime lastMessageTimestamp) {
        this.lastMessageTimestamp = lastMessageTimestamp;
    }
}
