package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
public class LastReadDateApiTests {
    @Autowired
    TestDbHelper testDbHelper;
    @Autowired
    ChatService chatService;
    @Autowired
    JdbcTemplate jdbcTemplate;
    @Autowired
    MockMvc mvc;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0")),
                    UserEntity.of(Username.of("user1")),
                    UserEntity.of(Username.of("user2")),
                    UserEntity.of(Username.of("user3"))};
    public ChatMessageDto[] messageDtos =
            {ChatMessageDto.of("1 Hello general from user0", users[0].getName().value()),
                    ChatMessageDto.of("2 Visible only to user0 and user1", users[1].getName().value()),
                    ChatMessageDto.of("3 Visible only to user1 and user2", users[1].getName().value()),
                    ChatMessageDto.of("4 Visible only to user0 and user2", users[2].getName().value()),
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
        chatService.saveMessageInDb(messageDtos[3], users[0].getName(), RoomName.of("user0-user2"), users[0].getName());
        chatService.saveMessageInDb(messageDtos[4], users[1].getName(), RoomName.of("user0-user1"), users[1].getName());
        chatService.saveMessageInDb(messageDtos[5], users[1].getName(), RoomName.of("user1-user2"), users[1].getName());
    }

    @Test
    void whenUpdatingDownloadDate_forMessage1_itIsAfterSendDateAndBeforeNow() throws Exception {
        long message1Id = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE content = '1 Hello general from user0'", this::messageIdMapper);

        postToApiForUser1("/api/messages/lastread", List.of(message1Id));

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
        long message2Id = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE content = '2 Visible only to user0 and user1'", this::messageIdMapper);

        System.out.println(message2Id);

        postToApiForUser1("/api/messages/lastread", List.of(message2Id));

        LocalDateTime readDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                message2Id);

        LocalDateTime sentDate = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE id = ?",
                (rs, rowNum) -> timestampMapper(rs, "sent_at"),
                message2Id);

        Assertions.assertTrue(readDate.isAfter(sentDate));
        Assertions.assertTrue(readDate.isBefore(LocalDateTime.now()));

        long message5Id = jdbcTemplate.queryForObject("SELECT * FROM infolab.chatmessages WHERE content = '5 Visible only to user0 and user1'", this::messageIdMapper);

        Assertions.assertThrows(EmptyResultDataAccessException.class,
                () -> jdbcTemplate.queryForObject("SELECT * FROM infolab.download_dates WHERE message_id = ?",
                        (rs, rowNum) -> timestampMapper(rs, "download_timestamp"),
                        message5Id));
    }

    private void postToApiForUser1(String url, List list) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonArray = objectMapper.writeValueAsString(list);

        mvc.perform(
                post(url)
                        .with(csrf().asHeader())
                        .with(user("user1").password("password1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonArray)
        ).andExpect(status().isOk());
    }

    private long messageIdMapper(ResultSet rs, int rowNum) throws SQLException {
        return rs.getLong("id");
    }

    private LocalDateTime timestampMapper(ResultSet rs, String columnName) throws SQLException {
        return rs.getObject(columnName, LocalDateTime.class);
    }
}
