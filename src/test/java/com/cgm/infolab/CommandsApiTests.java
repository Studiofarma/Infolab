package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.repository.RowMappers;
import com.cgm.infolab.templates.MockMvcApiTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class CommandsApiTests extends MockMvcApiTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private RowMappers rowMappers;

    @Override
    @BeforeEach
    protected void setUp() {
        testDbHelper.clearDbExceptForGeneral();
    }

    @Test
    void whenPostingToCreateUserEndpoint_userGetsActuallyCreated() throws Exception {

        UserEntity user1 = UserEntity.of(Username.of("user1"), "User1 desc");

        Assertions.assertThrows(EmptyResultDataAccessException.class, () -> {
            UserEntity u = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = ?", rowMappers::mapToUserEntity, user1.getName().value());
        });

        postToApiForUser1ExpectingOk("/api/commands/createuser?description=%s".formatted(user1.getDescription()));

        UserEntity userFromDb = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = ?", rowMappers::mapToUserEntity, user1.getName().value());

        Assertions.assertEquals(user1.getName(), userFromDb.getName());
        Assertions.assertEquals(user1.getDescription(), userFromDb.getDescription());
        Assertions.assertEquals(user1.getStatus(), userFromDb.getStatus());
        Assertions.assertEquals(user1.getTheme(), userFromDb.getTheme());
        Assertions.assertEquals(user1.getAvatarId(), userFromDb.getAvatarId());

        // Id is not checked because it is created on entity creation.

        List<UserEntity> users = jdbcTemplate.query("SELECT *, status user_status FROM infolab.users", rowMappers::mapToUserEntity);

        Assertions.assertEquals(1, users.size());
    }

    @Test
    void whenTryingToCreate2TimesUser_withEqualAndDifferentDescriptions_onlyTheFirstTimeIsCreated_andNeverGetsModified() throws Exception {
        UserEntity user1 = UserEntity.of(Username.of("user1"), "User1 desc");

        postToApiForUser1ExpectingOk("/api/commands/createuser?description=%s".formatted(user1.getDescription()));

        UserEntity userFromDb1 = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = ?", rowMappers::mapToUserEntity, user1.getName().value());

        postToApiForUser1ExpectingBadRequest("/api/commands/createuser?description=%s".formatted("Another description"));

        UserEntity userFromDb2 = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = ?", rowMappers::mapToUserEntity, user1.getName().value());

        Assertions.assertEquals(userFromDb1, userFromDb2);

        postToApiForUser1ExpectingBadRequest("/api/commands/createuser?description=%s".formatted(user1.getDescription()));

        UserEntity userFromDb3 = jdbcTemplate.queryForObject("SELECT *, status user_status FROM infolab.users WHERE username = ?", rowMappers::mapToUserEntity, user1.getName().value());

        Assertions.assertEquals(userFromDb1, userFromDb3);
    }

    private void postToApiForUser1ExpectingOk(String url) throws Exception {
        postToApiForUser1(url).andExpect(status().isOk());
    }

    private void postToApiForUser1ExpectingBadRequest(String url) throws Exception {
        postToApiForUser1(url).andExpect(status().isBadRequest());
    }

    private ResultActions postToApiForUser1(String url) throws Exception {
        return mvc.perform(
                post(url)
                        .with(jwt().jwt(jwt -> jwt.subject("user1")))
        );
    }
}
