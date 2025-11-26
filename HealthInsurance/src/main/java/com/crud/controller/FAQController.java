package com.crud.controller;

import com.crud.entity.FAQ;
import com.crud.service.FAQService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faq")
public class FAQController {

    @Autowired
    private FAQService faqService;


    @PostMapping("/add")
    public ResponseEntity<FAQ> addFAQ(@RequestBody FAQ faq) {
        return ResponseEntity.ok(faqService.addFAQ(faq));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FAQ> updateFAQ(@PathVariable Long id, @RequestBody FAQ faq) {
        return ResponseEntity.ok(faqService.updateFAQ(id, faq));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFAQ(@PathVariable Long id) {
        faqService.deleteFAQ(id);
        return ResponseEntity.ok("FAQ deleted successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<FAQ>>  getAllFAQs() {
        return ResponseEntity.ok(faqService.getAllFAQs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FAQ> getFAQById(@PathVariable Long id){
        return ResponseEntity.ok(faqService.getFAQById(id));
    }

}
