package com.cgm.infolab;

import com.cgm.infolab.configuration.TestSecurityConfiguration;
import com.cgm.infolab.controller.CsrfController;
import com.cgm.infolab.controller.SecurityTestsController;
import com.cgm.infolab.helper.TestJwtHelper;
import org.apache.tomcat.util.codec.binary.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// IMPORTANT NOTE: There is not any test for h2-console endpoint because it would be misleading since it would pass even if
//  the h2-console was not accessible. For some reason the test activated the expected security filter, while the
//  actual h2 requests do not.

@WebMvcTest(controllers = {SecurityTestsController.class})
@Import({SecurityConfiguration.class, CsrfController.class, TestSecurityConfiguration.class})
@ActiveProfiles(ProfilesConstants.TEST)
public class SecurityTests {
    @Autowired
    private MockMvc client;

    private final TestJwtHelper testJwtHelper = new TestJwtHelper();

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

    @Test
    void getProtectedEndpointWithQueryStringBasicAuthIsOk() throws Exception {
        String encodedAuth = Base64.encodeBase64String("%s:%s".formatted("user1", "password1").getBytes());
        client
                .perform(get("/chat/test?basic=%s".formatted(encodedAuth)))
                .andExpect(status().isOk());
    }

    @Test
    void getProtectedEndpointWithQueryStringJwtIsOk() throws Exception {
        Jwt jwt = testJwtHelper.generateToken("test", "user1");
        client
                .perform(get("/chat/test?access_token=%s".formatted(jwt.getTokenValue())))
                .andExpect(status().isOk());
    }
}
