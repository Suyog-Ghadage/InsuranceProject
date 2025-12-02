package com.crud.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class ClaimDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimDocumentId;

    private String documentName;
    private String documentType;


    private String contentType;
    private Long fileSize;

    private String filePath;
    private LocalDate uploadedDate;

    @ManyToOne
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;


    public Long getClaimDocumentId() {
        return claimDocumentId;
    }

    public void setClaimDocumentId(Long claimDocumentId) {
        this.claimDocumentId = claimDocumentId;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDate getUploadedDate() {
        return uploadedDate;
    }

    public void setUploadedDate(LocalDate uploadedDate) {
        this.uploadedDate = uploadedDate;
    }

    public Claim getClaim() {
        return claim;
    }

    public void setClaim(Claim claim) {
        this.claim = claim;
    }
}
