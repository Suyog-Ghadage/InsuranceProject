package com.crud.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PendingPolicyResponse {
    
    private Long userPolicyId;
    private Long userId;
    private String userName;
    private String policyName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String nominee;
    private String nomineeRelation;
    private String gender;
    private LocalDate dob;
    private String aadhaarNumber;
    private Integer age;

}
