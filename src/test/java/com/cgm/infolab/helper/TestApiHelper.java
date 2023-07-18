package com.cgm.infolab.helper;

import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;

@Component
public class TestApiHelper {

    private final TestRestTemplate testRestTemplate;

    public TestApiHelper(TestRestTemplate testRestTemplate) {
        this.testRestTemplate = testRestTemplate;
    }

    public List<LinkedHashMap> getFromApi(String url) {
        ResponseEntity<List> response = testRestTemplate.withBasicAuth(
                "user1", "password1").getForEntity(url,
                List.class);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());

        return (List<LinkedHashMap>) response.getBody();
    }
}
