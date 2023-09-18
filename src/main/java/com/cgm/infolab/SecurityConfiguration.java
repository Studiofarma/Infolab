package com.cgm.infolab;

import com.cgm.infolab.helper.TestJwtHelper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.io.IOException;
import java.util.function.Supplier;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSocketSecurity
public class SecurityConfiguration {

    @Bean
    AuthorizationManager<Message<?>> messageAuthorizationManager(MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        return messages
            .nullDestMatcher().authenticated()
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/topic/**").authenticated()
            .simpSubscribeDestMatchers("/queue/**")
                .access((authentication, object) -> {
                    boolean isAuthenticated = authentication.get().isAuthenticated();
//                    boolean equals = object.getMessage().getHeaders().get("simpDestination").toString().endsWith(PrincipalUtils.getUsername(authentication.get()));
                    return new AuthorizationDecision(isAuthenticated);
                })
            .simpSubscribeDestMatchers("/user/**").authenticated()
            .anyMessage().denyAll()
            .build();
    }

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception{
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);
        return http
            .securityMatcher(
                "/api/**",
                "/chat/**",
                "/chat",
                "/error",
                "/csrf"
            )
            .csrf(csrf -> csrf
                .csrfTokenRequestHandler(requestHandler)
            )
            .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
            .httpBasic(withDefaults())
            .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt)
            .addFilterBefore(SecurityConfiguration::authInHeadersOrQueryStringBasic, BasicAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions().sameOrigin())
            .build();
    }

    @Bean
    public SecurityFilterChain configureH2(HttpSecurity http) throws Exception{
        return http
            .securityMatcher("/*", "/h2-console/**")
            .csrf(AbstractHttpConfigurer::disable)
            .anonymous(withDefaults())
            .headers(httpSecurityHeadersConfigurer -> httpSecurityHeadersConfigurer.frameOptions().sameOrigin())
            .build();
    }

    @Bean
    public SecurityFilterChain configureAssets(HttpSecurity http) throws Exception{
        return http
            .securityMatcher(
                "/*",
                "/css/**",
                "/js/**"
            )
            .anonymous(withDefaults())
            .build();
    }

    @Bean
    public SecurityFilterChain configureUnprotected(HttpSecurity http) throws Exception{
        return http
            .authorizeHttpRequests(authz -> authz.anyRequest().denyAll())
            .build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${jwk.seturi.hostname}") String hostname, @Value("${jwk.seturi.endpoint}") String endpoint) {
        return jwtDecoder(() -> NimbusJwtDecoder.withJwkSetUri(hostname + endpoint).build());
    }

    @Bean
    @Primary
    @Conditional(IsDevOrTestCondition.class)
    JwtDecoder testJwtDecoder() {
        return jwtDecoder(() -> NimbusJwtDecoder.withPublicKey(new TestJwtHelper().getPublicKey()).build());
    }

    public static NimbusJwtDecoder jwtDecoder(Supplier<NimbusJwtDecoder> decoderFn) {
        NimbusJwtDecoder jwtDecoder = decoderFn.get();
        jwtDecoder.setClaimSetConverter(new UsernameSubClaimAdapter());
        return jwtDecoder;
    }

    @Bean
    public DefaultBearerTokenResolver bearerTokenResolver(){
        DefaultBearerTokenResolver resolver = new DefaultBearerTokenResolver();
        resolver.setAllowUriQueryParameter(true);
        return resolver;
    }

    @Bean
    @Conditional(IsDevOrTestCondition.class)
    public UserDetailsManager users(){
        UserDetails user1 = User
                .withUsername("user1")
                .password(String.format("{noop}%s", "password1"))
                .roles("user")
                .build();
        UserDetails user2 = User
                .withUsername("user2")
                .password(String.format("{noop}%s", "password2"))
                .roles("user")
                .build();
        UserDetails user5 = User
                .withUsername("davide.giudici")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        UserDetails user6 = User
                .withUsername("mattia.pedersoli")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        UserDetails user7 = User
                .withUsername("luca.minini")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        UserDetails user8 = User
                .withUsername("Lorenzo")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        UserDetails user9 = User
                .withUsername("Daniele")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        UserDetails user10 = User
                .withUsername("Davide")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        UserDetails user11 = User
                .withUsername("Mirko")
                .password(String.format("{noop}%s", "password"))
                .roles("user")
                .build();
        return new InMemoryUserDetailsManager(user1, user2, user5, user6, user7, user8, user9, user10, user11);
    }

    private static void authInHeadersOrQueryStringBasic(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        Pair<String, String> fromQueryString = getFromQueryString(request, "basic");

        if(fromQueryString.getValue() != null){
            HttpServletRequestWrapper wrappedRequest = getHttpServletRequestWrapper((HttpServletRequest) request, fromQueryString);

            filterChain.doFilter(wrappedRequest, response);
        }else {
            filterChain.doFilter(request, response);
        }
    }

    private static HttpServletRequestWrapper getHttpServletRequestWrapper(HttpServletRequest request, Pair<String, String> fromQueryString) {
        String key = fromQueryString.getKey();
        String value = fromQueryString.getValue();
        return new HttpServletRequestWrapper(request){
            @Override
            public String getHeader(String name) {
                if(name.equals(HttpHeaders.AUTHORIZATION)){
                    String authHeader = String.format(key.equals("basic") ? "Basic %s" : "Bearer %s", value);
                    System.out.println("From filter1: " + authHeader);
                    return authHeader;
                }
                return super.getHeader(name);
            }
        };
    }

    private static Pair<String, String> getFromQueryString(ServletRequest request, String key) {
        return Pair.of(key, request.getParameterMap().getOrDefault(key, new String[]{null})[0]);
    }
}

