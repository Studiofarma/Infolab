package com.cgm.infolab;

import com.cgm.infolab.configuration.TestSecurityConfiguration;
import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.RoomTypeEnum;
import com.cgm.infolab.db.model.enumeration.VisibilityEnum;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.helper.TestStompHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

import static com.cgm.infolab.db.model.enumeration.MessageStatusEnum.DELETED;
import static com.cgm.infolab.db.model.enumeration.MessageStatusEnum.EDITED;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.DELETE;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.EDIT;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class WebSocketDeleteEditPrivateTests {
    @LocalServerPort
    public Integer port;
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public TestStompHelper testStompHelper;

    WebSocketStompClient websocket;

    UserEntity userBanana = UserEntity.of(Username.of("banana"));
    UserEntity user1 = UserEntity.of(Username.of("user1"));
    RoomEntity bananaUser1 = RoomEntity.of(RoomName.of("banana-user1"), VisibilityEnum.PRIVATE, RoomTypeEnum.USER2USER);

    // This is here because the @Import annotation does not work
    @TestConfiguration
    public static class SecurityConfiguration extends TestSecurityConfiguration {}

    @BeforeAll
    public void setupAll(){
        testDbHelper.clearDbExceptForGeneral();

        websocket = testStompHelper.initWebsocket();

        testDbHelper.addUsers(user1, userBanana);

        testDbHelper.addPrivateRoomsAndSubscribeUsers(List.of(Pair.of(user1, userBanana)));

        long bananaUser1Id = testDbHelper.getRoomId("banana-user1");
        bananaUser1.setId(bananaUser1Id);

        testDbHelper.insertCustomMessage(
                1,
                user1.getName().value(),
                bananaUser1.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "1 Message in banana-user1");

        testDbHelper.insertCustomMessage(
                2,
                user1.getName().value(),
                bananaUser1.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "2 Message in banana-user1");

        testDbHelper.insertCustomMessage(
                3,
                userBanana.getName().value(),
                bananaUser1.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "3 Message in banana-user1");

        testDbHelper.insertCustomMessage(
                4,
                userBanana.getName().value(),
                bananaUser1.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "4 Message in banana-user1");
        testDbHelper.insertCustomMessage(
                5,
                user1.getName().value(),
                bananaUser1.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "5 Message in banana-user1");
        testDbHelper.insertCustomMessage(
                6,
                user1.getName().value(),
                bananaUser1.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "6 Message in banana-user1");
    }

    @Test
    void whenDeletingMessageThroughWebsocket_deletionMessageIsReceived_andMessageIsActuallyDeleted() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<WebSocketMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);

        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((WebSocketMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((WebSocketMessageDto) payload);
            }
        });

        long messageId = 1;
        WebSocketMessageDto webSocketDeletedMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete." + userBanana.getName().value(), webSocketDeletedMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesSender.poll();

                    Assertions.assertNotNull(received.getDelete());
                    Assertions.assertEquals(webSocketDeletedMessage.getDelete().getId(), received.getDelete().getId());
                    Assertions.assertEquals(DELETE, received.getType());

                    Assertions.assertNull(received.getChat());
                    Assertions.assertNull(received.getEdit());

                    ChatMessageEntity messageEntity = testDbHelper
                            .getAllMessages()
                            .stream()
                            .filter(message -> message.getId() == messageId)
                            .toList()
                            .get(0);

                    Assertions.assertEquals(DELETED, messageEntity.getStatus());
                    Assertions.assertEquals("", messageEntity.getContent());
                });

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesDestination.poll();

                    Assertions.assertNotNull(received.getDelete());
                    Assertions.assertEquals(webSocketDeletedMessage.getDelete().getId(), received.getDelete().getId());
                    Assertions.assertEquals(DELETE, received.getType());

                    Assertions.assertNull(received.getChat());
                    Assertions.assertNull(received.getEdit());
                });
    }

    @Test
    void whenDeletionFails_websocketReturnsNull() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<WebSocketMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);

        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((WebSocketMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((WebSocketMessageDto) payload);
            }
        });

        long messageId = 3;
        ChatMessageEntity messageEntityBefore = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getId() == messageId)
                .toList()
                .get(0);

        WebSocketMessageDto webSocketDeletedMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete." + userBanana.getName().value(), webSocketDeletedMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);
    }

    @Test
    void whenSendingInvalidDto_toDeleteMessage_nullIsReturned_messageIsNotDeleted() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<WebSocketMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);

        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((WebSocketMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((WebSocketMessageDto) payload);
            }
        });

        long messageId = 5;
        ChatMessageEntity messageEntityBefore = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getId() == messageId)
                .toList()
                .get(0);

        WebSocketMessageDto webSocketChatMessage = WebSocketMessageDto.ofChat(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete." + userBanana.getName().value(), webSocketChatMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);

        WebSocketMessageDto webSocketEditMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete." + userBanana.getName().value(), webSocketEditMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);

        WebSocketMessageDto webSocketJoinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete." + userBanana.getName().value(), webSocketJoinMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);
    }

    @Test
    void whenEditingMessageThroughWebsocket_editMessageIsReceived_andMessageIsActuallyEdited() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<WebSocketMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);

        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((WebSocketMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((WebSocketMessageDto) payload);
            }
        });

        long messageId = 2;
        WebSocketMessageDto webSocketEditedMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageId, "New content."));
        client.send("/app/chat.edit." + userBanana.getName().value(), webSocketEditedMessage);

        assertMessageHasNotBeenEditedAndReturnedIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, webSocketEditedMessage);
    }

    @Test
    void whenEditFails_websocketReturnsNull() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<WebSocketMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);

        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((WebSocketMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((WebSocketMessageDto) payload);
            }
        });

        long messageId = 4;
        ChatMessageEntity messageEntityBefore = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getId() == messageId)
                .toList()
                .get(0);

        WebSocketMessageDto webSocketEditedMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageId, "Trying to edit message"));
        client.send("/app/chat.edit." + userBanana.getName().value(), webSocketEditedMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);
    }

    @Test
    void whenSendingInvalidDto_toEditMessage_nullIsReturned_messageIsNotEdited() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<WebSocketMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);

        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((WebSocketMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((WebSocketMessageDto) payload);
            }
        });

        long messageId = 4;
        ChatMessageEntity messageEntityBefore = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getId() == messageId)
                .toList()
                .get(0);

        WebSocketMessageDto webSocketChatMessage = WebSocketMessageDto.ofChat(ChatMessageDto.of(messageId, "Trying to edit message"));
        client.send("/app/chat.edit." + userBanana.getName().value(), webSocketChatMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);

        WebSocketMessageDto webSocketDeleteMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageId, "Trying to edit message"));
        client.send("/app/chat.edit." + userBanana.getName().value(), webSocketDeleteMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);

        WebSocketMessageDto webSocketJoinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(messageId, "Trying to edit message"));
        client.send("/app/chat.edit." + userBanana.getName().value(), webSocketJoinMessage);

        assertMessageHasNotBeenDeletedAndReturnIsNull(receivedMessagesSender, receivedMessagesDestination, messageId, messageEntityBefore);
    }

    private void assertMessageHasNotBeenDeletedAndReturnIsNull(BlockingQueue<WebSocketMessageDto> receivedMessagesSender, BlockingQueue<WebSocketMessageDto> receivedMessagesDestination, long messageId, ChatMessageEntity messageEntityBefore) {
        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    ChatMessageEntity messageEntityAfter = testDbHelper
                            .getAllMessages()
                            .stream()
                            .filter(message -> message.getId() == messageId)
                            .toList()
                            .get(0);

                    Assertions.assertEquals(messageEntityBefore, messageEntityAfter);

                    WebSocketMessageDto received = receivedMessagesSender.poll();

                    Assertions.assertNull(received);
                });

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesDestination.poll();

                    Assertions.assertNull(received);
                });
    }

    private void assertMessageHasNotBeenEditedAndReturnedIsNull(BlockingQueue<WebSocketMessageDto> receivedMessagesSender, BlockingQueue<WebSocketMessageDto> receivedMessagesDestination, long messageId, WebSocketMessageDto webSocketEditedMessage) {
        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesSender.poll();

                    Assertions.assertNotNull(received.getEdit());
                    Assertions.assertEquals(webSocketEditedMessage.getEdit().getId(), received.getEdit().getId());
                    Assertions.assertEquals(EDIT, received.getType());

                    Assertions.assertNull(received.getChat());
                    Assertions.assertNull(received.getDelete());

                    ChatMessageEntity messageEntity = testDbHelper
                            .getAllMessages()
                            .stream()
                            .filter(message -> message.getId() == messageId)
                            .toList()
                            .get(0);

                    Assertions.assertEquals(EDITED, messageEntity.getStatus());
                    Assertions.assertEquals("New content.", messageEntity.getContent());
                });

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesDestination.poll();

                    Assertions.assertNotNull(received.getEdit());
                    Assertions.assertEquals(webSocketEditedMessage.getEdit().getId(), received.getEdit().getId());
                    Assertions.assertEquals(EDIT, received.getType());

                    Assertions.assertNull(received.getChat());
                    Assertions.assertNull(received.getDelete());
                });
    }
}
