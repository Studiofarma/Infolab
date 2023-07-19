package com.cgm.infolab;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.enums.Username;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RowMappers;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static com.cgm.infolab.db.model.enums.StatusEnum.DELETED;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MessageDeletionTests {
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public ChatService chatService;
    @Autowired
    public ChatMessageRepository chatMessageRepository;
    @Autowired
    public JdbcTemplate jdbcTemplate;

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
    void whenOneMessageIsDeleted_itsContentIsEmpty_itsStatusIsDELETED_otherMessagesDidNotChange() {
        List<ChatMessageEntity> messagesBefore = testDbHelper.getAllMessages();

        long message5Id = jdbcTemplate.queryForObject("select * from infolab.chatmessages where content = '5 Visible only to user0 and user1'",
                (rs, rowNum) -> rs.getLong("id"));

        chatMessageRepository.deleteMessage(users[0].getName(), message5Id);

        List<ChatMessageEntity> messagesAfter = testDbHelper.getAllMessages();

        Assertions.assertEquals(messagesBefore.size(), messagesAfter.size());

        ChatMessageEntity deletedMessage = messagesAfter.stream().filter(message -> message.getId() == message5Id).toList().get(0);

        Assertions.assertEquals(DELETED, deletedMessage.getStatus());

        messagesBefore = messagesBefore.stream().filter(message -> message.getId() != message5Id).toList();
        messagesAfter = messagesAfter.stream().filter(message -> message.getId() != message5Id).toList();

        Assertions.assertEquals(messagesBefore, messagesAfter);
    }

    @Test
    void whenTryingToDelete_messageSentByAnotherUser_messageDoesNotGetDeleted() {
        List<ChatMessageEntity> messagesBefore = testDbHelper.getAllMessages();

        long message1Id = jdbcTemplate.queryForObject("select * from infolab.chatmessages where content = '1 Hello general from user0'",
                (rs, rowNum) -> rs.getLong("id"));

        chatMessageRepository.deleteMessage(users[0].getName(), message1Id);

        List<ChatMessageEntity> messagesAfter = testDbHelper.getAllMessages();

        Assertions.assertEquals(messagesBefore.size(), messagesAfter.size());

        ChatMessageEntity messageTriedToBeDeleted = messagesAfter.stream().filter(message -> message.getId() == message1Id).toList().get(0);

        Assertions.assertNull(messageTriedToBeDeleted.getStatus());

        Assertions.assertEquals(messagesBefore, messagesAfter);
    }
}