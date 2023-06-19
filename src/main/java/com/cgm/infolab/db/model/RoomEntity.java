package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class RoomEntity {
    private long id;
    private RoomName name;
    private VisibilityEnum visibility;
    private String description;
    private List<ChatMessageEntity> messages;

    private RoomEntity(long id, RoomName name, VisibilityEnum visibility, String description, List<ChatMessageEntity> messages) {
        this.id = id;
        this.name = name;
        this.visibility = visibility;
        this.description = description;
        this.messages = messages;
    }

    public static RoomEntity of(RoomName name, VisibilityEnum visibility) {
        return new RoomEntity(ID.None, name, visibility, "", null);
    }

    public static RoomEntity of(RoomName name, VisibilityEnum visibility, String description) {
        return new RoomEntity(ID.None, name, visibility, description, null);
    }

    public static RoomEntity general() {
        return RoomEntity.of(RoomName.of("general"), VisibilityEnum.PUBLIC, "Generale");
    }



    public static RoomEntity of(long id, RoomName name, VisibilityEnum visibility) {
        return new RoomEntity(id, name, visibility, "", null);
    }

    public static RoomEntity of(long id, RoomName name, VisibilityEnum visibility, List<ChatMessageEntity> messages) {
        return new RoomEntity(id, name, visibility, "", messages);
    }

    public static RoomEntity empty() {
        return new RoomEntity(ID.None, RoomName.empty(), null, "", new ArrayList<>());
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public RoomName getName() {
        return name;
    }

    public void setName(RoomName name) {
        this.name = name;
    }

    public List<ChatMessageEntity> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessageEntity> messages) {
        this.messages = messages;
    }

    public VisibilityEnum getVisibility() {
        return visibility;
    }

    public void setVisibility(VisibilityEnum visibility) {
        this.visibility = visibility;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoomEntity room = (RoomEntity) o;
        return id == room.id && Objects.equals(name, room.name) && visibility == room.visibility && Objects.equals(messages, room.messages);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, visibility, messages);
    }
}
