package com.crud.serviceimpl;

import com.crud.entity.User;
import com.crud.repository.UserRepository;
import com.crud.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;
import java.util.Random;

@Service
public class AuthServiceimpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;


    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!new BCryptPasswordEncoder().matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String otp = String.valueOf(new Random().nextInt(899999) + 100000); // 6-digit OTP

        user.setOtp(otp);
        user.setOtpVerified(false);
        user.setOtpGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        sendOtpEmail(email, otp);
        return "OTP sent to email";
    }

    public User verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (user.getOtpGeneratedAt() == null ||
                user.getOtpGeneratedAt().plusMinutes(1).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (user.getOtp().equals(otp)) {
            user.setOtpVerified(true);
            userRepository.save(user);
            return user;
        } else {
            throw new RuntimeException("Invalid OTP");
        }
    }

    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Login OTP");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);
    }
}
