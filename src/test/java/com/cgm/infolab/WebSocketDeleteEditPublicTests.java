package com.cgm.infolab;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.helper.TestStompHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.tomcat.util.codec.binary.Base64;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

import static com.cgm.infolab.db.model.enumeration.StatusEnum.DELETED;
import static com.cgm.infolab.db.model.enumeration.StatusEnum.EDITED;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.DELETE;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.EDIT;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class WebSocketDeleteEditPublicTests {
    @LocalServerPort
    public Integer port;
    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    public TestStompHelper testStompHelper;

    WebSocketStompClient websocket;

    UserEntity userBanana = UserEntity.of(Username.of("banana"));
    UserEntity user1 = UserEntity.of(Username.of("user1"));

    RoomEntity general = RoomEntity.general();

    @BeforeAll
    public void setupAll(){
        testDbHelper.clearDbExceptForGeneral();

        websocket = testStompHelper.initWebsocket();

        testDbHelper.addUsers(user1, userBanana);

        testDbHelper.addPrivateRoomsAndSubscribeUsers(List.of(Pair.of(user1, userBanana)));

        long generalId = testDbHelper.getRoomId("general");
        general.setId(generalId);

        testDbHelper.insertCustomMessage(
                1,
                user1.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "1 Message in general");

        testDbHelper.insertCustomMessage(
                2,
                user1.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "2 Message in general");

        testDbHelper.insertCustomMessage(
                3,
                userBanana.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "3 Message in general");

        testDbHelper.insertCustomMessage(
                4,
                userBanana.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "4 Message in general");
        testDbHelper.insertCustomMessage(
                5,
                user1.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "5 Message in general");
        testDbHelper.insertCustomMessage(
                6,
                user1.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "6 Message in general");

    }

    @Test
    void whenDeletingMessageThroughWebsocket_deletionMessageIsReceived_andMessageIsActuallyDeleted() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
                client.disconnect();
            }
        });

        long messageId = 1;
        WebSocketMessageDto webSocketDeletedMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete", webSocketDeletedMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessages.poll();

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
    }

    @Test
    void whenDeletionFails_websocketReturnsNull() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
                client.disconnect();
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
        client.send("/app/chat.delete", webSocketDeletedMessage);

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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });
    }

    @Test
    void whenSendingInvalidDto_toDeleteMessage_nullIsReturned_messageIsNotDeleted() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
                client.disconnect();
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
        client.send("/app/chat.delete", webSocketChatMessage);

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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });

        WebSocketMessageDto webSocketEditMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete", webSocketEditMessage);
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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });

        WebSocketMessageDto webSocketJoinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(messageId));
        client.send("/app/chat.delete", webSocketJoinMessage);
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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });
    }

    @Test
    void whenEditingMessageThroughWebsocket_editMessageIsReceived_andMessageIsActuallyEdited() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
                client.disconnect();
            }
        });

        long messageId = 2;
        WebSocketMessageDto webSocketEditedMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageId, "New content : )"));
        client.send("/app/chat.edit", webSocketEditedMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessages.poll();

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
                    Assertions.assertEquals("New content : )", messageEntity.getContent());
                });
    }

    @Test
    void whenEditFails_websocketReturnsNull() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
                client.disconnect();
            }
        });

        long messageId = 4;
        ChatMessageEntity messageEntityBefore = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getId() == messageId)
                .toList()
                .get(0);

        WebSocketMessageDto webSocketEditedMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageId, "Edit that fails"));
        client.send("/app/chat.edit", webSocketEditedMessage);

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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });
    }

    @Test
    void whenSendingInvalidDto_toEditMessage_nullIsReturned_messageIsNotEdited() throws ExecutionException, InterruptedException, TimeoutException {
        StompSession client = testStompHelper.getStompSessionForUser1(websocket, port);

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);

        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
                client.disconnect();
            }
        });

        long messageId = 6;
        ChatMessageEntity messageEntityBefore = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getId() == messageId)
                .toList()
                .get(0);

        WebSocketMessageDto webSocketChatMessage = WebSocketMessageDto.ofChat(ChatMessageDto.of(messageId, "Edit that fails"));
        client.send("/app/chat.edit", webSocketChatMessage);

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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });

        WebSocketMessageDto webSocketDeleteMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageId, "Edit that fails"));
        client.send("/app/chat.edit", webSocketDeleteMessage);

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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });

        WebSocketMessageDto webSocketEditMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(messageId, "Edit that fails"));
        client.send("/app/chat.edit", webSocketEditMessage);

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

                    WebSocketMessageDto received = receivedMessages.poll();

                    Assertions.assertNull(received);
                });
    }
}
