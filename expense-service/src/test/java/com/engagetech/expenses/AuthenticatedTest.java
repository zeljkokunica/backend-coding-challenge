package com.engagetech.expenses;

import com.engagetech.security.domain.User;
import com.engagetech.security.domain.UserRole;
import com.engagetech.security.dto.UserAuthentication;
import org.junit.Before;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

/**
 * Base class for tests that require authentication.
 */
public abstract class AuthenticatedTest {

    @Before
    public void setAuthentication() {
        User user = new User();
        user.setId(1L);
        user.setPassword("zac");
        user.setUsername("zac");
        UserAuthentication authentication = new UserAuthentication("zac", "zac", Collections.singleton(UserRole.USER), user);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
