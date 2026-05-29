package com.example.todo.interfaces;

import com.example.todo.dto.AuthRequest;
import com.example.todo.dto.AuthResponse;
import com.example.todo.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
}
