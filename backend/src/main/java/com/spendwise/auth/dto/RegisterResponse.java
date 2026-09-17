package com.spendwise.auth.dto;

public record RegisterResponse(
        Long id,
        String name,
        String email
) {
}