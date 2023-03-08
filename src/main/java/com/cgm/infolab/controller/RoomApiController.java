package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.repository.RoomRepository;
import com.cgm.infolab.model.RoomDto;
import com.cgm.infolab.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
public class RoomApiController {
    private final RoomService roomService;

    @Autowired
    public RoomApiController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/api/rooms")
    public List<RoomDto> getAllRooms(@RequestParam(required = false) String date, Principal principal) {
        return roomService.getRooms(date, principal.getName());
    }
}
