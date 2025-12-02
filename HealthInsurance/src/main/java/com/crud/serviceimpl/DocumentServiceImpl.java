package com.crud.serviceimpl;

import com.crud.entity.Admin;
import com.crud.entity.Document;
import com.crud.entity.User;
import com.crud.enums.Role;
import com.crud.repository.AdminRepository;
import com.crud.repository.DocumentRepository;
import com.crud.repository.UserRepository;
import com.crud.service.DocumentService;
import com.crud.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private EmailService emailService;

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;


    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    private static final long MAX_FILE_SIZE_BYTES = 2L * 1024L * 1024L;

    @Override
    public Document storeFile(MultipartFile file, Long userId, String documentName) {
        try {

            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                throw new RuntimeException("Failed to create upload directory at: " + dir.getAbsolutePath());
            }

            validateFile(file);

            String fileName = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
            String fullPath = uploadDir + fileName;

            file.transferTo(new File(fullPath));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Document document = new Document();
            document.setUser(user);
            document.setDocumentName(documentName);
            document.setOriginalFileName(file.getOriginalFilename());
            document.setUploadedAt(LocalDateTime.now());
            document.setFilePath(fullPath);
            document.setContentType(normalizeContentType(file.getContentType()));
            document.setFileSize(file.getSize());

            Document savedDoc = documentRepository.save(document);

            List<Admin> superAdmins = adminRepository.findByRole(Role.SUPER_ADMIN);
            if (!superAdmins.isEmpty()) {
                String superAdminEmail = superAdmins.get(0).getEmail();
                String subject = "Document Uploaded Successfully";
                String text = String.format(
                        "User '%s' uploaded a document.\nDocument Name: %s\nOriginal File: %s\nTime: %s",
                        user.getUserName(),
                        documentName,
                        file.getOriginalFilename(),
                        LocalDateTime.now()
                );
                emailService.sendEmail(superAdminEmail, subject, text);
            }

            return savedDoc;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public Document getDocumentById(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));
    }

    @Override
    public Document updateDocument(Long documentId, MultipartFile file, String documentName) {
        try {
            Document existingDoc = getDocumentById(documentId);

            if (documentName != null && !documentName.isEmpty()) {
                existingDoc.setDocumentName(documentName);
            }

            if (file != null && !file.isEmpty()) {
                File oldFile = new File(existingDoc.getFilePath());
                if (oldFile.exists()) oldFile.delete();

                validateFile(file);

                String fileName = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
                String fullPath = uploadDir + fileName;
                file.transferTo(new File(fullPath));

                existingDoc.setFilePath(fullPath);
                existingDoc.setOriginalFileName(file.getOriginalFilename());
                existingDoc.setUploadedAt(LocalDateTime.now());


                existingDoc.setContentType(normalizeContentType(file.getContentType()));
                existingDoc.setFileSize(file.getSize());
            }

            return documentRepository.save(existingDoc);

        } catch (IOException e) {
            throw new RuntimeException("Failed to update file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteDocument(Long documentId) {
        Document existingDoc = getDocumentById(documentId);
        File file = new File(existingDoc.getFilePath());
        if (file.exists()) file.delete();
        documentRepository.delete(existingDoc);
    }

    @Override
    public Resource loadFileAsResource(Long documentId) {
        Document doc = getDocumentById(documentId);
        try {
            Path filePath = Paths.get(doc.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + doc.getFilePath(), e);
        }
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
