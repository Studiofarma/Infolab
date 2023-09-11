package com.cgm.infolab;

import com.cgm.infolab.controller.CsrfController;
import com.cgm.infolab.helper.TestJwtHelper;
import com.nimbusds.jose.JOSEException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.text.ParseException;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {SecurityTestsController.class})
@Import({SecurityConfiguration.class, CsrfController.class, SecurityTestConfiguration.class})
@ActiveProfiles("test")
public class SecurityTests {
    @Autowired
    private MockMvc client;

    private final TestJwtHelper testJwtHelper = new TestJwtHelper();

    public SecurityTests() throws ParseException, JOSEException {
    }

    @Test
    void callToAnUnprotectedRouteEndPointShouldFail() throws Exception {
        client
            .perform(get("/public/test"))
            .andExpect(status().isForbidden());
    }

    @Test
    void callToIndexShouldSucceed() throws Exception {
        client
            .perform(get("/index.html"))
            .andExpect(status().isOk());
        client
            .perform(get("/index2.html"))
            .andExpect(status().isOk());
        client
            .perform(get("/css/index.css"))
            .andExpect(status().isOk());
        client
            .perform(get("/js/index.js"))
            .andExpect(status().isOk());
    }

    @Test
    void callToASecuredRouteEndPointShouldFail() throws Exception {
        client
            .perform(get("/api/test"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void callToASecuredRouteEndPointWithAnAuthenticatedUserShouldBeOk() throws Exception {
        client
            .perform(get("/api/test"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user1", password = "password1")
    void getToTheChatEndpointMustBeAuthenticatedWithAKnownUser() throws Exception {
        client
            .perform(get("/chat/test"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void getCsrfTokenWithUserIsOk() throws Exception {
        client
            .perform(get("/csrf"))
            .andExpect(status().isOk());
    }

    @Test
    void getCsrfTokenWithoutUserShouldFail() throws Exception {
        client
            .perform(get("/csrf"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user1", password = "password1")
    void postToTheChatEndpointMustBeAuthenticatedWithAKnownUserAndUseCsrf() throws Exception {
        client
            .perform(post("/chat/test").with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user1", password = "password1")
    void postToTheChatEndpointWithoutCsrfShouldFail() throws Exception {
        client
            .perform(post("/chat/test"))
            .andExpect(status().isForbidden());
    }

    @Test
    void getToH2WithoutUserShouldBeOk() throws Exception {
        client
            .perform(get("/h2-console/"))
            .andExpect(status().isOk());
    }

    @Test
    void postingToH2WithoutUserShouldBeOk() throws Exception {
        client
            .perform(post("/h2-console/"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user1", password = "password1")
    void whenUsingGetWithAUserICanGetTheUsernameOfThePrincipal() throws Exception {
        client
            .perform(get("/api/user"))
            .andExpect(status().isOk())
            .andExpect(content().string("user1"));
    }

    @Test
    void whenUsingGetWithAJwtICanGetTheUsernameOfThePrincipal() throws Exception {
        Jwt jwt = testJwtHelper.generateToken("test", "user1");
        client
            .perform(get("/api/user").header("Authorization", "Bearer " + jwt.getTokenValue()))
            .andExpect(status().isOk())
            .andExpect(content().string("user1"));
    }

    @Test
    void whenUsingPostWithAJwtICanGetTheUsernameOfThePrincipal() throws Exception {
        Jwt jwt = testJwtHelper.generateToken("test", "user1");
        client
            .perform(post("/api/user").header("Authorization", "Bearer " + jwt.getTokenValue()))
            .andExpect(status().isOk())
            .andExpect(content().string("user1"));
    }

    @Test
    @WithMockUser
    void whenThrowingBadRequestItShouldReturnBadRequest() throws Exception {
        client
            .perform(get("/api/badrequest"))
            .andExpect(status().isBadRequest());
    }
}
