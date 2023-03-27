package com.cgm.infolab.service;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.LastMessageDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    private final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    public ChatService(UserRepository userRepository,
                       RoomRepository roomRepository,
                       ChatMessageRepository chatMessageRepository){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.chatMessageRepository = chatMessageRepository;
    }
    public void saveMessageInDb(ChatMessageDto message, Username username){

        Timestamp timestamp = new Timestamp(System.currentTimeMillis()); // TODO: rimuovere quando arriverà dal FE

        UserEntity sender = userRepository.getByUsername(Username.of(message.getSender())).orElseGet(() -> {
            log.info(String.format("Utente username=\"%s\" non trovato.", message.getSender()));
            return null;
        });

        String roomName = "general";
        RoomEntity room = roomRepository.getByRoomName(roomName, username).orElseGet(() -> {
            log.info(String.format("Room roomName=\"%s\" non trovata.", roomName));
            return null;
        });
        ChatMessageEntity messageEntity =
                ChatMessageEntity.of(sender, room, timestamp.toLocalDateTime(), message.getContent());

        try {
            chatMessageRepository.add(messageEntity);
        } catch (DuplicateKeyException e) {
            log.info(String.format("ChatMessageEntity id=\"%s\" già esistente nel database", messageEntity.getContent()));
        }
    }

    public ChatMessageDto fromEntityToChatMessageDto(ChatMessageEntity messageEntity) {
        return new ChatMessageDto(messageEntity.getContent(),
                messageEntity.getTimestamp(),
                messageEntity.getSender().getName().value());
    }

    public LastMessageDto fromEntityToLastMessageDto(ChatMessageEntity messageEntity) {
        return LastMessageDto.of(messageEntity.getContent(), messageEntity.getTimestamp());
    }

    public List<ChatMessageEntity> getAllMessagesGeneral (int numberOfMessages, Username username) {
        List<ChatMessageEntity> chatMessageEntities = new ArrayList<>();
        try {
            chatMessageEntities = chatMessageRepository
                    .getByRoomNameNumberOfMessages("general",
                            numberOfMessages,
                            username);
        } catch (IllegalArgumentException e) {
            log.info(e.getMessage());
            return chatMessageEntities;
        }

        return chatMessageEntities;
    }
}

