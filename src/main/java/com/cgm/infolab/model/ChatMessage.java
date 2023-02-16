package com.cgm.infolab.model;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Objects;


public class ChatMessage {
    private String content;
    private LocalDateTime timestamp;
    private String sender;

    public ChatMessage() {
    }

    public ChatMessage(String content, String sender) {
        this.sender = sender;
        this.content = content;
    }

    public ChatMessage(String content, LocalDateTime timestamp, String sender) {
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
    }
    public ChatMessage(String content, Timestamp timestamp, String sender) {
        this.content = content;
        this.timestamp = timestamp.toLocalDateTime();
        this.sender = sender;
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
        return "ChatMessage{" +
                "sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessage message = (ChatMessage) o;
        return Objects.equals(sender, message.sender) && Objects.equals(content, message.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sender, content);
    }
}

