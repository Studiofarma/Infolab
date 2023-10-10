package com.cgm.infolab.templates;

import com.cgm.infolab.ProfilesConstants;
import com.cgm.infolab.helper.TestApiHelper;
import com.cgm.infolab.helper.TestDbHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

/**
 * When using this class override the setup method and add @BeforeAll annotation
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({ProfilesConstants.TEST})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BasicApiTestTemplate {
    @Autowired
    protected TestDbHelper testDbHelper;
    @Autowired
    protected TestApiHelper testApiHelper;
    @Autowired
    protected TestRestTemplate testRestTemplate;

    @BeforeAll
    protected void setUpAll() {
        testDbHelper.clearDb();
    }
}
