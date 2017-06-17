package com.engagetech.security.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class Http401UnauthorizedEntryPoint implements AuthenticationEntryPoint {

    private final Logger log = LoggerFactory.getLogger(Http401UnauthorizedEntryPoint.class);

    /**
     * Always returns a 401 error code to the client.
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException,
            ServletException {
        log.debug("Pre-authenticated entry point called. Rejecting access");
        String message = "no info";
        if (authException != null) {
            if (authException.getCause() != null) {
                message = authException.getCause().getMessage();
            } else {
                message = authException.getMessage();
            }
        }
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "x-requested-with,x-auth-token,x-auth-company-id,x-locale,crossOrigin");
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, message);
    }
}
