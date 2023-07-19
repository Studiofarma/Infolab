package com.cgm.infolab.service;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enums.CursorEnum;
import com.cgm.infolab.db.model.enums.Username;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.RoomSubscriptionRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.ChatMessageDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final DownloadDateRepository downloadDateRepository;

    private final RoomSubscriptionRepository roomSubscriptionRepository;
    private final RoomService roomService;

    private final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    public ChatService(UserRepository userRepository,
                       RoomRepository roomRepository,
                       ChatMessageRepository chatMessageRepository,
                       RoomSubscriptionRepository roomSubscriptionRepository,
                       RoomService roomService,
                       DownloadDateRepository downloadDateRepository){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.roomSubscriptionRepository = roomSubscriptionRepository;
        this.roomService = roomService;
        this.downloadDateRepository = downloadDateRepository;
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
            messageEntity = chatMessageRepository.add(messageEntity);
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

    public List<ChatMessageEntity> getAllMessages(int pageSize, Username username, RoomName roomName, String pageBefore, String pageAfter) {
        List<ChatMessageEntity> chatMessageEntities = new ArrayList<>();
        try {
            if (pageAfter == null && pageBefore == null) {
                chatMessageEntities = chatMessageRepository.getByRoomNameNumberOfMessages(roomName, pageSize, CursorEnum.NONE, null, username);
            } else if (pageBefore != null) {
                chatMessageEntities = chatMessageRepository.getByRoomNameNumberOfMessages(roomName, pageSize, CursorEnum.PAGE_BEFORE, fromStringToDate(pageBefore), username);
            } else { // pageAfter != null
                chatMessageEntities = chatMessageRepository.getByRoomNameNumberOfMessages(roomName, pageSize, CursorEnum.PAGE_AFTER, fromStringToDate(pageAfter), username);
            }
        } catch (IllegalArgumentException e) {
            log.info(e.getMessage());
            return chatMessageEntities;
        }

        return chatMessageEntities;
    }

    public void updateReadTimestamp(Username user, RoomName room) {
        downloadDateRepository.addWhereNotDownloadedYetForUser(user, room);
    }

    public void deleteMessageById(Username user, Long messageId) {
        chatMessageRepository.deleteMessage(user, messageId);
    }

    private LocalDateTime fromStringToDate(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return LocalDateTime.parse(date, formatter);
        }
    }

}

