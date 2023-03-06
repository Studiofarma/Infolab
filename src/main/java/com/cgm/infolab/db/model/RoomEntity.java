package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

import java.util.List;

public class RoomEntity {
    private long id;
    private String name;
    private List<ChatMessageEntity> messages;

    private RoomEntity(long id, String name, List<ChatMessageEntity> messages) {
        this.id = id;
        this.name = name;
        this.messages = messages;
    }

    public static RoomEntity of(String name) {
        return new RoomEntity(ID.None, name, null);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ChatMessageEntity> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessageEntity> messages) {
        this.messages = messages;
    }
}
