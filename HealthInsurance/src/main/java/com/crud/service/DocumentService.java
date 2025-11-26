package com.crud.service;

import com.crud.entity.Document;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    Document storeFile(MultipartFile file, Long userId, String documentName);
    List<Document> getAllDocuments();
    Document getDocumentById(Long documentId);
    Document updateDocument(Long documentId, MultipartFile file, String documentName);
    void deleteDocument(Long documentId);

    Resource loadFileAsResource(Long documentId);
}
