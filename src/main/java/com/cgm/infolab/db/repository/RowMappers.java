package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.*;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.EncryptionHelper;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class RowMappers {

    private final EncryptionHelper encryptionHelper;

    private static final Logger log = LoggerFactory.getLogger(RowMappers.class);

    public RowMappers(EncryptionHelper encryptionHelper) {
        this.encryptionHelper = encryptionHelper;
    }

    public ChatMessageEntity mapToChatMessageEntity(ResultSet rs, int rowNum) throws SQLException {

        UserEntity user = UserEntity.of(Username.of(rs.getString("username")), rs.getString("sender_description"));

        String roomName = rs.getString("roomname");
        RoomTypeEnum roomType = getRoomType(roomName);

        RoomEntity room = RoomEntity.of(
                rs.getLong("room_id"),
                RoomName.of(roomName),
                VisibilityEnum.valueOf(rs.getString("visibility").trim()),
                roomType
        );

        String statusString = rs.getString("message_status");
        MessageStatusEnum status = statusString != null && !statusString.trim().isEmpty() ? MessageStatusEnum.valueOf(statusString.trim()) : null;

        String content = null;
        try {
            content = status != null && status.equals(MessageStatusEnum.DELETED)
                    ? ""
                    : encryptionHelper.decryptWithAes(rs.getString("content"));
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | InvalidAlgorithmParameterException |
                 NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {
            log.error("Error while decrypting the message: %s - %s".formatted(e.getClass(), e.getMessage()));
        }

        return ChatMessageEntity
                .of(rs.getLong("message_id"),
                        user,
                        room,
                        rs.getObject("sent_at", LocalDateTime.class),
                        content,
                        status
                );
    }

    public RoomEntity mapToRoomEntity(ResultSet rs, int rowNum) throws SQLException {
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

    public RoomEntity mapToRoomEntityWithMessages(ResultSet rs, int rowNum) throws SQLException {
        String roomName = rs.getString("roomname");
        RoomTypeEnum roomType = getRoomType(roomName);

        ChatMessageEntity messageEntity = rs.getString("content") != null ?  mapToChatMessageEntity(rs, rowNum) : ChatMessageEntity.empty();

        VisibilityEnum visibility = rs.getString("visibility") != null ? VisibilityEnum.valueOf(rs.getString("visibility").trim()) : VisibilityEnum.PRIVATE;

        Long roomId = rs.getObject("room_id", Long.class);

        RoomOrUserAsRoomEnum roomOrUser;

        if (roomId == null) {
            roomId = (long) ID.None;
            roomOrUser = RoomOrUserAsRoomEnum.USER_AS_ROOM;
        } else {
            roomOrUser = RoomOrUserAsRoomEnum.ROOM;
        }


        String description = rs.getString("description") != null ? rs.getString("description") : rs.getString("new_user_description");

        RoomEntity room = RoomEntity.of(
                roomId,
                RoomName.of(roomName),
                visibility,
                roomType,
                description,
                roomOrUser,
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

    public UserEntity mapToUserEntity(ResultSet rs, int rowNum) throws SQLException {
        String usernameString = rs.getString("username");

        String description = rs.getString("description");

        description = description == null || description.isEmpty() ? usernameString : description;

        return UserEntity.of(
                rs.getLong("id"),
                Username.of(usernameString),
                description,
                UserStatusEnum.valueOf(rs.getString("user_status").trim())
        );
    }

    public UserEntity mapToOtherUserEntity(ResultSet rs, int rowNum) throws SQLException {
        return UserEntity.of(
                rs.getLong("other_user_id"),
                Username.of(rs.getString("other_username")),
                rs.getString("other_description"),
                UserStatusEnum.valueOf(rs.getString("other_status").trim())
        );
    }

    public UserEntity mapToNewUserEntity(ResultSet rs, int rowNum) throws SQLException {
        return UserEntity.of(
                rs.getLong("new_user_id"),
                Username.of(rs.getString("new_user_username")),
                rs.getString("new_user_description")
        );
    }

    public Pair<RoomName, Integer> mapNotDownloadedMessagesCount(ResultSet rs, int rowNum) throws SQLException {
        return Pair.of(RoomName.of(rs.getString("roomname")), rs.getInt("not_downloaded_count"));
    }

    public Pair<RoomName, LocalDateTime> mapLastDownloadedDate(ResultSet rs, int rowNum) throws SQLException {
        if (rs.getTimestamp("download_timestamp") == null) {
            return Pair.of(RoomName.of(rs.getString("roomname")), null);
        } else {
            return Pair.of(RoomName.of(rs.getString("roomname")), rs.getObject("download_timestamp", LocalDateTime.class));
        }
    }

    // TODO: remove when roomType will come from the db
    private RoomTypeEnum getRoomType(String roomName) {
        return roomName.equals("general") ? RoomTypeEnum.GROUP : RoomTypeEnum.USER2USER;
    }
}
