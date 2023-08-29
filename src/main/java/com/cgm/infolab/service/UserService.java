package com.cgm.infolab.service;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.db.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> getUsersByUsernames(List<Username> usernames) {
        return userRepository.getUsersByUsernames(usernames);
    }

    public UserEntity saveUserInDb(Username username, UserStatusEnum status) throws DuplicateKeyException {
        return userRepository.add(UserEntity.of(username, username.value(), status));
    }

    public int updateUserStatus(Username username, UserStatusEnum status) {
        return userRepository.updateUserStatus(username, status);
    }
}
