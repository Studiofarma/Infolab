package com.cgm.infolab;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.AvatarRepository;
import com.cgm.infolab.db.repository.UserRepository;
import com.cgm.infolab.helper.TestDbHelper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.Optional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AvatarRepositoryTests {
    @Autowired
    private AvatarRepository avatarRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TestDbHelper testDbHelper;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final UserEntity user1 = UserEntity.of(Username.of("user1"), "user1 desc");
    private final UserEntity userBanana = UserEntity.of(Username.of("banana"), "user banana desc");
    private Blob testBlob;
    private Blob testBlob2;

    @BeforeAll
    void beforeAll() throws SQLException {
        testBlob = new SerialBlob("Test blob data".getBytes());
        testBlob2 = new SerialBlob("Test blob number 2 data".getBytes());
    }

    @BeforeEach
    void setUp() {
        testDbHelper.clearDbExceptForGeneral();

        testDbHelper.addUsers(user1, userBanana);
    }

    @Test
    void whenAddingAvatarToDb_itIsSavedCorrectly() throws SQLException, IOException {

        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.addOrUpdate(avatar, user1.getName()));

        AvatarEntity avatarFromDb = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBlob("image")));

        Assertions.assertArrayEquals(testBlob.getBinaryStream().readAllBytes(), avatarFromDb.getImage().getBinaryStream().readAllBytes());
    }

    @Test
    void whenAddingAvatarToDb_itIsCorrectlyAssociatedWithUser() throws SQLException, IOException {
        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.addOrUpdate(avatar, user1.getName()));

        UserEntity user = userRepository.getByUsername(user1.getName()).get();

        Assertions.assertNotEquals(ID.None, user.getAvatarId());

        AvatarEntity avatarFromDb = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars WHERE id = ?",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBlob("image")),
                user.getAvatarId());

        Assertions.assertArrayEquals(testBlob.getBinaryStream().readAllBytes(), avatarFromDb.getImage().getBinaryStream().readAllBytes());
    }

    @Test
    void whenTryingToAddAvatar_forNotExistingUser_illegalArgumentExceptionIsThrown() {
        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            avatarRepository.addOrUpdate(avatar, Username.of("user2"));
        });
    }

    @Test
    void whenAddingAvatar_toUserThatAlreadyHasOne_itIsUpdated() throws SQLException, IOException {
        jdbcTemplate.update("INSERT INTO infolab.avatars (id, image) VALUES (?, ?)", 10, testBlob);

        int affectedRows1 = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 10 WHERE username = 'user1'");

        Assertions.assertEquals(1, affectedRows1);

        AvatarEntity avatar1 = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars WHERE id = ?",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBlob("image")),
                10);

        Assertions.assertArrayEquals(testBlob.getBinaryStream().readAllBytes(), avatar1.getImage().getBinaryStream().readAllBytes());

        Long returnedId = avatarRepository.addOrUpdate(AvatarEntity.of(testBlob2), user1.getName());

        Assertions.assertNull(returnedId);

        AvatarEntity avatar2 = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars WHERE id = ?",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBlob("image")),
                10);

        Assertions.assertEquals(avatar1.getId(), avatar2.getId()); // This is always true because it is in the where of the query. It is here for clarity.
        Assertions.assertArrayEquals(testBlob2.getBinaryStream().readAllBytes(), avatar2.getImage().getBinaryStream().readAllBytes());
    }

    @Test
    void whenFetchingAvatarById_correctAvatarIsReturned() throws SQLException, IOException {
        jdbcTemplate.update("INSERT INTO infolab.avatars (id, image) VALUES (?, ?), (?, ?)", 10, testBlob, 20, testBlob2);

        int affectedRows1 = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 10 WHERE username = 'user1'");
        int affectedRowsBanana = jdbcTemplate.update("UPDATE infolab.users SET avatar_id = 20 WHERE username = 'banana'");

        Assertions.assertEquals(1, affectedRows1);
        Assertions.assertEquals(1, affectedRowsBanana);

        AvatarEntity avatar1 = avatarRepository.getAvatarById(10).get();

        Assertions.assertArrayEquals(testBlob.getBinaryStream().readAllBytes(), avatar1.getImage().getBinaryStream().readAllBytes());

        AvatarEntity avatarBanana = avatarRepository.getAvatarById(20).get();

        Assertions.assertArrayEquals(testBlob2.getBinaryStream().readAllBytes(), avatarBanana.getImage().getBinaryStream().readAllBytes());
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
