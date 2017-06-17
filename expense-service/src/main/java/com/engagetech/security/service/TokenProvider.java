package com.engagetech.security.service;

import com.engagetech.security.dto.Token;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class TokenProvider {
    private final int tokenValidity = 10000;

    private Map<String, Token> tokens = new HashMap<>();

    public TokenProvider() {
        Token token = new Token("123456", tokenValidity);
        tokens.put("zac", token);
    }

    public Token createToken(UserDetails userDetails) {
        long expires = System.currentTimeMillis() + 1000L * tokenValidity;
        String tokenValue = UUID.randomUUID().toString();
        Token token = new Token(tokenValue, expires);
        tokens.put(userDetails.getUsername(), token);
        return token;
    }

    public String getUserNameFromToken(String authToken) {
        if (null == authToken) {
            return null;
        }
        for (Map.Entry<String, Token> tokenEnty : tokens.entrySet()) {
            if (tokenEnty.getValue().getToken().equals(authToken)) {
                return tokenEnty.getKey();
            }
        }
        return null;
    }

    public boolean validateToken(String authToken, UserDetails userDetails) {
        if (authToken == null) {
            return false;
        }
        Token token = tokens.get(userDetails.getUsername());
        if (token == null) {
            return false;
        }
        return authToken.equals(token.getToken());
    }
}
