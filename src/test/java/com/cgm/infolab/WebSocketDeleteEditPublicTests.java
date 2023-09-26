package com.cgm.infolab;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.WebSocketMessageDto;
import com.cgm.infolab.templates.WebSocketTestTemplate;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

import static com.cgm.infolab.db.model.enumeration.MessageStatusEnum.DELETED;
import static com.cgm.infolab.db.model.enumeration.MessageStatusEnum.EDITED;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.DELETE;
import static com.cgm.infolab.model.WebSocketMessageTypeEnum.EDIT;
import static org.awaitility.Awaitility.await;

public class WebSocketDeleteEditPublicTests extends WebSocketTestTemplate {
    UserEntity userBanana = UserEntity.of(Username.of("banana"));
    RoomEntity general = RoomEntity.general();

    @BeforeEach
    protected void setUp(){
        testDbHelper.clearDb();

        testDbHelper.addRooms(RoomEntity.general());

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
                userBanana.getName().value(),
                general.getName().value(),
                LocalDateTime.of(2023, 1, 1, 1, 1, 1),
                "3 Message in general");
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

        long messageId = 2;
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

        long messageId = 1;
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

        long messageId = 1;
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

        long messageId = 2;
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

        long messageId = 1;
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
