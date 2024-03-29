package com.cgm.infolab.model;

import com.cgm.infolab.db.model.enumeration.RoomOrUserAsRoomEnum;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static com.cgm.infolab.helper.DateTimeHelper.PATTERN_WITH_SPACE;

public class RoomDto {
    private String roomName;
    private URL avatarLink;
    private int unreadMessages;
    @JsonFormat(pattern = PATTERN_WITH_SPACE)
    private LocalDateTime lastReadTimestamp;
    private String description;
    private String visibility;
    private String roomType;
    private RoomOrUserAsRoomEnum roomOrUser;
    private LastMessageDto lastMessage;
    private List<UserDto> otherParticipants;

    private RoomDto() {
    }

    private RoomDto(String roomName,
                    URL avatarLink,
                    int unreadMessages,
                    LocalDateTime lastReadTimestamp, String description,
                    String visibility,
                    String roomType,
                    RoomOrUserAsRoomEnum roomOrUser, LastMessageDto lastMessage,
                    List<UserDto> otherParticipants) {
        this.roomName = roomName;
        this.avatarLink = avatarLink;
        this.unreadMessages = unreadMessages;
        this.lastReadTimestamp = lastReadTimestamp;
        this.description = description;
        this.visibility = visibility;
        this.roomType = roomType;
        this.roomOrUser = roomOrUser;
        this.lastMessage = lastMessage;
        this.otherParticipants = otherParticipants;
    }

    public static RoomDto empty() {
        return new RoomDto("", null, 0, null, "", "", "", RoomOrUserAsRoomEnum.UNKNOWN, LastMessageDto.empty(), new ArrayList<>());
    }

    public static RoomDto of(String roomName, int unreadMessages, LocalDateTime lastReadTimestamp, String description, String visibility, String roomType, RoomOrUserAsRoomEnum roomOrUser) {
        return new RoomDto(roomName, null, unreadMessages, lastReadTimestamp, description, visibility, roomType, roomOrUser, LastMessageDto.empty(), new ArrayList<>());
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public URL getAvatarLink() {
        return avatarLink;
    }

    public void setAvatarLink(URL avatarLink) {
        this.avatarLink = avatarLink;
    }

    public int getUnreadMessages() {
        return unreadMessages;
    }

    public void setUnreadMessages(int unreadMessages) {
        this.unreadMessages = unreadMessages;
    }

    public LocalDateTime getLastReadTimestamp() {
        return lastReadTimestamp;
    }

    public void setLastReadTimestamp(LocalDateTime lastReadTimestamp) {
        this.lastReadTimestamp = lastReadTimestamp;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public RoomOrUserAsRoomEnum getRoomOrUser() {
        return roomOrUser;
    }

    public void setRoomOrUser(RoomOrUserAsRoomEnum roomOrUser) {
        this.roomOrUser = roomOrUser;
    }

    public LastMessageDto getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(LastMessageDto lastMessage) {
        this.lastMessage = lastMessage;
    }

    public List<UserDto> getOtherParticipants() {
        return otherParticipants;
    }

    public void setOtherParticipants(List<UserDto> otherParticipants) {
        this.otherParticipants = otherParticipants;
    }

    @Override
    public String toString() {
        return "RoomDto{" +
                "roomName='" + roomName + '\'' +
                ", avatarLink=" + avatarLink +
                ", unreadMessages=" + unreadMessages +
                ", lastReadTimestamp=" + lastReadTimestamp +
                ", description='" + description + '\'' +
                ", visibility='" + visibility + '\'' +
                ", roomType='" + roomType + '\'' +
                ", lastMessage=" + lastMessage +
                ", otherParticipants=" + otherParticipants +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoomDto roomDto = (RoomDto) o;
        return unreadMessages == roomDto.unreadMessages && Objects.equals(roomName, roomDto.roomName) && Objects.equals(avatarLink, roomDto.avatarLink) && Objects.equals(lastReadTimestamp, roomDto.lastReadTimestamp) && Objects.equals(description, roomDto.description) && Objects.equals(visibility, roomDto.visibility) && Objects.equals(roomType, roomDto.roomType) && Objects.equals(lastMessage, roomDto.lastMessage) && Objects.equals(otherParticipants, roomDto.otherParticipants);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomName, avatarLink, unreadMessages, lastReadTimestamp, description, visibility, roomType, lastMessage, otherParticipants);
    }
}
