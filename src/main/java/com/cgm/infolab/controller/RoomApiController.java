package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.ChatMessageEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.repository.ChatMessageRepository;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.model.RoomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
public class RoomApiController {

    private final RoomRepository roomRepository;
    private final ChatMessageRepository chatMessageRepository;

    private final Logger log = LoggerFactory.getLogger(RoomApiController.class);

    @Autowired
    public RoomApiController(RoomRepository roomRepository, ChatMessageRepository messageRepository) {
        this.roomRepository = roomRepository;
        this.chatMessageRepository = messageRepository;
    }

    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false) String dateLimit) {
        List<RoomDto> roomDtos = new ArrayList<>();

        List<RoomEntity> roomEntities = roomRepository.getAfterDate(convertString(dateLimit));

        for (RoomEntity r : roomEntities) {
            RoomDto dto = RoomDto.of(r.getName());

            ChatMessageEntity message = chatMessageRepository.getLastMessageByRoomId(r.getId());

            dto.setLastMessagePreview(message.getContent());
            dto.setLastMessageTimestamp(message.getTimestamp());

            roomDtos.add(dto);
        }

        return roomDtos;
    }

    private LocalDate convertString(String date) {
        if (date == null) {
            return null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse(date, formatter);
        }
    }
}
