package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.db.model.enumeration.ThemeEnum;
import com.cgm.infolab.db.model.enumeration.UserStatusEnum;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class UserApiTests {
    @Autowired
    TestDbHelper testDbHelper;
    @Autowired
    TestApiHelper testApiHelper;
    @Autowired
    TestRestTemplate testRestTemplate;

    public UserEntity[] users =
            {UserEntity.of(0, Username.of("user0"), "user0 desc"),
                    UserEntity.of(1, Username.of("user1"), "user1 desc"),
                    UserEntity.of(2, Username.of("user2"), "user2 desc"),
                    UserEntity.of(3, Username.of("user3"), "user3 desc"),
                    UserEntity.of(4, Username.of("user4"), "user4 desc"),
                    UserEntity.of(5, Username.of("user5"), "user5 desc"),
                    UserEntity.of(6, Username.of("user6"), "user6 desc"),
            };

    @BeforeAll
    void beforeAll() {
        testDbHelper.clearDbExceptForGeneral();

        Arrays.stream(users)
                .toList()
                .forEach(
                        userEntity -> testDbHelper.insertCustomUser(
                                userEntity.getId(),
                                userEntity.getName().value(),
                                userEntity.getDescription(),
                                UserStatusEnum.OFFLINE,
                                ThemeEnum.LIGHT
                        )
                );
    }

    @Test
    void whenFetchingANotExistingUsername_emptyArrayIsReturned() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/users?usernames=user7");

        Assertions.assertEquals(0, responseBody.size());
    }

    @Test
    void whenFetchingOneUsername_correctUserIsReturned_asList() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/users?usernames=user1");

        Assertions.assertEquals(1, responseBody.size());
        Assertions.assertEquals(1, responseBody.get(0).get("id"));
        Assertions.assertEquals("user1", responseBody.get(0).get("name"));
        Assertions.assertEquals("user1 desc", responseBody.get(0).get("description"));

        List<LinkedHashMap> responseBody2 = testApiHelper.getFromApiForUser1("/api/users?usernames=user3");

        Assertions.assertEquals(1, responseBody2.size());
        Assertions.assertEquals(3, responseBody2.get(0).get("id"));
        Assertions.assertEquals("user3", responseBody2.get(0).get("name"));
        Assertions.assertEquals("user3 desc", responseBody2.get(0).get("description"));
    }

    @Test
    void whenFetchingMultipleUsernames_correctUsersAreReturned() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/users?usernames=user0,user4,user5,");

        Assertions.assertEquals(3, responseBody.size());

        Assertions.assertEquals(0, responseBody.get(0).get("id"));
        Assertions.assertEquals("user0", responseBody.get(0).get("name"));
        Assertions.assertEquals("user0 desc", responseBody.get(0).get("description"));

        Assertions.assertEquals(4, responseBody.get(1).get("id"));
        Assertions.assertEquals("user4", responseBody.get(1).get("name"));
        Assertions.assertEquals("user4 desc", responseBody.get(1).get("description"));

        Assertions.assertEquals(5, responseBody.get(2).get("id"));
        Assertions.assertEquals("user5", responseBody.get(2).get("name"));
        Assertions.assertEquals("user5 desc", responseBody.get(2).get("description"));
    }

    @Test
    void whenFetchingWithoutQueryParam_errorIsThrown() {
        ResponseEntity<Object> response = testRestTemplate
                .withBasicAuth("user1", "password1")
                .getForEntity("/api/users", Object.class);

        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void whenFetchingWithEmptyQueryParam_emptyListIsReturned() {
        List<LinkedHashMap> responseBody = testApiHelper.getFromApiForUser1("/api/users?usernames=");

        Assertions.assertEquals(0, responseBody.size());
    }
}
