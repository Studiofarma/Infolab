package com.cgm.infolab.model;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

public class WebSocketMessageDto {
    private WebSocketMessageTypeEnum type;
    private ChatMessageDto chat;
    private ChatMessageDto edit;
    private ChatMessageDto delete;

    private WebSocketMessageDto(@NonNull WebSocketMessageTypeEnum type,
                                @Nullable ChatMessageDto chat,
                                @Nullable ChatMessageDto edit,
                                @Nullable ChatMessageDto delete) {
        this.type = type;
        this.chat = chat;
        this.edit = edit;
        this.delete = delete;
    }

    public static WebSocketMessageDto ofChat(ChatMessageDto chat) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.CHAT, chat, null, null);
    }

    public static WebSocketMessageDto ofEdit(ChatMessageDto edit) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.EDIT, null, edit, null);
    }

    public static WebSocketMessageDto ofDelete(ChatMessageDto delete) {
        return new WebSocketMessageDto(WebSocketMessageTypeEnum.DELETE, null, null, delete);
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
}
