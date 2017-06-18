package com.engagetech.security.service;

import com.engagetech.security.repository.UserRepository;
import com.engagetech.security.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByUsername(String login) {
        return userRepository.findByUsername(login);
    }
}
