package com.cgm.infolab.model;

import com.cgm.infolab.db.UserEntity;

import java.util.Objects;


public class ChatMessage {
    private String sender;
    private String content;

    public ChatMessage() {
    }

    public ChatMessage(String sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

