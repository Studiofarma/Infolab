package com.cgm.infolab.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class RoomCursor {

    RoomCursorType cursorType;
    Object cursor;

    private RoomCursor() {
    }

    private RoomCursor(RoomCursorType cursorType, Object cursor) {
        this.cursorType = cursorType;
        this.cursor = cursor;
    }

    public static RoomCursor ofTimestamp(LocalDateTime cursor) {
        return new RoomCursor(RoomCursorType.TIMESTAMP, cursor);
    }

    public static RoomCursor ofDescriptionRoom(String cursor) {
        return new RoomCursor(RoomCursorType.DESCRIPTION_ROOM, cursor);
    }

    public static RoomCursor ofDescriptionUser(String cursor) {
        return new RoomCursor(RoomCursorType.DESCRIPTION_USER, cursor);
    }

    public RoomCursorType getCursorType() {
        return cursorType;
    }

    public void setCursorType(RoomCursorType cursorType) {
        this.cursorType = cursorType;
    }

    public Object getCursor() {
        return cursor;
    }

    public void setCursor(Object cursor) {
        this.cursor = cursor;
    }

    @Override
    public String toString() {
        return "RoomCursor{" +
                "cursorType=" + cursorType +
                ", cursor=" + cursor +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoomCursor that = (RoomCursor) o;
        return cursorType == that.cursorType && Objects.equals(cursor, that.cursor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cursorType, cursor);
    }

    public enum RoomCursorType {
        TIMESTAMP, DESCRIPTION_ROOM, DESCRIPTION_USER
    }
}
