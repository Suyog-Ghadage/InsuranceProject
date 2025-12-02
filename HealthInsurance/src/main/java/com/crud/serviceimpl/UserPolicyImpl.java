package com.crud.serviceimpl;

import com.crud.dto.PurchaseRequest;
import com.crud.entity.PolicyPlan;
import com.crud.entity.UserPolicy;
import com.crud.repository.PolicyPlanRepository;
import com.crud.repository.UserPolicyRepository;
import com.crud.service.UserPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UserPolicyImpl implements UserPolicyService {

    @Autowired
    private PolicyPlanRepository planRepository;

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @Override
    public UserPolicy purchasePolicy(PurchaseRequest request) {
        PolicyPlan plan = planRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy Plan not found"));

        UserPolicy userPolicy = UserPolicy.builder()
                .userId(request.getUserId())
                .userName(request.getUserName())
                .gender(request.getGender())
                .dob(request.getDob())
                .aadhaarNumber(request.getAadhaarNumber())
                .age(request.getAge())
                .policyPlan(plan)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(plan.getDurationInYears()))
                .policyStatus("PENDING") //  Initially pending
                .nominee(request.getNominee())
                .nomineeRelation(request.getNomineeRelation())
                .build();

        return userPolicyRepository.save(userPolicy);
    }


    @Override
    public UserPolicy getPolicyByUserId(Long userId) {
        return userPolicyRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Policy not found for user ID: " + userId));
    }

    @Override
    public List<UserPolicy> getAllPoliciesByUserId(Long userId) {
        return userPolicyRepository.findAllByUserId(userId);
    }

    @Override
    public List<UserPolicy> getAllPolicies() {
        return userPolicyRepository.findAll();
    }

    @Override
    public UserPolicy updatePolicy(Long policyId, UserPolicy updatedPolicy) {
        UserPolicy policy = userPolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with id " + policyId));

        if (updatedPolicy.getNominee() != null) {
            policy.setNominee(updatedPolicy.getNominee());
        }
        if (updatedPolicy.getNomineeRelation() != null) {
            policy.setNomineeRelation(updatedPolicy.getNomineeRelation());
        }
        if (updatedPolicy.getPolicyStatus() != null) {
            policy.setPolicyStatus(updatedPolicy.getPolicyStatus());
        }

        return userPolicyRepository.save(policy);
    }

    @Override
    public UserPolicy getPolicyById(Long policyId) {
        return userPolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with id " + policyId));
    }

    @Override
    public UserPolicy updateNomineeDetails(Long policyId, String nominee, String nomineeRelation) {
        UserPolicy policy = userPolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with id " + policyId));

        if (nominee != null && !nominee.isEmpty()) {
            policy.setNominee(nominee);
        }
        if (nomineeRelation != null && !nomineeRelation.isEmpty()) {
            policy.setNomineeRelation(nomineeRelation);
        }

        return userPolicyRepository.save(policy);
    }

    @Override
    public List<UserPolicy> getPendingPoliciesByAdminId(Long adminId) {
        return userPolicyRepository.findByPolicyPlan_Admin_IdAndPolicyStatus(adminId, "PENDING");
    }

    @Override
    public List<UserPolicy> getActivePoliciesByAdminId(Long adminId) {
        return userPolicyRepository.findByPolicyPlan_Admin_IdAndPolicyStatus(adminId, "ACTIVE");
    }


    @Override
    public void deletePolicy(Long policyId) {
        if (!userPolicyRepository.existsById(policyId)) {
            throw new RuntimeException("Policy not found with id " + policyId);
        }
        userPolicyRepository.deleteById(policyId);
    }
}

