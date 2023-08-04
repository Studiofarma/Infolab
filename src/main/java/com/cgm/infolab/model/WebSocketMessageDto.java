package com.cgm.infolab.model;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.Objects;

public class WebSocketMessageDto {
    private WebSocketMessageTypeEnum type;
    private ChatMessageDto chat;
    private ChatMessageDto edit;
    private ChatMessageDto delete;
    private ChatMessageDto join;

    private WebSocketMessageDto(@NonNull WebSocketMessageTypeEnum type,
                                @Nullable ChatMessageDto chat,
                                @Nullable ChatMessageDto edit,
                                @Nullable ChatMessageDto delete,
                                @Nullable ChatMessageDto join) {
        this.type = type;
        this.chat = chat;
        this.edit = edit;
        this.delete = delete;
        this.join = join;
    }

    public static WebSocketMessageDto ofChat(ChatMessageDto chat) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.CHAT, chat, null, null, null);
    }

    public static WebSocketMessageDto ofEdit(ChatMessageDto edit) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.EDIT, null, edit, null, null);
    }

    public static WebSocketMessageDto ofDelete(ChatMessageDto delete) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.DELETE, null, null, delete, null);
    }

    public static WebSocketMessageDto ofJoin(ChatMessageDto join) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.JOIN, null, null, null, join);
    }

    @NonNull
    public WebSocketMessageTypeEnum getType() {
        return type;
    }

    public void setType(@NonNull WebSocketMessageTypeEnum type) {
        this.type = type;
    }

    @Nullable
    public ChatMessageDto getChat() {
        return chat;
    }

    public void setChat(ChatMessageDto chat) {
        this.chat = chat;
    }

    @Nullable
    public ChatMessageDto getEdit() {
        return edit;
    }

    public void setEdit(ChatMessageDto edit) {
        this.edit = edit;
    }

    @Nullable
    public ChatMessageDto getDelete() {
        return delete;
    }

    public void setDelete(ChatMessageDto delete) {
        this.delete = delete;
    }

    @Nullable
    public ChatMessageDto getJoin() {
        return join;
    }

    public void setJoin(ChatMessageDto join) {
        this.join = join;
    }

    @Override
    public String toString() {
        return "WebSocketMessageDto{" +
                "type=" + type +
                ", chat=" + chat +
                ", edit=" + edit +
                ", delete=" + delete +
                ", join=" + join +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WebSocketMessageDto that = (WebSocketMessageDto) o;
        return type == that.type && Objects.equals(chat, that.chat) && Objects.equals(edit, that.edit) && Objects.equals(delete, that.delete) && Objects.equals(join, that.join);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, chat, edit, delete, join);
    }
}
