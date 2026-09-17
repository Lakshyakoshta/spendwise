package com.spendwise.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    private final String secret;

    public JwtConfig(
            @Value("${jwt.secret}") String secret) {

        this.secret = secret;
    }

    public String getSecret() {
        return secret;
    }
}