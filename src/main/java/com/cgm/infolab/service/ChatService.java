package com.cgm.infolab.service;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.LastMessageDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RoomService roomService;

    private final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    public ChatService(UserRepository userRepository,
                       RoomRepository roomRepository,
                       ChatMessageRepository chatMessageRepository,
                       RoomService roomService){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.roomService = roomService;
    }

    public ChatMessageEntity saveMessageInDb(ChatMessageDto message, Username username, RoomName roomName, Username destinationUser){

        Timestamp timestamp = new Timestamp(System.currentTimeMillis()); // TODO: rimuovere quando arriverà dal FE

        UserEntity sender = userRepository.getByUsername(Username.of(message.getSender())).orElseGet(() -> {
            log.info(String.format("Utente username=\"%s\" non trovato.", message.getSender()));
            return null;
        });

        RoomEntity room = getOrCreateRoom(username, roomName, destinationUser);
        ChatMessageEntity messageEntity =
                ChatMessageEntity.of(sender, room, timestamp.toLocalDateTime(), message.getContent());

        try {
            chatMessageRepository.add(messageEntity);
        } catch (DuplicateKeyException e) {
            log.info(String.format("ChatMessageEntity id=\"%s\" già esistente nel database", messageEntity.getContent()));
        }

        return messageEntity;
    }

    private RoomEntity getOrCreateRoom(Username username, RoomName roomName, Username destinationUser) {
        return roomRepository.getByRoomName(roomName, username).orElseGet(() -> {
            log.info(String.format("Room roomName=\"%s\" non trovata.", roomName.value()));

            roomService.createPrivateRoomAndSubscribeUsers(username, destinationUser);

            try {
                return roomRepository.getByRoomName(roomName, username).orElseThrow();
            } catch (Exception e) {
                log.error("Room già esistente");
            }

            return null;
        });
    }

    public List<ChatMessageEntity> getAllMessages(int numberOfMessages, Username username, String roomName) {
        List<ChatMessageEntity> chatMessageEntities = new ArrayList<>();
        try {
            chatMessageEntities = chatMessageRepository
                    .getByRoomNameNumberOfMessages(RoomName.of(roomName),
                            numberOfMessages,
                            username);
        } catch (IllegalArgumentException e) {
            log.info(e.getMessage());
            return chatMessageEntities;
        }

        return chatMessageEntities;
    }
}

