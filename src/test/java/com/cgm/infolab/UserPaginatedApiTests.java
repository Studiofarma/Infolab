package com.cgm.infolab;

import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestDbHelper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import java.util.LinkedHashMap;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "local"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class UserPaginatedApiTests {

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    TestDbHelper testDbHelper;

    public UserEntity[] users = new UserEntity[30];

    @BeforeAll
    void setUp() {
        testDbHelper.clearDbExceptForGeneral();

        // Users from 'a' to '_' in ascii table. Done so because with numbers the ordering would have made testing troublesome.
        for (int i = 0, c = 65; i < 30; i++, c++) {
            char letter = (char) c;
            users[i] = UserEntity.of(Username.of("user%s".formatted(letter)), "user%s desc".formatted(letter));
        }

        testDbHelper.addUsers(users);
    }

    @Test
    void whenFetching_withoutPageSize_responseIsOf20FirstUsers() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=",
                List.class);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());

        List<Object> responseBody = response.getBody();

        Assertions.assertEquals(30, responseBody.size());
    }

    @Test
    void whenFetching_withPageSize2_responseIsOf2FirstUsers() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=&page[size]=2",
                List.class);

        List<Object> responseBody = response.getBody();

        Assertions.assertEquals(2, responseBody.size());
    }

    @Test
    void whenFetching_withPageSize3_afterUserE_userFAndGAndHAreReturned() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=&page[size]=3&page[after]=userE desc",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(3, responseBody.size());

        Assertions.assertEquals("userF desc", responseBody.get(0).get("description"));
        Assertions.assertEquals("userG desc", responseBody.get(1).get("description"));
        Assertions.assertEquals("userH desc", responseBody.get(2).get("description"));
    }

    @Test
    void whenFetching_withPageSize3_beforeUserE_userBAndCAndDAreReturned() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=&page[size]=3&page[before]=userE desc",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(3, responseBody.size());

        Assertions.assertEquals("userB desc", responseBody.get(0).get("description"));
        Assertions.assertEquals("userC desc", responseBody.get(1).get("description"));
        Assertions.assertEquals("userD desc", responseBody.get(2).get("description"));
    }

    @Test
    void whenFetching_withoutPageSize_afterUserF_usersFromGToZAreReturned() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=&page[after]=userF desc",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(24, responseBody.size());

        for (int i = 0, c = 71; i < 24; i++, c++) {
            char letter = (char) c;
            Assertions.assertEquals("user%s desc".formatted(letter), responseBody.get(i).get("description"));
        }
    }

    @Test
    void whenFetching_withoutPageSize_beforeUserF_usersFromEToAAreReturned() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=&page[before]=userF desc",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(5, responseBody.size());

        for (int i = 0, c = 65; i < 5; i++, c++) {
            char letter = (char) c;
            Assertions.assertEquals("user%s desc".formatted(letter), responseBody.get(i).get("description"));
        }
    }

    @Test
    void whenTryingToFetch_moreThan20Users_20UsersAreReturned() {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity("/api/users?user=&page[size]=22",
                List.class);

        List<LinkedHashMap> responseBody = response.getBody();

        Assertions.assertEquals(20, responseBody.size());
    }
}
