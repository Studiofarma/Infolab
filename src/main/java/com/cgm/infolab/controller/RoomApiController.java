package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.RoomEntity;
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
    private final RoomService roomService;

    private final Logger log = LoggerFactory.getLogger(RoomApiController.class);

    @Autowired
    public RoomApiController(RoomRepository roomRepository, RoomService roomService) {
        this.roomRepository = roomRepository;
        this.roomService = roomService;
    }

    // TODO: magari è necessario far si che le room prese siano soltanto quelle assegnate ad uno user,
    //  in modo che uno user non possa vedere le room di qualcun altro.
    //  Per farlo o si stabilisce una convenzione per capire se uno user è in una stanza,
    //  o va aggiunta una relazione al db.
    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false) String date) {
        List<RoomDto> roomDtos = new ArrayList<>();

        List<RoomEntity> roomEntities = roomRepository.getAfterDate(fromStringToDate(date));

        if (roomEntities.size() > 0) {
            roomDtos = roomEntities.stream().map(roomService::fromEntityToDto).toList();
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
