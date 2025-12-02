package com.crud.serviceimpl;

import com.crud.entity.Claim;
import com.crud.entity.ClaimDocument;
import com.crud.repository.ClaimDocumentRepository;
import com.crud.repository.ClaimRepository;
import com.crud.service.ClaimDocumentService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ClaimDocumentImpl implements ClaimDocumentService {

    private final ClaimRepository claimRepository;
    private final ClaimDocumentRepository claimDocumentRepository;

    // Upload directory
    private final String uploadDir = System.getProperty("user.home") + "/uploads/";

    // Allowed file types (ONLY pdf + images)
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private static final long MAX_FILE_SIZE_BYTES = 2L * 1024L * 1024L;

    public ClaimDocumentImpl(ClaimRepository claimRepository, ClaimDocumentRepository claimDocumentRepository) {
        this.claimRepository = claimRepository;
        this.claimDocumentRepository = claimDocumentRepository;
    }

    @Override
    public ClaimDocument uploadClaimDocument(Long claimId, MultipartFile file, String documentType) throws IOException {

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        validateFile(file);

        Path dirPath = Paths.get(uploadDir);
        Files.createDirectories(dirPath);

        String fileName = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
        Path filePath = dirPath.resolve(fileName);

        Files.write(filePath, file.getBytes());

        ClaimDocument doc = new ClaimDocument();
        doc.setDocumentName(file.getOriginalFilename());
        doc.setDocumentType(documentType);
        doc.setContentType(normalizeContentType(file.getContentType()));
        doc.setFileSize(file.getSize());
        doc.setFilePath(filePath.toString());
        doc.setUploadedDate(LocalDate.now());
        doc.setClaim(claim);

        return claimDocumentRepository.save(doc);
    }

    @Override
    public List<ClaimDocument> uploadMultipleClaimDocuments(Long claimId, MultipartFile[] files, String[] documentTypes) throws IOException {

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        Path dirPath = Paths.get(uploadDir);
        Files.createDirectories(dirPath);

        List<ClaimDocument> documents = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String documentType = (documentTypes != null && documentTypes.length > i) ? documentTypes[i] : null;

            validateFile(file);

            String fileName = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
            Path filePath = dirPath.resolve(fileName);

            Files.write(filePath, file.getBytes());

            ClaimDocument doc = new ClaimDocument();
            doc.setDocumentName(file.getOriginalFilename());
            doc.setDocumentType(documentType);
            doc.setContentType(normalizeContentType(file.getContentType()));
            doc.setFileSize(file.getSize());
            doc.setFilePath(filePath.toString());
            doc.setUploadedDate(LocalDate.now());
            doc.setClaim(claim);

            documents.add(claimDocumentRepository.save(doc));
        }

        return documents;
    }

    @Override
    public List<ClaimDocument> getClaimDocuments(Long claimId) {
        return claimDocumentRepository.findByClaim_ClaimId(claimId);
    }

    @Override
    public ClaimDocument getClaimDocumentById(Long claimDocumentId) {
        return claimDocumentRepository.findById(claimDocumentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + claimDocumentId));
    }

    @Override
    public void deleteClaimDocumentById(Long claimDocumentId) {

        ClaimDocument document = claimDocumentRepository.findById(claimDocumentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + claimDocumentId));

        Path filePath = Paths.get(document.getFilePath());

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file from disk", e);
        }

        claimDocumentRepository.delete(document);
    }




    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        String contentType = normalizeContentType(file.getContentType());

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Only PDF and Image (JPG, JPEG, PNG) files are allowed");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new RuntimeException("File too large. Maximum allowed size is 2 MB");
        }
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null) return null;
        return contentType.toLowerCase().trim();
    }

    private String sanitizeFilename(String original) {
        if (original == null) return "file";
        return original.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
    }
}
