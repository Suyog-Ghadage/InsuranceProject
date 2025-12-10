package com.crud.controller;

import com.crud.dto.ForgotPasswordRequest;
import com.crud.dto.ResetPasswordRequest;
import com.crud.dto.VerifyOtpRequest;
import com.crud.entity.User;
import com.crud.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/user")
public class UserController {

    @Autowired
    private UserService service;


    @PostMapping("/save")
    public User creteUser(@RequestBody User user){
        return service.createUser(user);
    }

    @GetMapping()
    public List<User> getAllUsers(){
        return service.getAllUsers();
    }

    @GetMapping("{userId}")
    public User getUserById(@PathVariable Long userId){
        return service.getUserById(userId);
    }

    @PutMapping("/update/{userId}")
    public User updateUser(@PathVariable Long userId, @RequestBody User user){
        return service.updateUser(userId,user);
    }

    @DeleteMapping("delete/{userId}")
    public String deleteUser(@PathVariable Long userId){
        service.deleteUser(userId);
        return "user deleted successfully";
    }


    // ================== FORGOT PASSWORD ===================

    // =============== FORGOT PASSWORD SEND OTP ===============
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request){

        boolean status = service.forgotPassword(request.getEmail());

        if(status){
            return ResponseEntity.ok("OTP Sent to Email");
        }
        return ResponseEntity.badRequest().body("Email not found");
    }


    // =============== VERIFY OTP ==============================
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest request){

        boolean status = service.verifyOtp(request.getEmail(), request.getOtp());

        if(status){
            return ResponseEntity.ok("OTP Verified Successfully");
        }
        return ResponseEntity.badRequest().body("Invalid OTP");
    }


    // =============== RESET PASSWORD ===============
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request){

        boolean status = service.resetPassword(request.getEmail(), request.getNewPassword());

        if(status){
            return ResponseEntity.ok("Password Updated Successfully");
        }
        return ResponseEntity.badRequest().body("OTP Not Verified");
    }

}
