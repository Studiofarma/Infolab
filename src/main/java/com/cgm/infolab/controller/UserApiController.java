package com.cgm.infolab.controller;

import com.cgm.infolab.db.model.CursorEnum;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.UserDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class UserApiController {

    private final UserRepository userRepository;
    private final Logger log = LoggerFactory.getLogger(UserApiController.class);


    @Autowired
    public UserApiController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/users")
    public List<UserDto> getUsername(@RequestParam("user") String user,
                                     @RequestParam(required = false, name = "page[size]") Integer pageSize,
                                     @RequestParam(required = false, name = "page[before]") String pageBefore,
                                     @RequestParam(required = false, name = "page[after]") String pageAfter) {

        if (pageSize == null) pageSize = -1;

        List<UserDto> UserDtos = new ArrayList<>();
        List<UserEntity> userEntities;
        if (pageBefore == null && pageAfter == null) {
            userEntities = userRepository.getByUsernameWithLike(Username.of(user), pageSize, CursorEnum.NONE, "");
        } else if (pageBefore != null) {
            userEntities = userRepository.getByUsernameWithLike(Username.of(user), pageSize, CursorEnum.PAGE_BEFORE, pageBefore);
        } else { // pageAfter != null
            userEntities = userRepository.getByUsernameWithLike(Username.of(user), pageSize, CursorEnum.PAGE_AFTER, pageAfter);
        }

        if (userEntities.size() > 0) {
            UserDtos = userEntities.stream().map(FromEntitiesToDtosMapper::fromEntityToDto).toList();
        } else {
            log.info("Non sono stati trovati users");
        }
        return UserDtos;
    }
}
