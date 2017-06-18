package com.engagetech.security.domain;

import org.springframework.security.core.GrantedAuthority;

public class UserRole implements GrantedAuthority {

    public static final UserRole USER = new UserRole("ROLE_USER");

    private String id;



    public UserRole(String id) {
        this.id = id;
    }

    @Override
    public String getAuthority() {
        return id;
    }
}
