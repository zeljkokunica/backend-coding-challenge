package com.example.demo.repository;

import com.example.demo.domain.User;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

@Repository
public class UserRepository implements InitializingBean {

    private Map<String, User> users = new HashMap<>();

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User findByUsername(String userName) {
        return users.get(userName);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        users.put("rod", new User(1L, "rod", passwordEncoder.encode("rod")));
        users.put("jane", new User(2L,"jane", passwordEncoder.encode("jane")));
        users.put("freddy", new User(3L, "freddy", passwordEncoder.encode("freddy")));
        users.put("zac", new User(4L, "zac", passwordEncoder.encode("zac")));
    }
}
