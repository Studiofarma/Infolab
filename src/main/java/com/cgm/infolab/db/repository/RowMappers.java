package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.*;
import org.apache.commons.lang3.tuple.Pair;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class RowMappers {

    public static ChatMessageEntity mapToChatMessageEntity(ResultSet rs, int rowNum) throws SQLException {

        UserEntity user = UserEntity.of(rs.getLong("user_id"),
                Username.of(rs.getString("username")));

        String roomName = rs.getString("roomname");
        RoomTypeEnum roomType = getRoomType(roomName);

        RoomEntity room = RoomEntity.of(
                rs.getLong("room_id"),
                RoomName.of(roomName),
                VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                roomType
        );

        return ChatMessageEntity
                .of(rs.getLong("message_id"),
                        user,
                        room,
                        resultSetToLocalDateTime(rs),
                        rs.getString("content"));
    }

    private static LocalDateTime resultSetToLocalDateTime(ResultSet rs) throws SQLException {
        return rs
                .getTimestamp("sent_at")
                .toInstant()
                .atZone(ZoneId.of("Europe/Rome"))
                .toLocalDateTime();
    }

    public static RoomEntity mapToRoomEntity(ResultSet rs, int rowNum) throws SQLException {
        String roomName = rs.getString("roomname");
        RoomTypeEnum roomType = getRoomType(roomName);

        return RoomEntity.of(
                rs.getLong("room_id"),
                RoomName.of(roomName),
                VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                roomType,
                rs.getString("description")
        );
    }

    public static RoomEntity mapToRoomEntityWithMessages(ResultSet rs, int rowNum) throws SQLException {
        String roomName = rs.getString("roomname");
        RoomTypeEnum roomType = getRoomType(roomName);

        if (rs.getString("content") != null) {
            ChatMessageEntity message = mapToChatMessageEntity(rs, rowNum);

            return RoomEntity
                    .of(rs.getLong("room_id"),
                            RoomName.of(roomName),
                            VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                            roomType,
                            rs.getString("description"),
                            List.of(message));
        } else {
            return RoomEntity
                    .of(rs.getLong("room_id"),
                            RoomName.of(roomName),
                            VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                            roomType,
                            rs.getString("description"),
                            List.of(ChatMessageEntity.empty()));
        }
    }

    public static UserEntity mapToUserEntity(ResultSet rs, int rowNum) throws SQLException {
        return UserEntity.of(rs.getLong("id"),
                Username.of(rs.getString("username")),
                rs.getString("description"));
    }

    public static Pair<Long, Integer> mapNotDownloadedMessagesCount(ResultSet rs, int rowNum) throws SQLException {
        return Pair.of(rs.getLong("id"), rs.getInt("not_downloaded_count"));
    }

    // TODO: remove when roomType will come from the db
    private static RoomTypeEnum getRoomType(String roomName) {
        return roomName.equals("general") ? RoomTypeEnum.GROUP : RoomTypeEnum.USER2USER;
    }
}
