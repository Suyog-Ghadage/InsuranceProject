package com.crud.controller;

import com.crud.entity.ClaimDocument;
import com.crud.service.ClaimDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/claims-documents")
public class ClaimDocumentController {

    private final ClaimDocumentService claimDocumentService;

    public ClaimDocumentController(ClaimDocumentService claimDocumentService) {
        this.claimDocumentService = claimDocumentService;
    }


//    @PostMapping("/{claimId}/documents/single")
//    public ResponseEntity<ClaimDocument> uploadSingleDocument(
//            @PathVariable Long claimId,
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("documentType") String documentType
//    ) throws Exception {
//        ClaimDocument doc = claimDocumentService.uploadClaimDocument(claimId, file, documentType);
//        return ResponseEntity.ok(doc);
//    }


    @PostMapping("/{claimId}/documents/multiple")
    public ResponseEntity<List<ClaimDocument>> uploadMultipleDocuments(
            @PathVariable Long claimId,
            @RequestParam("file") MultipartFile[] files,
            @RequestParam("documentType") String[] documentTypes
    ) throws Exception {
        List<ClaimDocument> docs = claimDocumentService.uploadMultipleClaimDocuments(claimId, files, documentTypes);
        return ResponseEntity.ok(docs);
    }


    @GetMapping("/{claimId}/documents")
    public ResponseEntity<List<ClaimDocument>> getClaimDocuments(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimDocumentService.getClaimDocuments(claimId));
    }


    @GetMapping("/documents/view/{claimDocumentId}")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long claimDocumentId) {
        try {
            ClaimDocument document = claimDocumentService.getClaimDocumentById(claimDocumentId);
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) return ResponseEntity.notFound().build();

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/documents/download/{claimDocumentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long claimDocumentId) {
        try {
            ClaimDocument document = claimDocumentService.getClaimDocumentById(claimDocumentId);
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) return ResponseEntity.notFound().build();

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @DeleteMapping("/documents/{claimDocumentId}")
    public ResponseEntity<String> deleteDocument(@PathVariable Long claimDocumentId) {
        try {
            claimDocumentService.deleteClaimDocumentById(claimDocumentId);
            return ResponseEntity.ok("Document deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to delete document");
        }
    }
}
