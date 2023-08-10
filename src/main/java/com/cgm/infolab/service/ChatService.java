package com.cgm.infolab.service;

import com.cgm.infolab.db.model.*;
import com.cgm.infolab.db.model.enumeration.CursorEnum;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.DownloadDateRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.helper.DateTimeHelper;
import com.cgm.infolab.model.ChatMessageDto;
import com.cgm.infolab.model.IdDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final DownloadDateRepository downloadDateRepository;

    private final RoomService roomService;

    private final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    public ChatService(UserRepository userRepository,
                       RoomRepository roomRepository,
                       ChatMessageRepository chatMessageRepository,
                       RoomService roomService,
                       DownloadDateRepository downloadDateRepository){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.roomService = roomService;
        this.downloadDateRepository = downloadDateRepository;
    }

    public ChatMessageEntity saveMessageInDb(ChatMessageDto message, Username username, RoomName roomName, Username destinationUser){

        UserEntity sender = userRepository.getByUsername(Username.of(message.getSender())).orElseGet(() -> {
            log.info(String.format("Utente username=\"%s\" non trovato.", message.getSender()));
            return null;
        });

        RoomEntity room = getOrCreateRoom(username, roomName, destinationUser);
        ChatMessageEntity messageEntity =
                ChatMessageEntity.of(sender, room, DateTimeHelper.nowLocalDateTime(), message.getContent());

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
                chatMessageEntities = chatMessageRepository.getByRoomNameNumberOfMessages(roomName, pageSize, CursorEnum.PAGE_BEFORE, DateTimeHelper.fromStringToDateTimeWithT(pageBefore), username);
            } else { // pageAfter != null
                chatMessageEntities = chatMessageRepository.getByRoomNameNumberOfMessages(roomName, pageSize, CursorEnum.PAGE_AFTER, DateTimeHelper.fromStringToDateTimeWithT(pageAfter), username);
            }
        } catch (IllegalArgumentException e) {
            log.info(e.getMessage());
            return chatMessageEntities;
        }

        return chatMessageEntities;
    }

    public int updateReadTimestamp(Username user, RoomName room) {
        return downloadDateRepository.addWhereNotDownloadedYetForUser(user, room);
    }

    public int addReadTimestampForMessages(Username user, List<IdDto> messageIds) {
        List<Long> ids = messageIds.stream().map(IdDto::id).toList();
        return downloadDateRepository.addDownloadDateToMessages(user, ids);
    }

    public int deleteMessageById(Username user, Long messageId) {
        return chatMessageRepository.updateMessageAsDeleted(user, messageId);
    }

    public int editMessageById(Username user, Long messageId, String newContent) {
        return chatMessageRepository.editMessage(user, messageId, newContent);
    }


}

