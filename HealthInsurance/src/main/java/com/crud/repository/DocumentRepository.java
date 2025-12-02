package com.crud.repository;

import com.crud.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // fetch all documents that belong to a given user id
    List<Document> findAllByUserUserId(Long userId);

    // If later you want pageable results:
    // Page<Document> findAllByUserUserId(Long userId, Pageable pageable);
}
