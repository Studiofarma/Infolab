package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.RowMappers;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MessagesPaginatedApiTests {
    
    @Autowired
    TestDbHelper testDbHelper;
    @Autowired
    ChatService chatService;
    @Autowired
    TestRestTemplate testRestTemplate;
    @Autowired
    JdbcTemplate jdbcTemplate;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};

    public UserEntity loggedInUser = users[0]; // user0

    public RoomEntity general = RoomEntity.general();
    public ChatMessageDto[] messageDtos = new ChatMessageDto[80];

    public static final LocalDateTime STARTING_TIME = LocalDateTime.of(2023, 6, 1, 1, 1, 1);

    @BeforeAll
    void setUp() {
        testDbHelper.clearDbExceptForRooms();

        testDbHelper.addUsers(users);

        List<Pair<UserEntity, UserEntity>> pairs = List.of(
                Pair.of(users[0], users[1]),
                Pair.of(users[0], users[2]),
                Pair.of(users[1], users[2]),
                Pair.of(users[0], users[3])
        );

        testDbHelper.addPrivateRoomsAndSubscribeUsers(pairs);

        Long generalId = jdbcTemplate.queryForObject("select * from infolab.rooms where roomname = 'general'", (rs, rowNum) -> rs.getLong("id"));

        Long user0Id = jdbcTemplate.queryForObject("select * from infolab.users where username = 'user0'", (rs, rowNum) -> rs.getLong("id"));

        for (int i = 0; i < messageDtos.length; i++) {
            jdbcTemplate.update("INSERT INTO infolab.chatmessages (id, sender_id, recipient_room_id, sent_at, content) values" +
                    "(?, ?, ?, ?, ?)", i, user0Id, generalId, STARTING_TIME.plusSeconds(i), "%d. Hello general from user0".formatted(i));
        }
    }

    @Test
    void whenFetching_withoutPageSize_responseIsOfAllMessages() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(80, responseBody.size());
    }

    @Test
    void whenFetching_withPageSize10_responseIsLast10Messages() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[size]=10",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(10, responseBody.size());

        Assertions.assertEquals("79. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("70. Hello general from user0", responseBody.get(9).get("content"));
    }

    @Test
    void whenFetching_withoutPageSize_afterMessage30_messagesFrom79To31AreReturned() {
        String stringDate = getMessageTimestampString(30);

        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[after]=%s".formatted(stringDate),
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(49, responseBody.size());
        Assertions.assertEquals("79. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("31. Hello general from user0", responseBody.get(48).get("content"));
    }

    @Test
    void whenFetching_withoutPageSize_beforeMessage30_messagesFrom29To0AreReturned() {
        String stringDate = getMessageTimestampString(30);

        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[before]=%s".formatted(stringDate),
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(30, responseBody.size());
        Assertions.assertEquals("29. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("0. Hello general from user0", responseBody.get(29).get("content"));
    }

    @Test
    void whenFetching_pageSize10_afterMessage50_messagesFrom60To51AreReturned() {
        String stringDate = getMessageTimestampString(50);

        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[size]=10&page[after]=%s".formatted(stringDate),
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(10, responseBody.size());
        Assertions.assertEquals("60. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("51. Hello general from user0", responseBody.get(9).get("content"));
    }

    @Test
    void whenFetching_pageSize10_beforeMessage50_messagesFrom49To40AreReturned() {
        String stringDate = getMessageTimestampString(50);

        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/messages/general?page[size]=10&page[before]=%s".formatted(stringDate),
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(10, responseBody.size());
        Assertions.assertEquals("49. Hello general from user0", responseBody.get(0).get("content"));
        Assertions.assertEquals("40. Hello general from user0", responseBody.get(9).get("content"));
    }

    private LocalDateTime dateTimeMapper(ResultSet rs, int rowNum) throws SQLException {
        return RowMappers.resultSetToLocalDateTime(rs);
    }

    private String getMessageTimestampString(int messageNumber) {
        LocalDateTime dateTime = jdbcTemplate.queryForObject(
                "select * from infolab.chatmessages where content = '%d. Hello general from user0'".formatted(messageNumber),
                this::dateTimeMapper
        );
        return dateTime.toString().replace("T", " ");
    }
}
