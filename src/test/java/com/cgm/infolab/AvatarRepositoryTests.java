package com.cgm.infolab;

import com.cgm.infolab.db.model.AvatarEntity;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.AvatarRepository;
import com.cgm.infolab.helper.TestDbHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
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
    private TestDbHelper testDbHelper;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private UserEntity user1 = UserEntity.of(Username.of("user1"), "user1 desc");

    @BeforeAll
    void setUp() {
        testDbHelper.clearDbExceptForGeneral();

        testDbHelper.addUsers(user1);
    }

    @Test
    void whenAddingAvatarToDb_itIsSavedCorrectly() throws SQLException, IOException {
        byte[] data = "Test blob data".getBytes();

        Blob blob = new SerialBlob(data);

        AvatarEntity avatar = AvatarEntity.of(blob);

        Assertions.assertDoesNotThrow(() -> avatarRepository.add(avatar));

        AvatarEntity avatarFromDb = jdbcTemplate.queryForObject("SELECT * FROM infolab.avatars",
                (rs, rowNum) -> AvatarEntity.of(rs.getLong("id"), rs.getBlob("image")));

        Assertions.assertArrayEquals(blob.getBinaryStream().readAllBytes(), avatarFromDb.getImage().getBinaryStream().readAllBytes());
    }
}
