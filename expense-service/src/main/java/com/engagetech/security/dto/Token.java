package com.engagetech.security.dto;

public class Token {
    private String token;
    private long expires;
    private String message;

    public Token(String token, long expires) {
        this.token = token;
        this.expires = expires;
    }

    public String getToken() {
        return token;
    }

    public long getExpires() {
        return expires;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

}
