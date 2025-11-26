package com.crud.service;

import com.crud.entity.ClaimDocument;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ClaimDocumentService {


    ClaimDocument uploadClaimDocument(Long claimId, MultipartFile file, String documentType) throws IOException;


    List<ClaimDocument> uploadMultipleClaimDocuments(Long claimId, MultipartFile[] files, String[] documentTypes) throws IOException;


    List<ClaimDocument> getClaimDocuments(Long claimId);


    ClaimDocument getClaimDocumentById(Long claimDocumentId);

    void deleteClaimDocumentById(Long claimDocumentId);
}
