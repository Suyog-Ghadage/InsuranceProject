package com.crud.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class PurchaseRequest {

    private Long userId;
    private String userName;
    private Long policyId;
    private String nominee;
    private String nomineeRelation;
    private String gender;
    private LocalDate dob;
    private String aadhaarNumber;
    private Integer age;

}