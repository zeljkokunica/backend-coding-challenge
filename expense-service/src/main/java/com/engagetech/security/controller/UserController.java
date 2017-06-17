package com.engagetech.security.controller;

import com.engagetech.security.service.TokenProvider;
import com.engagetech.security.service.UserDetailsService;
import com.engagetech.security.dto.Token;
import com.engagetech.security.dto.UserLoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "/app/user", produces = {org.springframework.http.MediaType.APPLICATION_JSON_VALUE})
public class UserController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private TokenProvider tokenProvider;

    @RequestMapping(value = "", method = RequestMethod.POST)
    public ResponseEntity<Map<String, String>> login(@RequestBody UserLoginRequest user) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());
        Authentication authentication = authenticationManager.authenticate(token);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails details = userDetailsService.loadUserByUsername(user.getUsername());
        Token responseToken = tokenProvider.createToken(details);
        Map<String, String> result = new HashMap<>();
        result.put("token", responseToken.getToken());
        return new ResponseEntity(result, HttpStatus.OK);
    }

}
