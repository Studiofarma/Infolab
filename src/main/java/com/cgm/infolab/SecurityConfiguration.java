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
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.DefaultCsrfToken;

import java.io.IOException;
import java.util.Enumeration;

import static java.util.Collections.enumeration;
import static java.util.Collections.singleton;

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
            .csrf(csrf -> csrf
                .csrfTokenRequestHandler(requestHandler))
            .csrf()
            .and()
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/**").authenticated()
                .requestMatchers("/chat/**").authenticated()
                .requestMatchers("/chat").authenticated()
                .requestMatchers("/csrf").authenticated()
            )
            .addFilterBefore(SecurityConfiguration::authInHeadersOrQueryString, BasicAuthenticationFilter.class)
            .httpBasic()
            .and()
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/*").permitAll()
                .requestMatchers("/css/**").permitAll()
                .requestMatchers("/js/**").permitAll()
            )
            .anonymous()
            .and()
            .build();
    }

    @Bean
    public UserDetailsManager users(){
        UserDetails user1 = User
            .withUsername("user1")
            .password(String.format("{noop}%s", "password1"))
            .roles("user")
            .build()
        ;
        return new InMemoryUserDetailsManager(user1);
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

