package com.cgm.infolab;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomName;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
    public UserRepository userRepository;

    WebSocketStompClient websocket;

    UserEntity userBanana = UserEntity.of(Username.of("banana"));
    UserEntity user1 = UserEntity.of(Username.of("user1"));

    @Autowired
    RoomService roomService;

    @BeforeAll
    public void setupAll(){
        websocket =
            new WebSocketStompClient(
                new SockJsClient(
                        List.of(new WebSocketTransport(new StandardWebSocketClient()))));

        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        ObjectMapper objectMapper = messageConverter.getObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        messageConverter.setObjectMapper(objectMapper);

        websocket.setMessageConverter(messageConverter);
        userRepository.add(userBanana);
        roomService.createPrivateRoomAndSubscribeUsers(user1.getName(), userBanana.getName());
    }

    @Test
    void whenSomeoneRegister_everyoneReceivesAJoinNotification() throws Exception {
        StompSession client = getStompSession();

        BlockingQueue<ChatMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((ChatMessageDto) payload);
            }
        });

        ChatMessageDto sentMessage = new ChatMessageDto(null, Username.of("banana").value());
        client.send("/app/chat.register", sentMessage);

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> Assertions.assertEquals(sentMessage, receivedMessages.poll()));
    }
    @Test
    void whenMessageIsSentInGeneral_thenItShouldBeSavedInTheDbAndTheMessageIsReceived() throws Exception {

        StompSession client = getStompSession();

        BlockingQueue<ChatMessageDto> receivedMessages = new ArrayBlockingQueue<>(2);
        client.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((ChatMessageDto) payload);
            }
        });

        ChatMessageDto sentMessage = new ChatMessageDto("pippo", userBanana.getName().value());
        client.send("/app/chat.send", sentMessage);

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                ChatMessageDto received = receivedMessages.poll();
                Assertions.assertEquals(sentMessage.getContent(), received.getContent());
                Assertions.assertEquals(sentMessage.getSender(), received.getSender());
            });
        List<ChatMessageEntity> messages = chatMessageRepository.getByRoomNameNumberOfMessages(RoomName.of("general"), 1, Username.of("user1"));
        Assertions.assertEquals(1,messages.size());
        Assertions.assertEquals(sentMessage.getContent(),messages.get(0).getContent());
    }

    @Test
    void whenMessageIsSentInPrivateChat_thenMessageShouldBeSavedInDbAndReceivedByTheSenderAndByTheDestinationUser() throws Exception {
        StompSession client = getStompSession();

        BlockingQueue<ChatMessageDto> receivedMessagesSender = new ArrayBlockingQueue<>(2);
        BlockingQueue<ChatMessageDto> receivedMessagesDestination = new ArrayBlockingQueue<>(2);
        client.subscribe("/queue/" + userBanana.getName().value(), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesDestination.add((ChatMessageDto) payload);
            }
        });

        client.subscribe("/user/topic/me", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessagesSender.add((ChatMessageDto) payload);
            }
        });

        ChatMessageDto sentMessage = new ChatMessageDto("pippo", userBanana.getName().value());
        client.send("/app/chat.send." + userBanana.getName().value(), sentMessage);

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                ChatMessageDto received = receivedMessagesSender.poll();
                Assertions.assertEquals(sentMessage.getContent(), received.getContent());
                Assertions.assertEquals(sentMessage.getSender(), received.getSender());
            });

        await()
            .atMost(1, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                ChatMessageDto received = receivedMessagesDestination.poll();
                Assertions.assertEquals(sentMessage.getContent(), received.getContent());
                Assertions.assertEquals(sentMessage.getSender(), received.getSender());
            });

        List<ChatMessageEntity> messages = chatMessageRepository.getByRoomNameNumberOfMessages(RoomName.of("banana-user1"), 1, Username.of("user1"));
        Assertions.assertEquals(1,messages.size());
        Assertions.assertEquals(sentMessage.getContent(),messages.get(0).getContent());
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
