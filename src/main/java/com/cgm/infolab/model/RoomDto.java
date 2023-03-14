package com.cgm.infolab.model;

import java.net.URL;

public class RoomDto {
    private String roomName;
    private URL avatarLink;
    private int unreadMessages;
    private LastMessageDto lastMessage;

    private RoomDto() {
    }

    private RoomDto(String roomName,
                    URL avatarLink,
                    int unreadMessages,
                    LastMessageDto lastMessage) {
        this.roomName = roomName;
        this.avatarLink = avatarLink;
        this.unreadMessages = unreadMessages;
        this.lastMessage = lastMessage;
    }

    public static RoomDto emptyRoom() {
        return new RoomDto(null, null, 0, null);
    }

    public static RoomDto of(String roomName) {
        return new RoomDto(roomName, null, 0, null);
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
}
