package com.event.auth.service;

import com.event.auth.dto.UpdateProfileRequest;
import com.event.auth.dto.UserRequest;
import com.event.auth.dto.UserResponse;
import com.event.auth.entity.Role;
import com.event.auth.entity.User;
import com.event.auth.exception.UserNotFoundException;
import com.event.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserRequest request, Role role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public UserResponse getProfile(String email) {
        User user = getUserByEmail(email);
        return mapToResponse(user);
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        user.setName(request.getName());

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + email));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
