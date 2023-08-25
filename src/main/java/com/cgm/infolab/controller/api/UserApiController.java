package com.cgm.infolab.controller.api;

import com.cgm.infolab.controller.FromEntitiesToDtosMapper;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.model.UserDto;
import com.cgm.infolab.service.UserService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import static com.cgm.infolab.controller.api.ApiConstants.*;

@RestController
@Validated
public class UserApiController {

    private final UserService userService;
    private final ApiHelper apiHelper; // TODO: remove if not used
    private final Logger log = LoggerFactory.getLogger(UserApiController.class);


    @Autowired
    public UserApiController(UserService userService, ApiHelper apiHelper) {
        this.userService = userService;
        this.apiHelper = apiHelper;
    }

    @GetMapping("/api/users")
    public List<UserDto> getUsers(@RequestParam List<String> usernames) {

        List<UserDto> UserDtos = new ArrayList<>();
        List<UserEntity> userEntities = userService.getUsersByUsernames(usernames.stream().map(Username::of).toList());

        if (!userEntities.isEmpty()) {
            UserDtos = userEntities.stream().map(FromEntitiesToDtosMapper::fromEntityToDto).toList();
        } else {
            log.info("Non sono stati trovati users");
        }
        return UserDtos;
    }
}
