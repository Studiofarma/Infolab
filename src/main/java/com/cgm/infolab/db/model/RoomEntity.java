package com.cgm.infolab.db.model;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.enumeration.RoomOrUserAsRoomEnum;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class RoomEntity {
    private long id;
    private RoomName name;
    private VisibilityEnum visibility;
    private RoomTypeEnum roomType;
    private String description;
    private int notDownloadedMessagesCount;
    private LocalDateTime lastDownloadedDate;
    private RoomOrUserAsRoomEnum roomOrUser;
    private List<ChatMessageEntity> messages;
    private List<UserEntity> otherParticipants;

    private RoomEntity(long id,
                       RoomName name,
                       VisibilityEnum visibility,
                       RoomTypeEnum roomType,
                       String description,
                       int notDownloadedMessagesCount,
                       LocalDateTime lastDownloadedDate, RoomOrUserAsRoomEnum type, List<ChatMessageEntity> messages,
                       List<UserEntity> otherParticipants) {
        this.id = id;
        this.name = name;
        this.visibility = visibility;
        this.roomType = roomType;
        this.description = description;
        this.notDownloadedMessagesCount = notDownloadedMessagesCount;
        this.lastDownloadedDate = lastDownloadedDate;
        this.roomOrUser = type;
        this.messages = messages;
        this.otherParticipants = otherParticipants;
    }

    public static RoomEntity of(RoomName name, VisibilityEnum visibility, RoomTypeEnum roomType) {
        return new RoomEntity(ID.None, name, visibility, roomType, "", 0, null, RoomOrUserAsRoomEnum.UNKNOWN, null, null);
    }

    public static RoomEntity of(RoomName name, VisibilityEnum visibility, RoomTypeEnum roomType, String description) {
        return new RoomEntity(ID.None, name, visibility, roomType, description, 0, null, RoomOrUserAsRoomEnum.UNKNOWN, null, null);
    }

    public static RoomEntity general() {
        return RoomEntity.of(RoomName.of("general"), VisibilityEnum.PUBLIC, RoomTypeEnum.GROUP, "Generale");
    }

    public static RoomEntity of(long id, RoomName name, VisibilityEnum visibility, RoomTypeEnum roomType) {
        return new RoomEntity(id, name, visibility, roomType, "", 0, null, RoomOrUserAsRoomEnum.UNKNOWN, null, null);
    }

    public static RoomEntity of(long id, RoomName name, VisibilityEnum visibility, RoomTypeEnum roomType, String description) {
        return new RoomEntity(id, name, visibility, roomType, description, 0, null, RoomOrUserAsRoomEnum.UNKNOWN, null, null);
    }

    public static RoomEntity of(long id, RoomName name, VisibilityEnum visibility, RoomTypeEnum roomType, String description, RoomOrUserAsRoomEnum roomOrUser, List<ChatMessageEntity> messages) {
        return new RoomEntity(id, name, visibility, roomType, description, 0, null, roomOrUser, messages, new ArrayList<>());
    }

    public static RoomEntity of(long id, RoomName name, VisibilityEnum visibility, RoomTypeEnum roomType, String description, RoomOrUserAsRoomEnum roomOrUser, List<ChatMessageEntity> messages, List<UserEntity> users) {
        return new RoomEntity(id, name, visibility, roomType, description, 0, null, roomOrUser, messages, users);
    }

    public static RoomEntity empty() {
        return new RoomEntity(ID.None, RoomName.empty(), null, null, "", 0, null, RoomOrUserAsRoomEnum.UNKNOWN, new ArrayList<>(), new ArrayList<>());
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

    public VisibilityEnum getVisibility() {
        return visibility;
    }

    public void setVisibility(VisibilityEnum visibility) {
        this.visibility = visibility;
    }

    public RoomTypeEnum getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomTypeEnum roomType) {
        this.roomType = roomType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getNotDownloadedMessagesCount() {
        return notDownloadedMessagesCount;
    }

    public void setNotDownloadedMessagesCount(int notDownloadedMessagesCount) {
        this.notDownloadedMessagesCount = notDownloadedMessagesCount;
    }

    public LocalDateTime getLastDownloadedDate() {
        return lastDownloadedDate;
    }

    public void setLastDownloadedDate(LocalDateTime lastDownloadedDate) {
        this.lastDownloadedDate = lastDownloadedDate;
    }

    public RoomOrUserAsRoomEnum getRoomOrUser() {
        return roomOrUser;
    }

    public void setRoomOrUser(RoomOrUserAsRoomEnum roomOrUser) {
        this.roomOrUser = roomOrUser;
    }

    public List<ChatMessageEntity> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessageEntity> messages) {
        this.messages = messages;
    }

    public List<UserEntity> getOtherParticipants() {
        return otherParticipants;
    }

    public void setOtherParticipants(List<UserEntity> otherParticipants) {
        this.otherParticipants = otherParticipants;
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
