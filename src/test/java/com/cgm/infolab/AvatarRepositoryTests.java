package com.cgm.infolab;

import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.RoomEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.AvatarRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.templates.RepositoryTestTemplate;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({ProfilesConstants.TEST})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AvatarRepositoryTests extends RepositoryTestTemplate {
    @Autowired
    private AvatarRepository avatarRepository;
    @Autowired
    private UserRepository userRepository;

    private final UserEntity user1 = UserEntity.of(Username.of("user1"), "user1 desc");
    private final UserEntity userBanana = UserEntity.of(Username.of("banana"), "user banana desc");
    private byte[] testBlob = "Test blob data".getBytes();
    private byte[] testBlob2 = "Test blob number 2 data".getBytes();

    @Override
    @BeforeEach
    protected void setUpAll() {
        super.setUpAll();

        testDbHelper.addRooms(RoomEntity.general());

        testDbHelper.addUsers(user1, userBanana);
    }

    @Test
    void whenAddingAvatarToDb_itIsSavedCorrectly() {

        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.addOrUpdate(avatar, user1.getName()));

        AvatarEntity avatarFromDb = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBytes("image")));

        Assertions.assertArrayEquals(testBlob, avatarFromDb.getImage());
    }

    @Test
    void whenAddingAvatarToDb_itIsCorrectlyAssociatedWithUser() throws InterruptedException {
        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.addOrUpdate(avatar, user1.getName()));

        UserEntity user = userRepository.getByUsername(user1.getName()).get();

        Assertions.assertTrue(user.getAvatarId().isPresent());

        AvatarEntity avatarFromDb = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars WHERE id = ?",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBytes("image")),
                user.getAvatarId().get());

        Assertions.assertArrayEquals(testBlob, avatarFromDb.getImage());
    }

    @Test
    void whenTryingToAddAvatar_forNotExistingUser_illegalArgumentExceptionIsThrown() {
        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            avatarRepository.addOrUpdate(avatar, Username.of("user2"));
        });
    }

    @Test
    void whenAddingAvatar_toUserThatAlreadyHasOne_itIsUpdated() {
        jdbcTemplate.update("INSERT INTO infolab.avatars (id, image) VALUES (?, ?)", 10, testBlob);

        int affectedRows1 = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 10 WHERE username = 'user1'");

        Assertions.assertEquals(1, affectedRows1);

        AvatarEntity avatar1 = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars WHERE id = ?",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBytes("image")),
                10);

        Assertions.assertArrayEquals(testBlob, avatar1.getImage());

        Long returnedId = avatarRepository.addOrUpdate(AvatarEntity.of(testBlob2), user1.getName());

        Assertions.assertNull(returnedId);

        AvatarEntity avatar2 = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars WHERE id = ?",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBytes("image")),
                10);

        Assertions.assertEquals(avatar1.getId(), avatar2.getId()); // This is always true because it is in the where of the query. It is here for clarity.
        Assertions.assertArrayEquals(testBlob2, avatar2.getImage());
    }

    @Test
    void whenFetchingAvatarById_correctAvatarIsReturned() {
        jdbcTemplate.update("INSERT INTO infolab.avatars (id, image) VALUES (?, ?), (?, ?)", 10, testBlob, 20, testBlob2);

        int affectedRows1 = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 10 WHERE username = 'user1'");
        int affectedRowsBanana = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 20 WHERE username = 'banana'");

        Assertions.assertEquals(1, affectedRows1);
        Assertions.assertEquals(1, affectedRowsBanana);

        AvatarEntity avatar1 = avatarRepository.getAvatarById(10).get();

        Assertions.assertArrayEquals(testBlob, avatar1.getImage());

        AvatarEntity avatarBanana = avatarRepository.getAvatarById(20).get();

        Assertions.assertArrayEquals(testBlob2, avatarBanana.getImage());
    }

    @Test
    void whenFetchingAvatarById_ofNotExistingId_emptyOptionalIsReturned() {
        jdbcTemplate.update("INSERT INTO infolab.avatars (id, image) VALUES (?, ?)", 10, testBlob);

        int affectedRows1 = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 10 WHERE username = 'user1'");

        Assertions.assertEquals(1, affectedRows1);

        Optional<AvatarEntity> optional = avatarRepository.getAvatarById(20);

        Assertions.assertTrue(optional.isEmpty());
    }
}
