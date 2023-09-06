package com.cgm.infolab.controller.api;

import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;

@RestController
public class ProfileApiController {

    private final ApiHelper apiHelper;
    private final UserService userService;

    private final Logger log = LoggerFactory.getLogger(ProfileApiController.class);

    public ProfileApiController(ApiHelper apiHelper, UserService userService) {
        this.apiHelper = apiHelper;
        this.userService = userService;
    }

    @PostMapping("/api/profile/changedesc")
    public void postNewUserDescription(@RequestParam String newDesc, Principal principal) {
        if (newDesc == null || newDesc.isEmpty()) {
            apiHelper.throwBadRequestStatus("You cannot set an empty description.");
        }

        userService.updateUserDescription(Username.of(principal.getName()), newDesc);
    }

    @PostMapping("/api/profile/changetheme")
    public void postThemeChange(@RequestParam String newTheme, Principal principal) {
        ThemeEnum themeEnum = null;
        try {
            themeEnum = ThemeEnum.valueOf(newTheme);
        } catch (IllegalArgumentException e) {
            apiHelper.throwBadRequestStatus("The new theme specified is not valid.");
        }

        userService.updateUserTheme(Username.of(principal.getName()), themeEnum);
    }

    @PostMapping(value = "/api/profile/changeavatar")
    public void postAvatarChange(@RequestBody byte[] data, Principal principal) {
        userService.saveAvatarInDb(AvatarEntity.of(data), Username.of(principal.getName()));
    }

    @GetMapping("/api/profile/avatar/{avatarId}")
    public byte[] getAvatarImage(@PathVariable long avatarId) {
        AvatarEntity avatar = userService.getAvatarByIdForUser(avatarId).orElseGet(() -> {
            apiHelper.throwNotFoundStatus("No avatar with id=%d has been found.".formatted(avatarId));
            return null;
        });

        return avatar.getImage();
    }
}
