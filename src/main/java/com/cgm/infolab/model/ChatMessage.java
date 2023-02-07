package com.cgm.infolab.model;

import com.cgm.infolab.db.UserEntity;

import java.util.Objects;


public class ChatMessage {

    // TODO: rimuovere quando non più necessario.
    private String sender;
    private UserEntity userSender;
    private String content;

    public ChatMessage() {
    }

    public ChatMessage(String sender, String content) {
        this.sender = sender;
        this.userSender = new UserEntity(this.sender);
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public UserEntity getUserSender() {
        return userSender;
    }

    public void setSender(String sender) {
        this.sender = sender;
        this.userSender = new UserEntity(this.sender);
    }

    public void setUserSender(UserEntity userSender) {
        this.userSender = userSender;
        this.sender = this.userSender.getName();
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
                "userSender='" + userSender + '\'' +
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

