package com.crud.controller;

import com.crud.confg.JwtUtil;
import com.crud.dto.PasswordLoginRequest;
import com.crud.dto.PendingPolicyResponse;
import com.crud.dto.UserPolicyResponse;
import com.crud.entity.Admin;
import com.crud.entity.UserPolicy;
import com.crud.enums.Role;
import com.crud.service.AdminService;
import com.crud.service.UserPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserPolicyService userPolicyService;

    @Autowired
    private PasswordEncoder passwordEncoder;


    public static class LoginRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }


    public static class VerifyOtpRequest {
        private String email;
        private String otp;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {
        try {
            Admin saved = adminService.registerAdmin(admin);


            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(admin.getEmail());
            message.setSubject("Congratulations! Your registration has been successfully completed, and you’ve been added as an Admin on our platform.");
            message.setText("You can now log in using your registered email address by clicking the link below:\n\n"
                    + "Email: " + admin.getEmail() + "\n"
                    + "Login URL: http://your-app-url/login  Login Here"); // Replace with actual login URL
            mailSender.send(message);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody PasswordLoginRequest request) {
        Optional<Admin> optionalAdmin = adminService.findByEmail(request.getEmail());
        if (optionalAdmin.isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Admin not found");

        Admin admin = optionalAdmin.get();


        if (admin.getRole() == Role.SUPER_ADMIN) {
            if (admin.getPassword() == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }

            String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole());
            response.put("id", admin.getId());
            response.put("username", admin.getUsername());

            return ResponseEntity.ok(response);
        }


        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        admin.setOtp(otp);
        adminService.save(admin);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(admin.getEmail());
        message.setSubject("Your Login OTP");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);

        return ResponseEntity.ok("OTP sent to email");
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Optional<Admin> optionalAdmin = adminService.findByEmail(request.getEmail());
        if (optionalAdmin.isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Admin not found");

        Admin admin = optionalAdmin.get();

        if (admin.getOtp() == null || request.getOtp() == null || !request.getOtp().equals(admin.getOtp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
        }

        java.time.LocalDateTime otpTime = admin.getOtpGeneratedAt();
        if (otpTime == null || otpTime.plusMinutes(1).isBefore(java.time.LocalDateTime.now())) {

            admin.setOtpGeneratedAt(null);
            adminService.save(admin);

        }

        adminService.save(admin);
        String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", admin.getEmail());
        response.put("role", admin.getRole());
        response.put("id", admin.getId());
        response.put("username", admin.getUsername());

        return ResponseEntity.ok(response);
    }


    @GetMapping("/all")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }


    @GetMapping("/{adminId}")
    public ResponseEntity<?> getAdminById(@PathVariable Long adminId) {
        Optional<Admin> optionalAdmin = adminService.findById(adminId);
        if (optionalAdmin.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        return ResponseEntity.ok(optionalAdmin.get());
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Admin updatedAdmin) {
        Optional<Admin> optionalAdmin = adminService.findById(id);
        if (optionalAdmin.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");

        Admin existingAdmin = optionalAdmin.get();
        existingAdmin.setUsername(updatedAdmin.getUsername());
        existingAdmin.setEmail(updatedAdmin.getEmail());
        existingAdmin.setPanNumber(updatedAdmin.getPanNumber());
        existingAdmin.setMobileNumber(updatedAdmin.getMobileNumber());
        existingAdmin.setRole(updatedAdmin.getRole());

        Admin savedAdmin = adminService.save(existingAdmin);
        return ResponseEntity.ok(savedAdmin);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        Optional<Admin> optionalAdmin = adminService.findById(id);
        if (optionalAdmin.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        adminService.deleteById(id);
        return ResponseEntity.ok("Admin deleted successfully");
    }


    @PutMapping("/update-nominee/{policyId}")
    public ResponseEntity<UserPolicyResponse> updateNomineeByAdmin(
            @PathVariable Long policyId,
            @RequestBody Map<String, String> nomineeUpdate) {

        String nominee = nomineeUpdate.get("nominee");
        String nomineeRelation = nomineeUpdate.get("nomineeRelation");

        UserPolicy updatedPolicy = userPolicyService.updateNomineeDetails(policyId, nominee, nomineeRelation);

        UserPolicyResponse response = new UserPolicyResponse(
                updatedPolicy.getId(),
                updatedPolicy.getUserId(),
                updatedPolicy.getPolicyStatus(),
                updatedPolicy.getStartDate(),
                updatedPolicy.getEndDate(),
                updatedPolicy.getNominee(),
                updatedPolicy.getNomineeRelation()
        );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/activate-policy/{policyId}")
    public ResponseEntity<UserPolicyResponse> activatePolicy(@PathVariable Long policyId) {
        UserPolicy updated = adminService.activatePolicy(policyId);

        UserPolicyResponse response = new UserPolicyResponse(
                updated.getId(),
                updated.getUserId(),
                updated.getPolicyStatus(),
                updated.getStartDate(),
                updated.getEndDate(),
                updated.getNominee(),
                updated.getNomineeRelation()
        );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/reject-policy/{policyId}")
    public ResponseEntity<UserPolicyResponse> rejectPolicy(@PathVariable Long policyId) {
        UserPolicy updated = adminService.rejectPolicy(policyId);

        UserPolicyResponse response = new UserPolicyResponse(
                updated.getId(),
                updated.getUserId(),
                updated.getPolicyStatus(),
                updated.getStartDate(),
                updated.getEndDate(),
                updated.getNominee(),
                updated.getNomineeRelation()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-policies/{adminId}")
    public ResponseEntity<?> getPendingPoliciesByAdminId(@PathVariable Long adminId) {
        List<UserPolicy> pendingPolicies = userPolicyService.getPendingPoliciesByAdminId(adminId);
        if (pendingPolicies.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No pending user policies found for this admin.");
        }

        return ResponseEntity.ok(pendingPolicies);
    }

    @GetMapping("/active-policies/{adminId}")
    public ResponseEntity<?> getActivePoliciesByAdminId(@PathVariable Long adminId) {
        List<UserPolicy> activePolicies = userPolicyService.getActivePoliciesByAdminId(adminId);

        if (activePolicies.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No active policies found for this admin.");
        }

        return ResponseEntity.ok(activePolicies);
    }



    @Scheduled(cron = "0 0 0 * * ?")
    public void expirePolicies() {
        adminService.expireExpiredPolicies();
    }
}
