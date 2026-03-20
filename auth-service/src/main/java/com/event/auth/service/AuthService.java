package com.event.auth.service;

import com.event.auth.dto.LoginRequest;
import com.event.auth.dto.LoginResponse;
import com.event.auth.entity.User;
import com.event.auth.exception.InvalidCredentialsException;
import com.event.auth.exception.UserNotFoundException;
import com.event.auth.repository.UserRepository;
import com.event.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + request.getEmail()));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token);
    }
}
