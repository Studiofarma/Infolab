package com.cgm.infolab.model;

import com.cgm.infolab.db.model.Username;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Objects;


public class ChatMessageDto {
    private String content;
    private LocalDateTime timestamp;
    private Username sender;

    private ChatMessageDto() {
    }

    public ChatMessageDto(String content, Username sender) {
        this.content = content;
        this.sender = sender;
    }

    public ChatMessageDto(String content, LocalDateTime timestamp, Username sender) {
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
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

    public Username getSender() {
        return sender;
    }

    public void setSender(Username sender) {
        this.sender = sender;
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessageDto message = (ChatMessageDto) o;
        return Objects.equals(sender, message.sender) && Objects.equals(content, message.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sender, content);
    }
}

