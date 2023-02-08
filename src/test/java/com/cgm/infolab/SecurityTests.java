package com.cgm.infolab;

import com.cgm.infolab.controller.CsrfController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {SecurityTestsController.class})
@Import({SecurityConfiguration.class, CsrfController.class})
@ActiveProfiles("test")
public class SecurityTests {
    @Autowired
    private MockMvc client;

    @Test
    void callToAnUnprotectedRouteEndPointShouldFail() throws Exception {
        client
            .perform(get("/public/test"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void callToIndexShouldSucceed() throws Exception {
        client
            .perform(get("/index.html"))
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
    void callToASecuredRouteEndPointShouldFailWithAnAuthenticatedUserShouldBeOk() throws Exception {
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
    @WithMockUser(username = "user1", password = "password1")
    void postToTheChatEndpointMustBeAuthenticatedWithAKnownUser() throws Exception {
        client
            .perform(post("/chat/test").with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

}
