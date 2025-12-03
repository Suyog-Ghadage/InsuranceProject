package com.crud.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPolicyResponse {

        private Long id;
        private Long userId;
        private String userName;
        private String policyStatus;
        private LocalDate startDate;
        private LocalDate endDate;

        private String nominee;
        private String nomineeRelation;

        private String gender;
        private LocalDate dob;
        private String aadhaarNumber;
        private Integer age;

        // POLICY DETAILS
        private Long policyId;
        private String policyName;
        private String policyType;
        private Double premium;
        private Double coverage;
        private Integer durationInYears;
        private String imageURL;
}