package com.cgm.infolab;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.io.IOException;

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
            .addFilterBefore(SecurityConfiguration::authInHeadersOrQueryString, BasicAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions().sameOrigin())
            .build();
    }

    @Bean
    public SecurityFilterChain configureH2(HttpSecurity http) throws Exception{
        return http
            .securityMatcher("/h2-console/**")
            .csrf(AbstractHttpConfigurer::disable)
            .anonymous(withDefaults())
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

    private static void authInHeadersOrQueryString(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        String fromQueryString = request.getParameterMap().getOrDefault("access_token", new String[]{null})[0];
        if(fromQueryString != null){
            HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper((HttpServletRequest) request){
                @Override
                public String getHeader(String name) {
                    if(name.equals(HttpHeaders.AUTHORIZATION)){
                        return String.format("Basic %s", fromQueryString);
                    }
                    return super.getHeader(name);
                }
            };

            filterChain.doFilter(wrappedRequest, response);
        }else {
            filterChain.doFilter(request, response);
        }
    }
}

