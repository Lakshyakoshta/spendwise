package com.spendwise.auth.service;

import com.spendwise.auth.dto.LoginRequest;
import com.spendwise.auth.dto.LoginResponse;
import com.spendwise.auth.dto.RegisterRequest;
import com.spendwise.auth.dto.RegisterResponse;
import com.spendwise.user.entity.User;
import com.spendwise.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(
                request.name(),
                request.email(),
                passwordHash,
                Instant.now()
        );

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash())) {

            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }
}