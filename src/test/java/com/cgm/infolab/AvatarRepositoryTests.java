package com.cgm.infolab;

import com.cgm.infolab.db.ID;
import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.AvatarRepository;
import com.cgm.infolab.db.repository.RowMappers;
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
import java.util.List;

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
    private Blob testBlob;

    @BeforeAll
    void beforeAll() throws SQLException {
        testBlob = new SerialBlob("Test blob data".getBytes());
    }

    @BeforeEach
    void setUp() {
        testDbHelper.clearDbExceptForGeneral();

        testDbHelper.addUsers(user1);
    }

    @Test
    void whenAddingAvatarToDb_itIsSavedCorrectly() throws SQLException, IOException {

        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.add(avatar, user1.getName()));

        AvatarEntity avatarFromDb = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBlob("image")));

        Assertions.assertArrayEquals(testBlob.getBinaryStream().readAllBytes(), avatarFromDb.getImage().getBinaryStream().readAllBytes());
    }

    @Test
    void whenAddingAvatarToDb_itIsCorrectlyAssociatedWithUser() throws SQLException, IOException {
        AvatarEntity avatar = AvatarEntity.of(testBlob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.add(avatar, user1.getName()));

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
            avatarRepository.add(avatar, Username.of("user2"));
        });
    }
}
