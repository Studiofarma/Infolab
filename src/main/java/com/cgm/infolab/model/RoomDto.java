package com.cgm.infolab.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.net.URL;
import java.time.LocalDateTime;

public class RoomDto {
    private String roomName;
    private URL avatarLink;
    private int unreadMessages;
    private String lastMessagePreview;
    private LocalDateTime lastMessageTimestamp;

    private RoomDto() {
    }

    private RoomDto(String roomName,
                    URL avatarLink,
                    int unreadMessages,
                    String lastMessagePreview,
                    LocalDateTime lastMessageTimestamp) {
        this.roomName = roomName;
        this.avatarLink = avatarLink;
        this.unreadMessages = unreadMessages;
        this.lastMessagePreview = lastMessagePreview;
        this.lastMessageTimestamp = lastMessageTimestamp;
    }

    public static RoomDto emptyRoom() {
        return new RoomDto(null, null, 0, null, null);
    }

    public static RoomDto of(String roomName) {
        return new RoomDto(roomName, null, 0, null, null);
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

    public String getLastMessagePreview() {
        return lastMessagePreview;
    }

    public void setLastMessagePreview(String lastMessagePreview) {
        this.lastMessagePreview = lastMessagePreview;
    }

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public LocalDateTime getLastMessageTimestamp() {
        return lastMessageTimestamp;
    }

    public void setLastMessageTimestamp(LocalDateTime lastMessageTimestamp) {
        this.lastMessageTimestamp = lastMessageTimestamp;
    }
}
