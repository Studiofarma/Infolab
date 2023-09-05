package com.cgm.infolab.controller.api;

import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.rowset.serial.SerialBlob;
import java.security.Principal;
import java.sql.SQLException;

@RestController
public class ProfileApiController {

    private final ApiHelper apiHelper;
    private final UserService userService;

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

    @PostMapping("/api/profile/changeavatar")
    public void postAvatarChange(@RequestBody byte[] data, Principal principal) throws SQLException {
        userService.saveAvatarInDb(AvatarEntity.of(new SerialBlob(data)), Username.of(principal.getName()));
    }
}
