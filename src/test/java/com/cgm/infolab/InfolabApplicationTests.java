package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.CursorEnum;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.helper.TestDbHelper;
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
import java.util.List;
import java.util.concurrent.*;

import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InfolabApplicationTests {
    @LocalServerPort
    public Integer port;

    @Autowired
    public TestRestTemplate rest;

    @Autowired
    public ChatMessageRepository chatMessageRepository;

    @Autowired
    public TestDbHelper testDbHelper;
    @Autowired
    private ObjectMapper objectMapper;

    WebSocketStompClient websocket;

    UserEntity userBanana = UserEntity.of(Username.of("banana"));
    UserEntity user1 = UserEntity.of(Username.of("user1"));

    @BeforeAll
    public void setupAll(){
        testDbHelper.clearDbExceptForGeneral();

        websocket =
            new WebSocketStompClient(
                new SockJsClient(
                        List.of(new WebSocketTransport(new StandardWebSocketClient()))));

        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.setObjectMapper(objectMapper);

        websocket.setMessageConverter(messageConverter);

        testDbHelper.addUsers(user1, userBanana);

        testDbHelper.addPrivateRoomsAndSubscribeUsers(List.of(Pair.of(user1, userBanana)));
    }

    @Test
    void whenSomeoneRegister_everyoneReceivesAJoinNotification() throws Exception {
        StompSession client = getStompSession();

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        WebSocketMessageDto joinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(null, Username.of("banana").value()));
        client.send("/app/chat.register", joinMessage);

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> Assertions.assertEquals(joinMessage, receivedMessages.poll()));
    }

    @Test
    void whenInvalidDtoIsSent_toRegisterToWebSocket_nullIsReturned() throws Exception {
        StompSession client = getStompSession();

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        WebSocketMessageDto chatMessage = WebSocketMessageDto.ofChat(ChatMessageDto.of(null, Username.of("banana").value()));
        client.send("/app/chat.register", chatMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> Assertions.assertNull(receivedMessages.poll()));

        WebSocketMessageDto deleteMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(null, Username.of("banana").value()));
        client.send("/app/chat.register", deleteMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> Assertions.assertNull(receivedMessages.poll()));

        WebSocketMessageDto editMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(null, Username.of("banana").value()));
        client.send("/app/chat.register", editMessage);

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> Assertions.assertNull(receivedMessages.poll()));
    }

    @Test
    void whenMessageIsSentInGeneral_thenItShouldBeSavedInTheDbAndTheMessageIsReceived() throws Exception {

        StompSession client = getStompSession();

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        WebSocketMessageDto sentMessage = WebSocketMessageDto.ofChat(ChatMessageDto.of("pippo", userBanana.getName().value()));
        client.send("/app/chat.send", sentMessage);

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                WebSocketMessageDto received = receivedMessages.poll();
                Assertions.assertEquals(sentMessage.getChat().getContent(), received.getChat().getContent());
                Assertions.assertEquals(sentMessage.getChat().getSender(), received.getChat().getSender());
            });
        List<ChatMessageEntity> messages = chatMessageRepository.getByRoomNameNumberOfMessages(RoomName.of("general"), 1, CursorEnum.NONE, null, Username.of("user1"));
        Assertions.assertEquals(1,messages.size());
        Assertions.assertEquals(sentMessage.getChat().getContent(),messages.get(0).getContent());
    }

    @Test
    void whenInvalidDtoIsSent_inGeneral_nullIsReturned_messageIsNotSaved() throws Exception {

        StompSession client = getStompSession();

        BlockingQueue<WebSocketMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((WebSocketMessageDto) payload);
            }
        });

        String messageText = "pippo not valid";
        WebSocketMessageDto joinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(messageText, userBanana.getName().value()));
        client.send("/app/chat.send", joinMessage);

        assertMessageIsNotReceivedAndNotSavedToDbInPublicRoom(receivedMessages, messageText);

        WebSocketMessageDto deleteMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageText, userBanana.getName().value()));
        client.send("/app/chat.send", deleteMessage);

        assertMessageIsNotReceivedAndNotSavedToDbInPublicRoom(receivedMessages, messageText);

        WebSocketMessageDto editMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageText, userBanana.getName().value()));
        client.send("/app/chat.send", editMessage);

        assertMessageIsNotReceivedAndNotSavedToDbInPublicRoom(receivedMessages, messageText);
    }

    @Test
    void whenMessageIsSentInPrivateChat_thenMessageShouldBeSavedInDbAndReceivedByTheSenderAndByTheDestinationUser() throws Exception {
        StompSession client = getStompSession();

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

        WebSocketMessageDto sentMessage = WebSocketMessageDto.ofChat(ChatMessageDto.of("pippo", userBanana.getName().value()));
        client.send("/app/chat.send." + userBanana.getName().value(), sentMessage);

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                WebSocketMessageDto received = receivedMessagesSender.poll();
                Assertions.assertEquals(sentMessage.getChat().getContent(), received.getChat().getContent());
                Assertions.assertEquals(sentMessage.getChat().getSender(), received.getChat().getSender());
            });

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                WebSocketMessageDto received = receivedMessagesDestination.poll();
                Assertions.assertEquals(sentMessage.getChat().getContent(), received.getChat().getContent());
                Assertions.assertEquals(sentMessage.getChat().getSender(), received.getChat().getSender());
            });

        List<ChatMessageEntity> messages = chatMessageRepository.getByRoomNameNumberOfMessages(RoomName.of("banana-user1"), 1, CursorEnum.NONE, null, Username.of("user1"));
        Assertions.assertEquals(1,messages.size());
        Assertions.assertEquals(sentMessage.getChat().getContent(),messages.get(0).getContent());
    }

    @Test
    void whenInvalidDtoIsSent_inPrivateRoom_nullIsReturned_messageIsNotSaved() throws Exception {

        StompSession client = getStompSession();

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

        String messageText = "pippo not valid";
        WebSocketMessageDto joinMessage = WebSocketMessageDto.ofJoin(ChatMessageDto.of(messageText, userBanana.getName().value()));
        client.send("/app/chat.send." + userBanana.getName().value(), joinMessage);

        assertMessageIsNotReceivedAndNotSavedToDbInPrivateRoom(receivedMessagesSender, receivedMessagesDestination, messageText);

        WebSocketMessageDto deleteMessage = WebSocketMessageDto.ofDelete(ChatMessageDto.of(messageText, userBanana.getName().value()));
        client.send("/app/chat.send." + userBanana.getName().value(), deleteMessage);

        assertMessageIsNotReceivedAndNotSavedToDbInPrivateRoom(receivedMessagesSender, receivedMessagesDestination, messageText);

        WebSocketMessageDto editMessage = WebSocketMessageDto.ofEdit(ChatMessageDto.of(messageText, userBanana.getName().value()));
        client.send("/app/chat.send." + userBanana.getName().value(), editMessage);

        assertMessageIsNotReceivedAndNotSavedToDbInPrivateRoom(receivedMessagesSender, receivedMessagesDestination, messageText);
    }

    private void assertMessageIsNotReceivedAndNotSavedToDbInPrivateRoom(BlockingQueue<WebSocketMessageDto> receivedMessagesSender, BlockingQueue<WebSocketMessageDto> receivedMessagesDestination, String messageText) {
        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesSender.poll();
                    Assertions.assertNull(received);
                });

        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessagesDestination.poll();
                    Assertions.assertNull(received);
                });

        List<ChatMessageEntity> messageEntities = testDbHelper
                .getAllMessages()
                .stream()
                .filter(message -> message.getContent().equals(messageText))
                .toList();

        Assertions.assertEquals(0, messageEntities.size());
    }

    private void assertMessageIsNotReceivedAndNotSavedToDbInPublicRoom(BlockingQueue<WebSocketMessageDto> receivedMessages, String messageText) {
        await()
                .atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> {
                    WebSocketMessageDto received = receivedMessages.poll();
                    Assertions.assertNull(received);

                    List<ChatMessageEntity> messageEntities = testDbHelper
                            .getAllMessages()
                            .stream()
                            .filter(message -> message.getContent().equals(messageText))
                            .toList();

                    Assertions.assertEquals(0, messageEntities.size());
                });
    }

    private StompSession getStompSession() throws InterruptedException, ExecutionException, TimeoutException {
        String basicAuth = basicAuth(user1.getName().value(), "password1");

        ResponseEntity<MyCsrfToken> csrfResponse = rest.exchange(
                RequestEntity
                    .get("/csrf")
                    .header(HttpHeaders.AUTHORIZATION, basicAuth)
                    .build(),
                MyCsrfToken.class);

        StompHeaders stompHeaders = new StompHeaders();
        MyCsrfToken csrf = csrfResponse.getBody();
        stompHeaders.add(csrf.headerName(), csrf.token());

        WebSocketHttpHeaders headers = setCookies(csrfResponse);
        StompSession session = websocket
            .connectAsync(String.format("http://localhost:%d/chat?access_token=%s", port, encodedAuth("user1", "password1")), headers, stompHeaders, new StompSessionHandlerAdapter() {})
            .get(1, TimeUnit.SECONDS);
        return session;
    }

    private static String basicAuth(String user, String password) {
        return String.format("Basic %s", encodedAuth(user, password));
    }

    private static String encodedAuth(String user, String password) {
        return Base64.encodeBase64String(String.format("%s:%s", user, password).getBytes());
    }

    private static WebSocketHttpHeaders setCookies(ResponseEntity<MyCsrfToken> csrfResponse) {
        String cookies = csrfResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assert cookies != null;
        String sessionId = cookies.split(";")[0];
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.add(HttpHeaders.COOKIE, sessionId);
        return headers;
    }
}
