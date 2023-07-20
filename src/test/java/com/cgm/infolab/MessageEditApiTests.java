package com.cgm.infolab;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static com.cgm.infolab.db.model.enumeration.StatusEnum.EDITED;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
public class MessageEditApiTests {
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public ChatService chatService;
    @Autowired
    public JdbcTemplate jdbcTemplate;
    @Autowired
    public MockMvc mvc;

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
    void whenOneMessageIsEdited_itsContentIsTheSetOne_itsStatusIsEDITED_otherMessagesDidNotChange() throws Exception {
        List<ChatMessageEntity> messagesBefore = testDbHelper.getAllMessages();

        long message2Id = jdbcTemplate.queryForObject("select * from infolab.chatmessages where content = '2 Visible only to user0 and user1'",
                (rs, rowNum) -> rs.getLong("id"));

        apiPutForUser1("/api/messages/user0-user1/%d".formatted(message2Id), "Edited yayy!");

        List<ChatMessageEntity> messagesAfter = testDbHelper.getAllMessages();

        Assertions.assertEquals(messagesBefore.size(), messagesAfter.size());

        ChatMessageEntity editedMessage = messagesAfter.stream().filter(message -> message.getId() == message2Id).toList().get(0);

        Assertions.assertEquals(EDITED, editedMessage.getStatus());
        Assertions.assertEquals("Edited yayy!", editedMessage.getContent());

        messagesBefore = messagesBefore.stream().filter(message -> message.getId() != message2Id).toList();
        messagesAfter = messagesAfter.stream().filter(message -> message.getId() != message2Id).toList();

        Assertions.assertEquals(messagesBefore, messagesAfter);
    }

    @Test
    void whenTryingToEdit_messageSentByAnotherUser_messageDoesNotGetEdited() throws Exception {
        List<ChatMessageEntity> messagesBefore = testDbHelper.getAllMessages();

        long message5Id = jdbcTemplate.queryForObject("select * from infolab.chatmessages where content = '5 Visible only to user0 and user1'",
                (rs, rowNum) -> rs.getLong("id"));

        apiPutForUser1("/api/messages/user0-user1/%d".formatted(message5Id), "Trying to edit ψ(｀∇´)ψ");

        List<ChatMessageEntity> messagesAfter = testDbHelper.getAllMessages();

        Assertions.assertEquals(messagesBefore.size(), messagesAfter.size());

        ChatMessageEntity messageTriedToBeEdited = messagesAfter.stream().filter(message -> message.getId() == message5Id).toList().get(0);

        Assertions.assertNull(messageTriedToBeEdited.getStatus());

        Assertions.assertEquals(messagesBefore, messagesAfter);
    }

    private void apiPutForUser1(String url, String body) throws Exception {

        mvc.perform(
                put(url)
                        .with(csrf().asHeader())
                        .with(user("user1").password("password1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        ).andExpect(status().isOk());
    }
}
