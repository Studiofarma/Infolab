package com.cgm.infolab.model;

public class WebSocketMessageDto {
    private WebSocketMessageTypeEnum type;
    private ChatMessageDto chat;
    private ChatMessageDto edit;
    private ChatMessageDto delete;

    public WebSocketMessageDto(WebSocketMessageTypeEnum type, ChatMessageDto chat, ChatMessageDto edit, ChatMessageDto delete) {
        this.type = type;
        this.chat = chat;
        this.edit = edit;
        this.delete = delete;
    }

    public WebSocketMessageTypeEnum getType() {
        return type;
    }

    public void setType(WebSocketMessageTypeEnum type) {
        this.type = type;
    }

    public ChatMessageDto getChat() {
        return chat;
    }

    public void setChat(ChatMessageDto chat) {
        this.chat = chat;
    }

    public ChatMessageDto getEdit() {
        return edit;
    }

    public void setEdit(ChatMessageDto edit) {
        this.edit = edit;
    }

    public ChatMessageDto getDelete() {
        return delete;
    }

    public void setDelete(ChatMessageDto delete) {
        this.delete = delete;
    }
}
