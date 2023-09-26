package com.cgm.infolab;

import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.templates.RepositoryTestTemplate;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class UserRepositoryTests extends RepositoryTestTemplate {

    @Autowired
    public UserRepository userRepository;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0"), "user0 desc"),
                    UserEntity.of(Username.of("user1"), ""),
                    UserEntity.of(Username.of("user2"), null),
                    UserEntity.of(Username.of("user3"), "user3 desc"),
                    UserEntity.of(Username.of("user4"), "user4 desc"),
            };

    @Override
    @BeforeAll
    protected void setUp() {
        super.setUp();

        testDbHelper.addRooms(RoomEntity.general());

        testDbHelper.addUsers(users);
    }

    @Test
    void ifUserDescIsEmptyString_returnedDescIsUsername() {
        UserEntity user1FromDb = userRepository.getByUsername(users[1].getName()).get();

        Assertions.assertEquals(user1FromDb.getName().value(), user1FromDb.getDescription());
    }
    @Test
    void ifUserDescIsNull_returnedDescIsUsername() {
        UserEntity user2FromDb = userRepository.getByUsername(users[2].getName()).get();

        Assertions.assertEquals(user2FromDb.getName().value(), user2FromDb.getDescription());
    }

    @Test
    void whenUserStatusIsUpdated_statusIsActuallyUpdated() {
        UserEntity user0Before = userRepository.getByUsername(users[0].getName()).get();

        Assertions.assertEquals(UserStatusEnum.OFFLINE, user0Before.getStatus());

        int rowsAffected1 = userRepository.updateUserStatus(users[0].getName(), UserStatusEnum.ONLINE);

        UserEntity user0After1 = userRepository.getByUsername(users[0].getName()).get();

        Assertions.assertEquals(1, rowsAffected1);
        Assertions.assertEquals(UserStatusEnum.ONLINE, user0After1.getStatus());

        int rowsAffected2 = userRepository.updateUserStatus(users[0].getName(), UserStatusEnum.OFFLINE);

        UserEntity user0After2 = userRepository.getByUsername(users[0].getName()).get();

        Assertions.assertEquals(1, rowsAffected2);
        Assertions.assertEquals(UserStatusEnum.OFFLINE, user0After2.getStatus());
    }

    @Test
    void whenUpdatingUserDescription_descriptionIsUpdatedCorrectly() {
        UserEntity user3Before = userRepository.getByUsername(users[3].getName()).get();

        Assertions.assertEquals("user3 desc", user3Before.getDescription());

        int rowsAffected = userRepository.updateUserDescription(users[3].getName(), "Banana");

        UserEntity user3After = userRepository.getByUsername(users[3].getName()).get();

        Assertions.assertEquals(1, rowsAffected);
        Assertions.assertEquals("Banana", user3After.getDescription());
    }

    @Test
    void whenUpdatingUserTheme_themeIsUpdatedCorrectly() {
        UserEntity user4Before = userRepository.getByUsername(users[4].getName()).get();

        Assertions.assertEquals(ThemeEnum.LIGHT, user4Before.getTheme());

        int rowsAffected = userRepository.updateUserTheme(users[4].getName(), ThemeEnum.DARK);

        UserEntity user4After = userRepository.getByUsername(users[4].getName()).get();

        Assertions.assertEquals(1, rowsAffected);
        Assertions.assertEquals(ThemeEnum.DARK, user4After.getTheme());
    }
}
