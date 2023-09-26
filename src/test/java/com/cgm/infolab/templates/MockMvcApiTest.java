package com.cgm.infolab.templates;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
public abstract class MockMvcApiTest extends BasicApiTest {
    @Autowired
    protected MockMvc mvc;
}
