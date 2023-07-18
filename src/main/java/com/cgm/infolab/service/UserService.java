package com.cgm.infolab.service;

import com.cgm.infolab.db.model.CursorEnum;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.model.UserDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> getUsersPaginatedWithLike(Integer pageSize, String pageBefore, String pageAfter, Username user) {
        if (pageBefore == null && pageAfter == null) {
            return userRepository.getByUsernameWithLike(user, pageSize, CursorEnum.NONE, "");
        } else if (pageBefore != null) {
            return userRepository.getByUsernameWithLike(user, pageSize, CursorEnum.PAGE_BEFORE, pageBefore);
        } else { // pageAfter != null
            return userRepository.getByUsernameWithLike(user, pageSize, CursorEnum.PAGE_AFTER, pageAfter);
        }
    }
}
