package com.engagetech.security.dto;

import com.engagetech.security.domain.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class UserAuthentication extends UsernamePasswordAuthenticationToken {

    private User user;

    public UserAuthentication(Object principal, Object credentials, User user) {
        super(principal, credentials);
        this.user = user;
    }

    public UserAuthentication(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities, User user) {
        super(principal, credentials, authorities);
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
