package com.crud.controller;

import com.crud.confg.JwtUtil;
import com.crud.dto.PasswordLoginRequest;
import com.crud.dto.PendingPolicyResponse;
import com.crud.dto.UserPolicyResponse;
import com.crud.entity.Admin;
import com.crud.entity.ContactForm;
import com.crud.entity.PolicyPlan;
import com.crud.entity.UserPolicy;
import com.crud.enums.Role;
import com.crud.service.AdminService;
import com.crud.service.ContactFormService;
import com.crud.service.UserPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ContactFormService contactFormService; // used to find saved contact form

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
    private UserPolicyResponse mapToResponse(UserPolicy policy) {
        PolicyPlan plan = policy.getPolicyPlan();

        return new UserPolicyResponse(
                policy.getId(),
                policy.getUserId(),
                policy.getUserName(),
                policy.getPolicyStatus(),
                policy.getStartDate(),
                policy.getEndDate(),
                policy.getNominee(),
                policy.getNomineeRelation(),
                policy.getGender(),
                policy.getDob(),
                policy.getAadhaarNumber(),
                policy.getAge(),

                plan.getId(),
                plan.getPolicyName(),
                plan.getPolicyType(),
                plan.getPremium(),
                plan.getCoverage(),
                plan.getDurationInYears(),
                plan.getImageUrl()
        );
    }




    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {

        String lookupEmail = admin.getEmail() == null ? "" : admin.getEmail().trim();
        String lookupPan = admin.getPanNumber() == null ? "" : admin.getPanNumber().trim();

        Optional<ContactForm> contactOpt = Optional.empty();
        if (!lookupEmail.isEmpty()) {
            contactOpt = contactFormService.findByEmail(lookupEmail);
        }
        if (contactOpt.isEmpty() && !lookupPan.isEmpty()) {
            contactOpt = contactFormService.findByPanNumber(lookupPan);
        }

        if (contactOpt.isEmpty()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Admin registration blocked: no ContactForm found for provided email or PAN.");
            body.put("required", Arrays.asList("username (must match ContactForm.name)", "email", "panNumber", "mobileNumber"));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }

        ContactForm cf = contactOpt.get();


        List<String> mismatches = findContactAdminMismatches(cf, admin);
        if (!mismatches.isEmpty()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Admin registration blocked: fields do not exactly match ContactForm.");
            body.put("contactFormId", cf.getId());
            body.put("mismatches", mismatches);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }

        try {
            Admin saved = adminService.registerAdmin(admin);

            // send success email (existing behavior)
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(admin.getEmail());
            message.setSubject("Congratulations! Your registration has been successfully completed, and you’ve been added as an Admin on our platform.");
            message.setText("You can now log in using your registered email address \n\n"
                    + "Email: " + admin.getEmail() + "\n"
                    + "Login at Footer :Agent login (Login link Here)");
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
        admin.setOtpGeneratedAt(LocalDateTime.now()); // <-- save timestamp
        adminService.save(admin);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(admin.getEmail());
        message.setSubject("Your Login OTP");
        message.setText("Your OTP is: " + otp + "\n\nNote: This OTP is valid for 1 minute.");
        mailSender.send(message);

        return ResponseEntity.ok("OTP sent to email");
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Optional<Admin> optionalAdmin = adminService.findByEmail(request.getEmail());
        if (optionalAdmin.isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Admin not found");

        Admin admin = optionalAdmin.get();

        if (admin.getOtp() == null || request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing OTP");
        }

        if (!request.getOtp().equals(admin.getOtp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect OTP");
        }

        LocalDateTime otpTime = admin.getOtpGeneratedAt();
        if (otpTime == null) {
            admin.setOtp(null);
            admin.setOtpGeneratedAt(null);
            adminService.save(admin);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP expired. Please request a new OTP.");
        }

        long minutesElapsed = Duration.between(otpTime, LocalDateTime.now()).toMinutes();
        if (minutesElapsed >= 1) {
            admin.setOtp(null);
            admin.setOtpGeneratedAt(null);
            adminService.save(admin);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP expired. Please request a new OTP.");
        }

        admin.setOtp(null);
        admin.setOtpGeneratedAt(null);
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

        return ResponseEntity.ok(mapToResponse(updatedPolicy));
    }
    @PutMapping("/activate-policy/{policyId}")
    public ResponseEntity<UserPolicyResponse> activatePolicy(@PathVariable Long policyId) {
        UserPolicy updated = adminService.activatePolicy(policyId);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @PutMapping("/reject-policy/{policyId}")
    public ResponseEntity<UserPolicyResponse> rejectPolicy(@PathVariable Long policyId) {
        UserPolicy updated = adminService.rejectPolicy(policyId);
        return ResponseEntity.ok(mapToResponse(updated));
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


    private static List<String> findContactAdminMismatches(ContactForm cf, Admin admin) {
        List<String> mismatches = new ArrayList<>();

        if (cf == null) {
            mismatches.add("No contact form found for the provided identifier.");
            return mismatches;
        }


        String contactName = cf.getName() == null ? "" : cf.getName().trim();
        String adminUsername = admin.getUsername() == null ? "" : admin.getUsername().trim();
        if (!contactName.equals(adminUsername)) {
            mismatches.add("username does not match contact name. contact='" + contactName + "' vs admin='" + adminUsername + "'");
        }


        String contactEmail = cf.getEmail() == null ? "" : cf.getEmail().trim();
        String adminEmail = admin.getEmail() == null ? "" : admin.getEmail().trim();
        if (!contactEmail.equals(adminEmail)) {
            mismatches.add("email does not match. contact='" + contactEmail + "' vs admin='" + adminEmail + "'");
        }


        String contactPan = cf.getPanNumber() == null ? "" : cf.getPanNumber().trim();
        String adminPan = admin.getPanNumber() == null ? "" : admin.getPanNumber().trim();
        if (!contactPan.equals(adminPan)) {
            mismatches.add("panNumber does not match. contact='" + contactPan + "' vs admin='" + adminPan + "'");
        }


        String contactMobile = cf.getMobileNumber() == null ? "" : cf.getMobileNumber().trim();
        String adminMobile = admin.getMobileNumber() == null ? "" : admin.getMobileNumber().trim();
        if (!contactMobile.equals(adminMobile)) {
            mismatches.add("mobileNumber does not match. contact='" + contactMobile + "' vs admin='" + adminMobile + "'");
        }

        return mismatches;
    }
}
