package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.StatusEnum;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import org.apache.commons.lang3.tuple.Pair;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

public abstract class RowMappers {

    public static ChatMessageEntity mapToChatMessageEntity(ResultSet rs, int rowNum) throws SQLException {

        UserEntity user = UserEntity.of(rs.getLong("user_id"),
                Username.of(rs.getString("username")));

        String roomName = rs.getString("roomname2");
        RoomTypeEnum roomType = getRoomType(roomName);

        RoomEntity room = RoomEntity.of(
                rs.getLong("room_id"),
                RoomName.of(roomName),
                VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                roomType
        );

        String statusString = rs.getString("status");
        StatusEnum status = statusString != null && !statusString.trim().isEmpty() ? StatusEnum.valueOf(statusString.trim()) : null;

        String content = status != null && status.equals(StatusEnum.DELETED) ? "" : rs.getString("content");

        return ChatMessageEntity
                .of(rs.getLong("message_id"),
                        user,
                        room,
                        rs.getObject("sent_at", LocalDateTime.class),
                        content,
                        status
                );
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
        String roomName = rs.getString("roomname2");
        RoomTypeEnum roomType = getRoomType(roomName);

        ChatMessageEntity messageEntity = rs.getString("content") != null ?  mapToChatMessageEntity(rs, rowNum) : ChatMessageEntity.empty();

        VisibilityEnum visibility = rs.getString("visibility") != null ? VisibilityEnum.valueOf(rs.getString("visibility").trim()) : VisibilityEnum.PRIVATE;

        RoomEntity room = RoomEntity.of(
                rs.getLong("room_id"),
                RoomName.of(roomName),
                visibility,
                roomType,
                rs.getString("description"),
                List.of(messageEntity)
        );

        if (rs.getString("other_user_id") != null) {
            room.setOtherParticipants(List.of(mapToOtherUserEntity(rs, rowNum)));
        }

        return room;
    }

    public static RoomEntity mapToRoomEntityWithMessages2(ResultSet rs, int rowNum) throws SQLException {
        String roomName = rs.getString("roomname2");
        RoomTypeEnum roomType = getRoomType(roomName);

        ChatMessageEntity messageEntity = rs.getString("content") != null ?  mapToChatMessageEntity(rs, rowNum) : ChatMessageEntity.empty();

        VisibilityEnum visibility = rs.getString("visibility") != null ? VisibilityEnum.valueOf(rs.getString("visibility").trim()) : VisibilityEnum.PRIVATE;

        Long roomId = rs.getObject("room_id", Long.class);
        roomId = roomId != null ? roomId : ID.None;

        RoomEntity room = RoomEntity.of(
                roomId,
                RoomName.of(roomName),
                visibility,
                roomType,
                rs.getString("description"),
                List.of(messageEntity)
        );

        if (!room.getVisibility().equals(VisibilityEnum.PUBLIC)) {
            if (rs.getString("other_user_id") != null) {
                room.setOtherParticipants(List.of(mapToOtherUserEntity(rs, rowNum)));
            } else { // In this case the room doesn't exist yet, but the user has been returned
                room.setOtherParticipants(List.of(mapToNewUserEntity(rs, rowNum)));
            }
        }

        return room;
    }

    public static UserEntity mapToUserEntity(ResultSet rs, int rowNum) throws SQLException {
        String usernameString = rs.getString("username");

        String description = rs.getString("description");

        description = description == null || description.isEmpty() ? usernameString : description;

        return UserEntity.of(rs.getLong("id"),
                Username.of(usernameString),
                description);
    }

    public static UserEntity mapToOtherUserEntity(ResultSet rs, int rowNum) throws SQLException {
        return UserEntity.of(
                rs.getLong("other_user_id"),
                Username.of(rs.getString("other_username")),
                rs.getString("other_description")
        );
    }

    public static UserEntity mapToNewUserEntity(ResultSet rs, int rowNum) throws SQLException {
        return UserEntity.of(
                rs.getLong("new_user_id"),
                Username.of(rs.getString("new_user_username")),
                rs.getString("new_user_description")
        );
    }

    public static Pair<Long, Integer> mapNotDownloadedMessagesCount(ResultSet rs, int rowNum) throws SQLException {
        return Pair.of(rs.getLong("id"), rs.getInt("not_downloaded_count"));
    }

    public static Pair<Long, LocalDateTime> mapLastDownloadedDate(ResultSet rs, int rowNum) throws SQLException {
        if (rs.getTimestamp("download_timestamp") == null) {
            return Pair.of(rs.getLong("id"), null);
        } else {
            return Pair.of(rs.getLong("id"), rs.getObject("download_timestamp", LocalDateTime.class));
        }
    }

    // TODO: remove when roomType will come from the db
    private static RoomTypeEnum getRoomType(String roomName) {
        return roomName.equals("general") ? RoomTypeEnum.GROUP : RoomTypeEnum.USER2USER;
    }
}
