package com.cgm.infolab.service;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.model.LastMessageDto;
import com.cgm.infolab.model.RoomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {
    private final ChatService chatService;
    private final RoomRepository roomRepository;

    private final Logger log = LoggerFactory.getLogger(RoomService.class);

    @Autowired
    public RoomService(ChatService chatService, RoomRepository roomRepository) {
        this.chatService = chatService;
        this.roomRepository = roomRepository;
    }

    public RoomDto fromEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName());

        LastMessageDto message = chatService.fromEntityToLastMessageDto(roomEntity.getMessages().get(0));

        roomDto.setLastMessage(message);

        return roomDto;
    }

    public List<RoomDto> getRooms(String date, String username) {
        List<RoomDto> roomDtos = new ArrayList<>();

        List<RoomEntity> roomEntities = roomRepository.getAfterDate(fromStringToDate(date), username);

        if (roomEntities.size() > 0) {
            roomDtos = roomEntities.stream().map(this::fromEntityToDto).toList();
        } else {
            log.info("Non sono state trovate room");
        }

        return roomDtos;
    }

    private LocalDate fromStringToDate(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse(date, formatter);
        }
    }
}
