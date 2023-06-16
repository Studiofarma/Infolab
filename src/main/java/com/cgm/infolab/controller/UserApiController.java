package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.UserDto;
import com.cgm.infolab.service.FromEntitiesToDtosService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class UserApiController {

    private final UserRepository userRepository;
    private final FromEntitiesToDtosService fromEntitiesToDtosService;
    private final Logger log = LoggerFactory.getLogger(UserApiController.class);


    @Autowired
    public UserApiController(UserRepository userRepository, FromEntitiesToDtosService fromEntitiesToDtosService) {
        this.userRepository = userRepository;
        this.fromEntitiesToDtosService = fromEntitiesToDtosService;
    }

    @GetMapping("/api/users")
    public List<UserDto> getUsername(@RequestParam("user") String user) {

        List<UserDto> UserDtos = new ArrayList<>();
        List<UserEntity> userEntities = userRepository.getByUsernameWithLike(user);

        if (userEntities.size() > 0) {
            UserDtos = userEntities.stream().map(fromEntitiesToDtosService::fromEntityToDto).toList();
        } else {
            log.info("Non sono stati trovati users");
        }
        return UserDtos;
    }
}
