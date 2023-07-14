package com.cgm.infolab.model;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class RoomDto {
    private String roomName;
    private URL avatarLink;
    private int unreadMessages;
    private String description;
    private String visibility;
    private String roomType;
    private LastMessageDto lastMessage;
    private List<UserDto> users;

    private RoomDto() {
    }

    private RoomDto(String roomName,
                    URL avatarLink,
                    int unreadMessages,
                    String description,
                    String visibility,
                    String roomType,
                    LastMessageDto lastMessage,
                    List<UserDto> users) {
        this.roomName = roomName;
        this.avatarLink = avatarLink;
        this.unreadMessages = unreadMessages;
        this.description = description;
        this.visibility = visibility;
        this.roomType = roomType;
        this.lastMessage = lastMessage;
        this.users = users;
    }

    public static RoomDto empty() {
        return new RoomDto("", null, 0, "", "", "", LastMessageDto.empty(), new ArrayList<>());
    }

    public static RoomDto of(String roomName, int unreadMessages, String description, String visibility, String roomType) {
        return new RoomDto(roomName, null, unreadMessages, description, visibility, roomType, LastMessageDto.empty(), new ArrayList<>());
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

    public LastMessageDto getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(LastMessageDto lastMessage) {
        this.lastMessage = lastMessage;
    }

    public List<UserDto> getUsers() {
        return users;
    }

    public void setUsers(List<UserDto> users) {
        this.users = users;
    }
}
