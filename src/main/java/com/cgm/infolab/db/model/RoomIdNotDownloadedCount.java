package com.cgm.infolab.db.model;

public class RoomIdNotDownloadedCount {
    private final long roomId;
    private final int notDownloadedCount;

    private RoomIdNotDownloadedCount(long roomId, int notDownloadedCount) {
        this.roomId = roomId;
        this.notDownloadedCount = notDownloadedCount;
    }

    public static RoomIdNotDownloadedCount of(long roomId, int notDownloadedCount) {
        return new RoomIdNotDownloadedCount(roomId, notDownloadedCount);
    }

    public long getRoomId() {
        return roomId;
    }

    public int getNotDownloadedCount() {
        return notDownloadedCount;
    }
}
