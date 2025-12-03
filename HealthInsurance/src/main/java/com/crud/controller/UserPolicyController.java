package com.crud.controller;

import com.crud.dto.PurchaseRequest;
import com.crud.dto.UserPolicyResponse;
import com.crud.entity.PolicyPlan;
import com.crud.entity.UserPolicy;
import com.crud.service.PolicyPlanservice;
import com.crud.service.UserPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-policy")
public class UserPolicyController {

    @Autowired
    private PolicyPlanservice policyPlanService;

    @Autowired
    private UserPolicyService userPolicyService;

    // ✅ ADD THIS METHOD HERE (before any @GetMapping / @PostMapping)
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


    @PostMapping("/purchase")
    public ResponseEntity<UserPolicyResponse> purchasePolicy(@RequestBody PurchaseRequest request) {
        UserPolicy userPolicy = userPolicyService.purchasePolicy(request);

        PolicyPlan plan = userPolicy.getPolicyPlan(); // get policy details

        UserPolicyResponse response = new UserPolicyResponse(
                userPolicy.getId(),
                userPolicy.getUserId(),
                userPolicy.getUserName(),
                userPolicy.getPolicyStatus(),
                userPolicy.getStartDate(),
                userPolicy.getEndDate(),
                userPolicy.getNominee(),
                userPolicy.getNomineeRelation(),
                userPolicy.getGender(),
                userPolicy.getDob(),
                userPolicy.getAadhaarNumber(),
                userPolicy.getAge(),

                plan.getId(),
                plan.getPolicyName(),
                plan.getPolicyType(),
                plan.getPremium(),
                plan.getCoverage(),
                plan.getDurationInYears(),
                plan.getImageUrl()

        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserPolicyResponse>> getUserPolicies(@PathVariable Long userId) {
        List<UserPolicyResponse> policies = userPolicyService.getAllPoliciesByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(policies);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserPolicyResponse>> getAllPolicies() {
        List<UserPolicyResponse> policies = userPolicyService.getAllPolicies()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(policies);
    }


    @PutMapping("/update/{policyId}")
    public ResponseEntity<UserPolicyResponse> updatePolicy(
            @PathVariable Long policyId,
            @RequestBody UserPolicy updatedPolicy) {

        UserPolicy policy = userPolicyService.updatePolicy(policyId, updatedPolicy);

        return ResponseEntity.ok(mapToResponse(policy));
    }


    @DeleteMapping("/delete/{policyId}")
    public ResponseEntity<String> deletePolicy(@PathVariable Long policyId) {
        userPolicyService.deletePolicy(policyId);
        return ResponseEntity.ok("Policy with ID " + policyId + " deleted successfully.");
    }


}
