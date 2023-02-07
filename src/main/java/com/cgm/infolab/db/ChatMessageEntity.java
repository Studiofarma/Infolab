package com.cgm.infolab.db;

import java.util.Objects;

public class ChatMessageEntity {
    private long id;
    private UserEntity userSender;
    private String content;

    // TODO: rimuovere e mettere altro factory method
    public ChatMessageEntity() {
        this(ID.None, null, null);
    }

    private ChatMessageEntity(long id, UserEntity userSender, String content) {
        this.id = id;
        this.userSender = userSender;
        this.content = content;
    }

    public static ChatMessageEntity of(UserEntity userSender, String content) {
        return new ChatMessageEntity(ID.None, userSender, content);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public UserEntity getUserSender() {
        return userSender;
    }

    public void setUserSender(UserEntity userSender) {
        this.userSender = userSender;
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
                "userSender='" + userSender + '\'' +
                ", content='" + content + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessageEntity message = (ChatMessageEntity) o;
        return id == message.id && Objects.equals(userSender, message.userSender) && Objects.equals(content, message.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userSender, content);
    }
}
