package com.cgm.infolab.templates;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/**
 * When using this class override the setup method and add @BeforeAll annotation
 */
@AutoConfigureMockMvc
public abstract class MockMvcApiTestTemplate extends BasicApiTestTemplate {
    @Autowired
    protected MockMvc mvc;
}
