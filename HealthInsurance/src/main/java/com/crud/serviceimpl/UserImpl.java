package com.crud.serviceimpl;

import com.crud.entity.User;
import com.crud.enums.Role;
import com.crud.repository.UserRepository;
import com.crud.service.EmailService;
import com.crud.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class UserImpl implements UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);

        return repository.save(user);
    }

    @Override
    public User getUserById(Long userId) {
        return repository.findById(userId).get();
    }

    @Override
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    @Override
    public User updateUser(Long userId, User user) {
        Optional<User> users = repository.findById(userId);
        if (users.isPresent()) {
            User user1 = users.get();
            user1.setUserName(user.getUserName());
            user1.setEmail(user.getEmail());
            user1.setPassword(user.getPassword());

            return repository.save(user1);
        } else {
            return null;
        }
    }

    @Override
    public void deleteUser(Long userId) {
        Optional<User> users = repository.findById(userId);
        if (users.isPresent()) {
            repository.deleteById(userId);
        }
    }


    // FORGOT PASSWORD --------------------------

    @Override
    public boolean forgotPassword(String email) {
        Optional<User> user = repository.findByEmail(email);

        if(user.isPresent()){
            String otp = String.valueOf((int)(Math.random()*900000)+100000);
            User u = user.get();
            u.setOtp(otp);
            u.setOtpGeneratedAt(LocalDateTime.now());
            u.setOtpVerified(false);

            repository.save(u);

            emailService.sendEmail(email, "Forgot Password OTP", "Your OTP is: " + otp);

            return true;
        }
        return false;
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        Optional<User> user = repository.findByEmail(email);

        if(user.isPresent() && otp.equals(user.get().getOtp())){
            User u = user.get();
            u.setOtpVerified(true);
            repository.save(u);
            return true;
        }

        return false;
    }

    @Override
    public boolean resetPassword(String email, String password) {
        Optional<User> user = repository.findByEmail(email);

        if(user.isPresent() && user.get().isOtpVerified()){
            User u = user.get();
            u.setPassword(passwordEncoder.encode(password));
            u.setOtp(null);
            u.setOtpVerified(false);
            repository.save(u);

            return true;
        }

        return false;
    }
}
