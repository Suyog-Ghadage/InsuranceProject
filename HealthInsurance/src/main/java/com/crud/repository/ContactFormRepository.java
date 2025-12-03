package com.crud.repository;

import com.crud.entity.ContactForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactFormRepository extends JpaRepository<ContactForm ,Long > {

    Optional<ContactForm> findByEmail(String email);

    Optional<ContactForm> findByPanNumber(String panNumber);
}
