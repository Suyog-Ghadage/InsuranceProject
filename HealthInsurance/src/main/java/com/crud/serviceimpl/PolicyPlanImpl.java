package com.crud.serviceimpl;

import com.crud.dto.PolicyPlanRequest;
import com.crud.dto.PolicyPlanWithBuyersResponse;
import com.crud.dto.UserDetailsResponse;
import com.crud.entity.Admin;
import com.crud.entity.PolicyPlan;
import com.crud.entity.UserPolicy;
import com.crud.entity.UserProfile;
import com.crud.repository.AdminRepository;
import com.crud.repository.PolicyPlanRepository;
import com.crud.repository.UserPolicyRepository;
import com.crud.repository.UserProfileRepository;
import com.crud.service.PolicyPlanservice;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PolicyPlanImpl implements PolicyPlanservice {

    @Autowired
    private PolicyPlanRepository policyPlanRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;


    private final String uploadDir = System.getProperty("user.home") + "/policy_uploads/";

    @Override
    public PolicyPlan createPlan(PolicyPlanRequest request, Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        PolicyPlan plan = new PolicyPlan();
        plan.setPolicyName(request.getPolicyName());
        plan.setPolicyType(request.getPolicyType());
        plan.setCoverage(request.getCoverage());
        plan.setPremium(request.getPremium());
        plan.setDurationInYears(request.getDurationInYears());
        plan.setAdmin(admin);

        return policyPlanRepository.save(plan);
    }

    @Override
    public PolicyPlan updatePlan(Long planId, PolicyPlanRequest request, Long adminId) {
        PolicyPlan existing = policyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!existing.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Cannot update another admin's policy");
        }

        existing.setPolicyName(request.getPolicyName());
        existing.setPolicyType(request.getPolicyType());
        existing.setCoverage(request.getCoverage());
        existing.setPremium(request.getPremium());
        existing.setDurationInYears(request.getDurationInYears());

        return policyPlanRepository.save(existing);
    }

    @Override
    public void deletePlan(Long planId, Long adminId) {
        PolicyPlan existing = policyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

       /* if (!existing.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Cannot delete another admin's policy");
        }
*/
        policyPlanRepository.delete(existing);
    }

    @Override
    public List<PolicyPlan> getPlansByAdmin(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return policyPlanRepository.findByAdmin(admin);
    }

    @Override
    public List<PolicyPlan> getAllPlans() {
        return policyPlanRepository.findAll();
    }

    @Override
    public PolicyPlan getPlanById(Long planId) {
        return policyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
    }

    @Override
    public PolicyPlan save(PolicyPlan plan) {
        return policyPlanRepository.save(plan);
    }

    // -------------------- FILE UPLOAD METHODS --------------------
    @Override
    public PolicyPlan storePolicyWithImage(MultipartFile file, Long adminId, String policyJson) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        PolicyPlanRequest request = mapper.readValue(policyJson, PolicyPlanRequest.class);

        PolicyPlan plan = createPlan(request, adminId);

        if (file != null && !file.isEmpty()) {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String fullPath = uploadDir + fileName;
            file.transferTo(new File(fullPath));

            plan.setImageUrl(fullPath);
            save(plan);
        }

        return plan;
    }

    @Override
    public PolicyPlan updatePolicyWithImage(Long planId, MultipartFile file, String policyJson, Long adminId) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        PolicyPlanRequest request = mapper.readValue(policyJson, PolicyPlanRequest.class);

        PolicyPlan plan = updatePlan(planId, request, adminId);

        if (file != null && !file.isEmpty()) {
            // delete old file if exists
            if (plan.getImageUrl() != null) {
                File oldFile = new File(plan.getImageUrl());
                if (oldFile.exists()) oldFile.delete();
            }

            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String fullPath = uploadDir + fileName;
            file.transferTo(new File(fullPath));

            plan.setImageUrl(fullPath);
            save(plan);
        }

        return plan;
    }

    @Override
    public PolicyPlanWithBuyersResponse getPolicyPlanWithBuyers(Long planId) {
         PolicyPlan plan = policyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Policy plan not found"));

        List<UserPolicy> userPolicies = userPolicyRepository.findByPolicyPlanId(planId);

        List<UserDetailsResponse> buyers = userPolicies.stream()
                .map(up -> {
                    UserProfile user = userProfileRepository.findById(up.getUserId())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return new UserDetailsResponse(
                            user.getId(),
                            user.getName(),
                            user.getUser().getEmail()
                    );
                })
                .collect(Collectors.toList());

        return new PolicyPlanWithBuyersResponse(
                plan.getId(),
                plan.getPolicyName(),
                plan.getPolicyType(),
                plan.getCoverage(),
                plan.getPremium(),
                plan.getDurationInYears(),
                buyers
        );
    }
}
