package com.crud.controller;

import com.crud.dto.PolicyPlanWithBuyersResponse;
import com.crud.dto.UserPolicyResponse;
import com.crud.entity.PolicyPlan;
import com.crud.service.PolicyPlanservice;
import com.crud.service.UserPolicyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/admin-policy")
public class AdminPolicyController {

    @Autowired
    private PolicyPlanservice policyPlanservice;


    private final ObjectMapper mapper = new ObjectMapper();


    @PostMapping("/{adminId}/policy-plans")
    public ResponseEntity<PolicyPlan> createPolicy(
            @PathVariable Long adminId,
            @RequestParam("policy") String policyJson,
            @RequestParam(value = "image", required = false) MultipartFile file
    ) throws Exception {
        PolicyPlan plan = policyPlanservice.storePolicyWithImage(file, adminId, policyJson);
        return ResponseEntity.ok(plan);
    }


    @PutMapping("/{adminId}/policy-plans/{planId}")
    public ResponseEntity<PolicyPlan> updatePolicy(
            @PathVariable Long adminId,
            @PathVariable Long planId,
            @RequestParam("policy") String policyJson,
            @RequestParam(value = "image", required = false) MultipartFile file
    ) throws Exception {
        PolicyPlan plan = policyPlanservice.updatePolicyWithImage(planId, file, policyJson, adminId);
        return ResponseEntity.ok(plan);
    }

    @DeleteMapping("/{adminId}/policy-plans/{planId}")
    public ResponseEntity<String> deletePolicy(
            @PathVariable Long adminId,
            @PathVariable Long planId
    ) {
        policyPlanservice.deletePlan(planId, adminId);
        return ResponseEntity.ok("Policy deleted successfully");
    }


    @GetMapping("/policy-plans/all")
    public ResponseEntity<List<PolicyPlan>> getAllPolicies() {
        List<PolicyPlan> plans = policyPlanservice.getAllPlans();
        return ResponseEntity.ok(plans);
    }


    @GetMapping("/{adminId}/policy-plans")
    public ResponseEntity<List<PolicyPlan>> getPoliciesByAdmin(@PathVariable Long adminId) {
        List<PolicyPlan> plans = policyPlanservice.getPlansByAdmin (adminId);
        return ResponseEntity.ok(plans);
    }

    // -------------------- VIEW IMAGE --------------------
    @GetMapping("/policy-plans/view-image/{planId}")
    public ResponseEntity<Resource> viewPolicyImage(@PathVariable Long planId) throws IOException {
        PolicyPlan plan = policyPlanservice.getPlanById(planId);
        String imagePath = plan.getImageUrl();
        if (imagePath == null || imagePath.isEmpty()) return ResponseEntity.notFound().build();

        Path filePath = Paths.get(imagePath).normalize();
        Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
                .body(resource);
    }


  /*  @GetMapping("/policy-plans/download-image/{planId}")
      public ResponseEntity<Resource> downloadPolicyImage(@PathVariable Long planId) throws IOException {
        PolicyPlan plan = policyPlanservice.getPlanById(planId);



        String imagePath = plan.getImageUrl();
        if (imagePath == null || imagePath.isEmpty()) return ResponseEntity.notFound().build();

        Path filePath = Paths.get(imagePath).normalize();
        Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName() + "\"")
                .body(resource);
    }*/

    // Admin views their policy plan with all buyers
    @GetMapping("/{planId}")
    public ResponseEntity<PolicyPlanWithBuyersResponse> getPolicyPlanWithBuyers(@PathVariable Long planId) {
        return ResponseEntity.ok(policyPlanservice.getPolicyPlanWithBuyers(planId));
    }
}


