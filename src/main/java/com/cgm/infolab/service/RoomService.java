package com.cgm.infolab.service;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomService {
    private final ChatMessageRepository chatMessageRepository;

    private final Logger log = LoggerFactory.getLogger(RoomService.class);

    @Autowired
    public RoomService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName());

        ChatMessageEntity message = chatMessageRepository
                .getLastMessageByRoomId(roomEntity.getId()).orElseGet(() -> {
                    log.info(String.format("Nessun messaggio trovato nella room roomId=\"%d\"", roomEntity.getId()));
                    return ChatMessageEntity.empty();
                });

        roomDto.setLastMessage(LastMessageDto.of(message.getContent(), message.getTimestamp()));

        return roomDto;
    }
}
