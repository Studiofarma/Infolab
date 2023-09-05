package com.cgm.infolab.service;

import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.db.repository.AvatarRepository;
import com.cgm.infolab.db.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AvatarRepository avatarRepository;

    public UserService(UserRepository userRepository, AvatarRepository avatarRepository) {
        this.userRepository = userRepository;
        this.avatarRepository = avatarRepository;
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

    public int updateUserDescription(Username username, String newDescription) {
        return userRepository.updateUserDescription(username, newDescription);
    }

    public int updateUserTheme(Username username, ThemeEnum theme) {
        return userRepository.updateUserTheme(username, theme);
    }

    public Long saveAvatarInDb(AvatarEntity avatar, Username username) {
        return avatarRepository.addOrUpdate(avatar, username);
    }

    public Optional<AvatarEntity> getAvatarByIdForUser(Username username, long avatarId) {
        return avatarRepository.getAvatarById(username, avatarId);
    }
}
