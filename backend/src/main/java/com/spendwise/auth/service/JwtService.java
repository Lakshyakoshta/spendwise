package com.spendwise.auth.service;

import com.spendwise.auth.security.JwtConfig;
import com.spendwise.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final long TOKEN_EXPIRATION_SECONDS = 3600;

    private final SecretKey signingKey;

    public JwtService(JwtConfig jwtConfig) {

        this.signingKey = Keys.hmacShaKeyFor(
                jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(User user) {

        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(TOKEN_EXPIRATION_SECONDS);

        return Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(signingKey)
                .compact();
    }
}