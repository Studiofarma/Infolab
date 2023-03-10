package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

import java.util.List;

public class RoomEntity {
    private long id;
    private String name;
    private String visibility;
    private List<ChatMessageEntity> messages;

    private RoomEntity(long id, String name, String visibility, List<ChatMessageEntity> messages) {
        this.id = id;
        this.name = name;
        this.visibility = visibility;
        this.messages = messages;
    }

    public static RoomEntity of(String name) {
        return new RoomEntity(ID.None, name, "", null);
    }

    public static RoomEntity of(String name, String visibility) {
        return new RoomEntity(ID.None, name, visibility, null);
    }

    public static RoomEntity of(long id, String name, String visibility) {
        return new RoomEntity(id, name, visibility, null);
    }

    public static RoomEntity of(long id, String name, String visibility, List<ChatMessageEntity> messages) {
        return new RoomEntity(id, name, visibility, messages);
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

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
