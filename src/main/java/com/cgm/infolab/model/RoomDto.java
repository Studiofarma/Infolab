package com.cgm.infolab.model;

import com.cgm.infolab.db.model.Username;
import java.security.Principal;

import java.net.URL;

public class RoomDto {
    private String roomName;
    private URL avatarLink;
    private int unreadMessages;
    private String description;
    private LastMessageDto lastMessage;

    private RoomDto() {
    }

    private RoomDto(String roomName,
                    URL avatarLink,
                    int unreadMessages,
                    String description,
                    LastMessageDto lastMessage) {
        this.roomName = roomName;
        this.avatarLink = avatarLink;
        this.unreadMessages = unreadMessages;
        this.description = description;
        this.lastMessage = lastMessage;
    }

    public static RoomDto empty() {
        return new RoomDto("", null, 0, null, LastMessageDto.empty());
    }

    public static RoomDto of(String roomName) {
        return new RoomDto(roomName, null, 0, null, LastMessageDto.empty());
    }

    public static RoomDto of(String roomName, String description) {
        return new RoomDto(roomName, null, 0, description, LastMessageDto.empty());
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

    public LastMessageDto getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(LastMessageDto lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
