package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class UserRepositoryTests {

    @Autowired
    public UserRepository userRepository;
    @Autowired
    public JdbcTemplate jdbcTemplate;

    public UserEntity[] users =
            {UserEntity.of(Username.of("user0"), "user0 desc"),
                    UserEntity.of(Username.of("user1"), ""),
                    UserEntity.of(Username.of("user2"), null)};
    public UserEntity loggedInUser = users[0]; // user0

    @BeforeAll
    void setupAll() {
        jdbcTemplate.update("DELETE FROM infolab.download_dates");
        jdbcTemplate.update("DELETE FROM infolab.chatmessages");
        jdbcTemplate.update("DELETE FROM infolab.rooms_subscriptions");
        jdbcTemplate.update("DELETE FROM infolab.users");
        jdbcTemplate.update("DELETE FROM infolab.rooms WHERE roomname <> 'general'");

        for (UserEntity user : users) {
            userRepository.add(user);
        }
    }

    @Test
    void ifUserDescIsEmptyString_returnedDescIsUsername() {
        UserEntity user1FromDb = userRepository.getByUsername(users[1].getName()).orElseThrow(() -> new RuntimeException("No user returned from query"));

        Assertions.assertEquals(user1FromDb.getName().value(), user1FromDb.getDescription());
    }
    @Test
    void ifUserDescIsNull_returnedDescIsUsername() {
        UserEntity user2FromDb = userRepository.getByUsername(users[2].getName()).orElseThrow(() -> new RuntimeException("No user returned from query"));

        Assertions.assertEquals(user2FromDb.getName().value(), user2FromDb.getDescription());
    }
}
