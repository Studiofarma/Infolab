package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.helper.TestDbHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class UserRepositoryTests {

    @Autowired
    public UserRepository userRepository;
    @Autowired
    public TestDbHelper testDbHelper;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0"), "user0 desc"),
                    UserEntity.of(Username.of("user1"), ""),
                    UserEntity.of(Username.of("user2"), null)};

    @BeforeAll
    void setupAll() {
        testDbHelper.clearDbExceptForGeneral();

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
}
