package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.helper.EncryptionHelper;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class LastReadDateTests {
    @Autowired
    TestDbHelper testDbHelper;
    @Autowired
    ChatService chatService;
    @Autowired
    JdbcTemplate jdbcTemplate;
    @Autowired
    DownloadDateRepository downloadDateRepository;
    @Autowired
    EncryptionHelper encryptionHelper;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};
    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
                    ChatMessageDto.of("2 Visible only to user0 and user1", users[1].getName().value()),
                    ChatMessageDto.of("3 Visible only to user1 and user2", users[1].getName().value()),
                    ChatMessageDto.of("4 Hello general from user2", users[2].getName().value()),
                    ChatMessageDto.of("5 Visible only to user0 and user1", users[0].getName().value()),
                    ChatMessageDto.of("6 Visible only to user1 and user2", users[2].getName().value())};
    public RoomEntity general = RoomEntity.general();

    @BeforeAll
    void setUp() {
        testDbHelper.clearDbExceptForGeneral();

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        chatService.saveMessageInDb(messageDtos[0], users[0].getName(), general.getName(), null);
        chatService.saveMessageInDb(messageDtos[1], users[0].getName(), RoomName.of("user0-user1"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[2], users[2].getName(), RoomName.of("user1-user2"), users[2].getName());
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), general.getName(), users[0].getName());
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"), users[1].getName());
        chatService.saveMessageInDb(messageDtos[5], users[1].getName(), RoomName.of("user1-user2"), users[1].getName());
    }

    @Test
    void whenUpdatingDownloadDate_forMessage1_itIsAfterSendDateAndBeforeNow() throws Exception {
        long message1Id = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE content = ?",
                this::messageIdMapper, encryptionHelper.encryptWithAes("1 Hello general from user0"));

        downloadDateRepository.addDownloadDateToMessages(users[1].getName(), List.of(message1Id));

        LocalDateTime readDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                message1Id);

        LocalDateTime sentDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE id = ?",
                (rs, rowNum) -> timestampMapper(rs, "sent_at"),
                message1Id);

        Assertions.assertTrue(readDate.isAfter(sentDate));
        Assertions.assertTrue(readDate.isBefore(LocalDateTime.now()));
    }

    @Test
    void whenUpdatingDownloadDate_forMessage2_itIsAfterSendDateAndBeforeNow_message5DoesNotHaveIt() throws Exception {
        long message2Id = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE content = ?",
                this::messageIdMapper, encryptionHelper.encryptWithAes("2 Visible only to user0 and user1"));

        downloadDateRepository.addDownloadDateToMessages(users[1].getName(), List.of(message2Id));

        LocalDateTime readDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                message2Id);

        LocalDateTime sentDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE id = ?",
                (rs, rowNum) -> timestampMapper(rs, "sent_at"),
                message2Id);

        Assertions.assertTrue(readDate.isAfter(sentDate));
        Assertions.assertTrue(readDate.isBefore(LocalDateTime.now()));

        long message5Id = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE content = ?",
                this::messageIdMapper, encryptionHelper.encryptWithAes("5 Visible only to user0 and user1"));

        Assertions.assertThrows(EmptyResultDataAccessException.class,
                () -> jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                        (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                        message5Id));
    }

    @Test
    void whenUpdatingDownloadDates_forMessages3And6_theyAreAfterSendDateAndBeforeNow() throws Exception {
        List<Long> ids = jdbcTemplate.query("SELECT * FROM infolab.chatmessages WHERE content = ? OR content = ?",
                this::messageIdMapper,
                encryptionHelper.encryptWithAes("3 Visible only to user0 and user1"),
                encryptionHelper.encryptWithAes("6 Visible only to user1 and user2")
        );

        downloadDateRepository.addDownloadDateToMessages(users[1].getName(), ids);

        LocalDateTime readDate1 = jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                ids.get(0));

        LocalDateTime sentDate1 = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE id = ?",
                (rs, rowNum) -> timestampMapper(rs, "sent_at"),
                ids.get(0));

        Assertions.assertTrue(readDate1.isAfter(sentDate1));
        Assertions.assertTrue(readDate1.isBefore(LocalDateTime.now()));

        LocalDateTime readDate2 = jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                ids.get(0));

        LocalDateTime sentDate2 = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE id = ?",
                (rs, rowNum) -> timestampMapper(rs, "sent_at"),
                ids.get(0));

        Assertions.assertTrue(readDate2.isAfter(sentDate2));
        Assertions.assertTrue(readDate2.isBefore(LocalDateTime.now()));
    }

    @Test
    void whenTryingToSetMultipleReadDates_forSameMessageAndUser_errorIsThrown() throws Exception{
        List<Long> ids = jdbcTemplate.query("SELECT * FROM infolab.chatmessages WHERE content = ?",
                this::messageIdMapper, encryptionHelper.encryptWithAes("4 Hello general from user2"));

        Assertions.assertEquals(1, ids.size());

        ids.add(ids.get(0));

        Assertions.assertEquals(2, ids.size());

        downloadDateRepository.addDownloadDateToMessages(users[1].getName(), ids);

        Assertions.assertDoesNotThrow(() -> { // if the result was of more than 1 object an exception would be thrown
            LocalDateTime readDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                    (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                    ids.get(0));
        });
    }

    private long messageIdMapper(ResultSet rs, int rowNum) throws SQLException {
        return rs.getLong("id");
    }

    private LocalDateTime timestampMapper(ResultSet rs, String columnName) throws SQLException {
        return rs.getObject(columnName, LocalDateTime.class);
    }
}
