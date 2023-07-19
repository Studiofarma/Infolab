package com.cgm.infolab.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONArray;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Component
public class TestApiHelper {

    private final TestRestTemplate testRestTemplate;

    public TestApiHelper(TestRestTemplate testRestTemplate) {
        this.testRestTemplate = testRestTemplate;
    }

    public List<LinkedHashMap> getFromApiForUser1(String url) {
        ResponseEntity<List> response = testRestTemplate
                .withBasicAuth("user1", "password1")
                .getForEntity(url, List.class);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());

        return (List<LinkedHashMap>) response.getBody();
    }
}
