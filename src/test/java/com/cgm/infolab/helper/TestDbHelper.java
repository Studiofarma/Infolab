package com.cgm.infolab.helper;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RowMappers;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.service.RoomService;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TestDbHelper {
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomService roomService;

    public TestDbHelper(JdbcTemplate jdbcTemplate, UserRepository userRepository, RoomRepository roomRepository, RoomService roomService) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomService = roomService;
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

    public void insertCustomMessage(long messageId, long senderId, long recipientRoomId, LocalDateTime sentAt, String content) {
        jdbcTemplate.update("INSERT INTO infolab.chatmessages (id, sender_id, recipient_room_id, sent_at, content) values" +
                "(?, ?, ?, ?, ?)", messageId, senderId, recipientRoomId, sentAt, content);
    }

    public void insertCustomReadDate(LocalDateTime timestamp, long message_id, long user_id) {
        jdbcTemplate.update("INSERT INTO infolab.download_dates (download_timestamp, message_id, user_id) values" +
                "(?, ?, ?)", timestamp, message_id, user_id);
    }

    public List<ChatMessageEntity> getAllMessages() {
        return jdbcTemplate
                .query("SELECT m.id message_id, u_mex.id user_id, u_mex.username username, m.sender_id, r.id room_id, r.roomname, r.visibility, m.sent_at, m.content, m.status " +
                        "FROM infolab.chatmessages m JOIN infolab.rooms r ON r.id = m.recipient_room_id " +
                        "JOIN infolab.users u_mex ON u_mex.id = m.sender_id", RowMappers::mapToChatMessageEntity);
    }
}
