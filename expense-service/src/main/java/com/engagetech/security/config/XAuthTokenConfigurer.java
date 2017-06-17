package com.engagetech.security.config;

import com.engagetech.security.service.TokenProvider;
import com.engagetech.security.service.UserService;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

public class XAuthTokenConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    private TokenProvider tokenProvider;

    private UserDetailsService detailsService;

    private UserService userService;

    public XAuthTokenConfigurer(UserDetailsService detailsService, TokenProvider tokenProvider, UserService userService) {
        this.detailsService = detailsService;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        XAuthTokenFilter customFilter = new XAuthTokenFilter(detailsService, tokenProvider, userService);
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
