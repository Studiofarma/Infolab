package com.cgm.infolab.helper;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RowMappers;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.service.RoomService;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class TestDbHelper {
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomService roomService;
    private final RowMappers rowMappers;
    private final EncryptionHelper encryptionHelper;

    public TestDbHelper(JdbcTemplate jdbcTemplate, UserRepository userRepository, RoomRepository roomRepository, RoomService roomService, RowMappers rowMappers, EncryptionHelper encryptionHelper) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomService = roomService;
        this.rowMappers = rowMappers;
        this.encryptionHelper = encryptionHelper;
    }

    public void clearDb() {
        clearDbExceptForRooms();
        jdbcTemplate.update("DELETE FROM infolab.rooms");
    }

    public void clearDbExceptForGeneral() {
        clearDbExceptForRooms();
        jdbcTemplate.update("DELETE FROM infolab.rooms WHERE roomname <> 'general'");
    }

    public void clearDbExceptForRooms() {
        jdbcTemplate.update("DELETE FROM infolab.download_dates");
        jdbcTemplate.update("DELETE FROM infolab.chatmessages");
        jdbcTemplate.update("DELETE FROM infolab.rooms_subscriptions");
        jdbcTemplate.update("DELETE FROM infolab.users");
        jdbcTemplate.update("DELETE FROM infolab.avatars");
    }

    public void clearMessages() {
        jdbcTemplate.update("DELETE FROM infolab.download_dates");
        jdbcTemplate.update("DELETE FROM infolab.chatmessages");
    }

    public UserEntity[] addUsers(UserEntity... users) {
        for (int i = 0; i < users.length; i++) {
            users[i] = userRepository.add(users[i]);
        }

        return users;
    }

    public void addRooms(RoomEntity... rooms) {
        for (RoomEntity room : rooms) {
            roomRepository.add(room);
        }
    }

    public void addPrivateRoomsAndSubscribeUsers(List<Pair<UserEntity, UserEntity>> userPairs) {
        for (Pair<UserEntity, UserEntity> p :
                userPairs) {
            roomService.createPrivateRoomAndSubscribeUsers(p.getLeft().getName(), p.getRight().getName());
        }
    }

    public void insertCustomMessage(long messageId, String senderName, String recipientRoomName, LocalDateTime sentAt, String content) {

        String encryptedContent;

        try {
            encryptedContent = encryptionHelper.encryptWithAes(content);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | InvalidAlgorithmParameterException |
                 NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {
            throw new RuntimeException(e);
        }

        jdbcTemplate.update("INSERT INTO infolab.chatmessages (id, sender_name, recipient_room_name, sent_at, content) values" +
                "(?, ?, ?, ?, ?)", messageId, senderName, recipientRoomName, sentAt, encryptedContent);
    }

    public void insertCustomReadDate(LocalDateTime timestamp, long message_id, String username) {
        jdbcTemplate.update("INSERT INTO infolab.download_dates (download_timestamp, message_id, username) values" +
                "(?, ?, ?)", timestamp, message_id, username);
    }

    public void insertCustomUser(long id, String username, String description, UserStatusEnum status, ThemeEnum theme) {
        jdbcTemplate.update("INSERT INTO infolab.users (id, username, description, status, theme) VALUES (?, ?, ?, ?, ?)",
                id, username, description, status.toString(), theme.toString());
    }

    public List<ChatMessageEntity> getAllMessages() {
        return jdbcTemplate
                .query("SELECT m.id message_id, u_mex.id user_id, u_mex.username username, u_mex.description sender_description, r.id room_id, r.roomname roomname, r.visibility, m.sent_at, m.content, m.status message_status " +
                        "FROM infolab.chatmessages m JOIN infolab.rooms r ON r.roomname = m.recipient_room_name " +
                        "JOIN infolab.users u_mex ON u_mex.username = m.sender_name", rowMappers::mapToChatMessageEntity);
    }

    public <T> List<T> getAllMessages(RowMapper<T> rowMapper) {
        return jdbcTemplate
                .query("SELECT m.id message_id, u_mex.id user_id, u_mex.username username, u_mex.description sender_description, r.id room_id, r.roomname roomname, r.visibility, m.sent_at, m.content, m.status message_status " +
                        "FROM infolab.chatmessages m JOIN infolab.rooms r ON r.roomname = m.recipient_room_name " +
                        "JOIN infolab.users u_mex ON u_mex.username = m.sender_name", rowMapper);
    }

    public Long getRoomId(String roomName) {
        return jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = ?", (rs, rowNum) -> rs.getLong("id"), roomName);
    }

    public Long getUserId(String username) {
        return jdbcTemplate.queryForObject("select * from infolab.users where username = ?", (rs, rowNum) -> rs.getLong("id"), username);
    }
}
