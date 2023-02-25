package com.cgm.infolab.controller;

import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.model.RoomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
public class RoomApiController {

    private final RoomRepository roomRepository;

    private final Logger log = LoggerFactory.getLogger(RoomApiController.class);

    @Autowired
    public RoomApiController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false)LocalDateTime dateLimit) {
        List<RoomDto> roomDtos = new ArrayList<>();
        roomDtos.add(RoomDto.of("UwU"));

        return roomDtos;
    }
}
