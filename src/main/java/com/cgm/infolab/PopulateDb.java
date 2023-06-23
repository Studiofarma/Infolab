package com.cgm.infolab;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.Random;

@Component
@ConditionalOnProperty(name = "service.populate", havingValue = "true")
public class PopulateDb {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    private final ChatService chatService;

    private final int USERS_NUMBER = 69;

    private final Logger log = LoggerFactory.getLogger(PopulateDb.class);

    public PopulateDb(RoomRepository roomRepository, UserRepository userRepository, ChatService chatService) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.chatService = chatService;
    }

    @EventListener(ApplicationReadyEvent.class)
    private void addALotOfRecordsToDb() {
        addUsers(0, USERS_NUMBER);
        addPublicRooms();
        addMessages();
        addUsers(USERS_NUMBER, 1069);
    }

    private void addUsers(int from, int number) {
        for (int i = 0; i < number; i++) {
            try {
                Username username = buildUsername(i);
                UserEntity user = UserEntity.of(username, "description of " + username.value());
                userRepository.add(user);
            } catch (DuplicateKeyException e) {
                continue;
            }
        }
    }

    private void addPublicRooms() {
        try {
            roomRepository.add(RoomEntity.general());
        } catch (DuplicateKeyException e) {
            log.debug("The room general already exists");
        }

        try {
            roomRepository.add(RoomEntity.of(RoomName.of("general2"), VisibilityEnum.PUBLIC, "Generale 2"));
        } catch (DuplicateKeyException e) {
            log.debug("The room general2 already exists");
        }

        try {
            roomRepository.add(RoomEntity.of(RoomName.of("general3"), VisibilityEnum.PUBLIC, "Generale 3"));
        } catch (DuplicateKeyException e) {
            log.debug("The room general3 already exists");
        }
    }

    private void addMessages() {

        Random random = new Random();

        for (int i = 0; i < 15000; i++) {
            Username sender;
            Username destinationUser;

            do {
                sender = buildUsername(random.nextInt(USERS_NUMBER));
                destinationUser = buildUsername(random.nextInt(USERS_NUMBER));
            } while (sender.equals(destinationUser));

            RoomName room = RoomName.of(sender, buildUsername(random.nextInt(USERS_NUMBER)));

            ChatMessageDto messageDto = new ChatMessageDto(randomMessage(), new Timestamp(System.currentTimeMillis()).toLocalDateTime(), sender.value());

            chatService.saveMessageInDb(messageDto, sender, room, destinationUser);
        }
    }

    private Username buildUsername(int n) {
        return Username.of("user" + n);
    }

    private String randomMessage() {
        byte[] bytes = new byte[50];
        new Random().nextBytes(bytes);
        return new String(bytes, StandardCharsets.UTF_8);
    }
}
