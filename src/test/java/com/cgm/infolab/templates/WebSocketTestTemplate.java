package com.cgm.infolab.templates;

import com.cgm.infolab.ProfilesConstants;
import com.cgm.infolab.configuration.TestSecurityConfiguration;
import com.cgm.infolab.db.model.UserEntity;
import com.cgm.infolab.db.model.Username;
import com.cgm.infolab.helper.TestDbHelper;
import com.cgm.infolab.helper.TestStompHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.messaging.WebSocketStompClient;

/**
 * When using this class override the setup method and add @BeforeAll annotation
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({ProfilesConstants.TEST})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class WebSocketTestTemplate {

    @LocalServerPort
    protected Integer port;
    @Autowired
    protected TestDbHelper testDbHelper;
    @Autowired
    protected TestStompHelper testStompHelper;

    protected WebSocketStompClient websocket;

    protected UserEntity user1 = UserEntity.of(Username.of("user1"));

    // This is here because the @Import annotation does not work
    @TestConfiguration
    public static class SecurityConfiguration extends TestSecurityConfiguration {}

    @BeforeAll
    protected void setUpAll() {
        testDbHelper.clearDb();

        websocket = testStompHelper.initWebsocket();
    }
}
