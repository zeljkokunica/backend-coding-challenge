package com.engagetech.security.config;

import com.engagetech.security.service.TokenProvider;
import com.engagetech.security.service.UserService;
import com.engagetech.security.dto.UserAuthentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

/**
 * Filters incoming requests and installs a Spring Security principal
 * if a header corresponding to a valid user is found.
 */
public class XAuthTokenFilter extends GenericFilterBean {

    private final static String XAUTH_TOKEN_HEADER_NAME = "Authorization";

    private UserDetailsService detailsService;

    private TokenProvider tokenProvider;

    private UserService userService;

    public XAuthTokenFilter(UserDetailsService detailsService, TokenProvider tokenProvider, UserService userService) {
        this.detailsService = detailsService;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        String authToken = httpServletRequest.getHeader(XAUTH_TOKEN_HEADER_NAME);
        if (StringUtils.hasText(authToken)) {
            String username = this.tokenProvider.getUserNameFromToken(authToken);
            if (username != null) {
                UserDetails details = this.detailsService.loadUserByUsername(username);
                if (this.tokenProvider.validateToken(authToken, details)) {
                    UserAuthentication token = new UserAuthentication(details, details.getPassword(), details.getAuthorities(), userService.findByUsername(username));
                    SecurityContextHolder.getContext().setAuthentication(token);
                }
            }
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }
}
