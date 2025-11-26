package com.crud.controller;

import com.crud.entity.Document;
import com.crud.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("documentName") String documentName
    ) {
        try {
            Document saved = documentService.storeFile(file, userId, documentName);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload document: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocumentById(@PathVariable Long documentId) {
        try {
            return ResponseEntity.ok(documentService.getDocumentById(documentId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Document not found");
        }
    }


    @GetMapping("/view/{documentId}")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long documentId) {
        try {
            Document doc = documentService.getDocumentById(documentId);
            Resource resource = documentService.loadFileAsResource(documentId);

            Path filePath = Paths.get(doc.getFilePath()).normalize();
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            String filename = java.net.URLEncoder.encode(doc.getOriginalFileName(),
                    java.nio.charset.StandardCharsets.UTF_8).replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + filename)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }


    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        try {
            Document doc = documentService.getDocumentById(documentId);
            Resource resource = documentService.loadFileAsResource(documentId);

            Path filePath = Paths.get(doc.getFilePath()).normalize();
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            String filename = java.net.URLEncoder.encode(doc.getOriginalFileName(),
                    java.nio.charset.StandardCharsets.UTF_8).replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping(value = "/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDocument(
            @PathVariable Long documentId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "documentName", required = false) String documentName
    ) {
        if ((file == null || file.isEmpty()) && (documentName == null || documentName.isEmpty())) {
            return ResponseEntity.badRequest().body("Provide a file or document name to update.");
        }
        try {
            return ResponseEntity.ok(documentService.updateDocument(documentId, file, documentName));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update document: " + e.getMessage());
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            documentService.deleteDocument(documentId);
            return ResponseEntity.ok("Document deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete document: " + e.getMessage());
        }
    }
}
