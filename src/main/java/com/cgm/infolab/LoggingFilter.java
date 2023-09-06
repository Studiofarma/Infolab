package com.cgm.infolab;

import jakarta.servlet.*;
import org.apache.logging.log4j.ThreadContext;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {

        ThreadContext.put("request_id", servletRequest.getRequestId());

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
