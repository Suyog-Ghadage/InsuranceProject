package com.crud.service;

import com.crud.entity.ContactForm;

import java.util.List;
import java.util.Optional;

public interface ContactFormService {

    ContactForm submitContactForm(ContactForm form);

    List<ContactForm> getAllContactForms();

    Optional<ContactForm> findByEmail(String email);

    Optional<ContactForm> findByPanNumber(String panNumber);
}
