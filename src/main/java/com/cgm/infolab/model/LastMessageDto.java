package com.cgm.infolab.model;

import com.cgm.infolab.db.ID;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Objects;

import static com.cgm.infolab.helper.DateTimeHelper.PATTERN_WITH_SPACE;

public class LastMessageDto {

    private long id;
    private String content;
    @JsonFormat(pattern = PATTERN_WITH_SPACE)
    private LocalDateTime timestamp;
    private UserDto sender;
    private String status;

    private LastMessageDto() {
    }

    private LastMessageDto(long id, String content, LocalDateTime timestamp, UserDto sender, String status) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.status = status;
    }

    public static LastMessageDto of(long id, String lastMessagePreview, LocalDateTime lastMessageTimestamp, UserDto sender, String status) {
        return new LastMessageDto(id, lastMessagePreview, lastMessageTimestamp, sender, status);
    }

    public static LastMessageDto empty() {
        return new LastMessageDto(ID.None, null, null, null, null);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
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

    public UserDto getSender() {
        return this.sender;
    }

    public void setSender(UserDto sender) {
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
        return "LastMessageDto{" +
                "content='" + content + '\'' +
                ", timestamp=" + timestamp +
                ", sender=" + sender +
                ", status='" + status + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LastMessageDto that = (LastMessageDto) o;
        return Objects.equals(content, that.content) && Objects.equals(timestamp, that.timestamp) && Objects.equals(sender, that.sender) && Objects.equals(status, that.status);
    }

    @Override
    public int hashCode() {
        return Objects.hash(content, timestamp, sender, status);
    }
}
