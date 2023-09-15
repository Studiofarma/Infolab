package com.cgm.infolab;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

import java.util.Arrays;
import java.util.List;

public class IsDevOrTestCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment  env = context.getEnvironment();
        List<String> profiles = Arrays.asList(env.getActiveProfiles());
        return profiles.contains(ProfilesConstants.DEV) || profiles.contains(ProfilesConstants.TEST);
    }
}
