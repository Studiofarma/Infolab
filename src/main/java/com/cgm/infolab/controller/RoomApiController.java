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

    // TODO: magari è necessario far si che le room prese siano soltanto quelle assegnate ad uno user,
    //  in modo che uno user non possa vedere le room di qualcun altro.
    //  Per farlo o si stabilisce una convenzione per capire se uno user è in una stanza,
    //  o va aggiunta una relazione al db.
    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false) String date) {
        List<RoomDto> roomDtos = new ArrayList<>();

        List<RoomEntity> roomEntities = roomRepository.getAfterDate(convertString(date));

        if (roomEntities.size() > 0) {
            roomDtos = roomEntities.stream().map(this::roomEntityToDto).toList();
        } else {
            log.info("Non sono state trovate room");
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

    private RoomDto roomEntityToDto(RoomEntity roomEntity) {
        RoomDto roomDto = RoomDto.of(roomEntity.getName());

        ChatMessageEntity message = chatMessageRepository
                .getLastMessageByRoomId(roomEntity.getId()).orElseGet(() -> {
                    log.info(String.format("Nessun messaggio trovato nella room roomId=\"%d\"", roomEntity.getId()));
                    return ChatMessageEntity.emptyMessage();
                });

        roomDto.setLastMessagePreview(message.getContent());
        roomDto.setLastMessageTimestamp(message.getTimestamp());

        return roomDto;
    }
}
