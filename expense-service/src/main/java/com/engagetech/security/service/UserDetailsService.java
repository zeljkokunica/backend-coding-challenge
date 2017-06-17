package com.engagetech.security.service;

import com.engagetech.security.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    @Autowired
    private UserService userService;

    @Override
    public UserDetails loadUserByUsername(final String login) {
        if (login == null) {
            return null;
        }
        String lowercaseLogin = login.toLowerCase();
        User user = userService.findByUsername(login);
        return new org.springframework.security.core.userdetails.User(
                lowercaseLogin,
                user.getPassword(),
                Collections.emptySet());
    }

}
