package com.crud.service;

import com.crud.entity.User;

import java.util.List;

public interface UserService {

    public User createUser(User user);

    public User getUserById(Long userId);

    public List<User> getAllUsers();

    public User updateUser(Long userId, User register);

    public void deleteUser(Long userId);

    // forgot password added
    boolean forgotPassword(String email);

    boolean verifyOtp(String email, String otp);

    boolean resetPassword(String email, String newPassword);
}
