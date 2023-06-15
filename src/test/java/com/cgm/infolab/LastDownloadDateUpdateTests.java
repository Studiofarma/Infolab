package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import com.cgm.infolab.service.RoomService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.sql.Timestamp;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class LastDownloadDateUpdateTests {
    @Autowired
    public ChatService chatService;
    @Autowired
    public RoomService roomService;
    @Autowired
    public JdbcTemplate jdbcTemplate;
    @Autowired
    public DownloadDateRepository downloadDateRepository;
    @Autowired
    public UserRepository userRepository;

    public RoomEntity general = RoomEntity.general();

    public UserEntity[] users = {
            UserEntity.of(Username.of("user0")),
            UserEntity.of(Username.of("user1")),
            UserEntity.of(Username.of("user2"))
    };
    public UserEntity loggedInUser = users[0];

    public String generalMessage = "Hello general";
    public String generalMessage2 = "Hello general 2";

    public ChatMessageDto[] messageDtos = {
            new ChatMessageDto(generalMessage, users[0].getName().value()),
            new ChatMessageDto(generalMessage2, users[1].getName().value()),
            new ChatMessageDto("Visible only to user0 and user1", users[1].getName().value()),
            new ChatMessageDto("Visible only to user1 and user2", users[2].getName().value()),
    };

    public String query = "select * from infolab.download_dates d left join infolab.chatmessages m on m.id = d.message_id where d.user_id = ? and m.content = ?";

    @BeforeAll
    void setUp() {
        jdbcTemplate.update("DELETE FROM infolab.download_dates");
        jdbcTemplate.update("DELETE FROM infolab.chatmessages");
        jdbcTemplate.update("DELETE FROM infolab.rooms_subscriptions");
        jdbcTemplate.update("DELETE FROM infolab.users");

        for (UserEntity user : users) {
            user.setId(userRepository.add(user));
        }

        roomService.createPrivateRoomAndSubscribeUsers(users[0].getName(), users[1].getName());
        roomService.createPrivateRoomAndSubscribeUsers(users[1].getName(), users[2].getName());
    }

    @AfterEach
    void clearDb() {
        jdbcTemplate.update("DELETE FROM infolab.download_dates");
        jdbcTemplate.update("DELETE FROM infolab.chatmessages");
    }

    @Test
    void whenMessageIsDownloaded_lastDownloadDateExistsForUserThatDownloaded_doesNotForOthers() {

        chatService.saveMessageInDbPublicRooms(messageDtos[0], loggedInUser.getName(), general.getName());
        chatService.saveMessageInDbPrivateRooms(messageDtos[3], users[2].getName(), RoomName.of("user1-user2"));

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), general.getName());

        List<String> fromDb = jdbcTemplate.query(
                query,
                (rs, rowNum) -> rs.getString("content"),
                users[0].getId(),
                generalMessage
        );

        Assertions.assertEquals(1, fromDb.size());

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), RoomName.of("user1-user2"));

        List<String> fromDb2 = jdbcTemplate.query(
                query,
                (rs, rowNum) -> rs.getString("content"),
                users[0].getId(),
                "Visible only to user1 and user2"
        );

        Assertions.assertEquals(0, fromDb2.size());
    }

    @Test
    void whenOtherMessagesAreDownloaded_lastDownloadDateExistsForNewMessages_notUpdatedForPreviousMessages() {

        chatService.saveMessageInDbPublicRooms(messageDtos[0], loggedInUser.getName(), general.getName());

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), general.getName());

        Timestamp timestampFirstMessage = jdbcTemplate.query(
                query,
                (rs, rowNum) -> rs.getTimestamp("download_timestamp"),
                users[0].getId(),
                generalMessage
        )
        .get(0);

        chatService.saveMessageInDbPublicRooms(messageDtos[1], loggedInUser.getName(), general.getName());

        downloadDateRepository.addWhereNotDownloadedYetForUser(loggedInUser.getName(), general.getName());

        List<String> fromDb = jdbcTemplate.query(
                query,
                (rs, rowNum) -> rs.getString("content"),
                users[0].getId(),
                generalMessage2
        );

        Assertions.assertEquals(1, fromDb.size());

        Timestamp timestampSecondMessage = jdbcTemplate.query(
                        query,
                        (rs, rowNum) -> rs.getTimestamp("download_timestamp"),
                        users[0].getId(),
                        generalMessage2
                )
                .get(0);

        Assertions.assertNotEquals(timestampFirstMessage, timestampSecondMessage);
    }
}