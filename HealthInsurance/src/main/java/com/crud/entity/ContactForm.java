package com.crud.entity;

import com.crud.enums.ContactRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ContactForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private LocalDate dob;
    private String mobileNumber;
    private String correspondenceAddress;
    private String permanentAddress;
    private String panNumber;

    @Enumerated(EnumType.STRING)
    private ContactRole role;    // ADMIN or USER


}
