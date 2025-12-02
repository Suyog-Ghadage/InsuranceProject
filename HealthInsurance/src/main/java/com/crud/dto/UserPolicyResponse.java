package com.crud.dto;

import lombok.*;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
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



}



