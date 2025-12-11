import React, { useEffect, useState } from "react";
import axios from "axios";
import CONFIG from "../../../config/config";
import "./MyDocuments.css";

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState("");

  const userId = JSON.parse(sessionStorage.getItem("authData"))?.userId;
  const token = JSON.parse(sessionStorage.getItem("authData"))?.token;

  const BASE_URL = CONFIG.BASE_URL;

  // ============================================
  // Fetch Uploaded Documents (WITH TOKEN)
  // ============================================
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!userId || !token) return;

        const res = await axios.get(`${BASE_URL}/documents/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        setDocuments(res.data);
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };

    fetchDocuments();
  }, [userId, token, BASE_URL]);

  // ============================================
  // File selection with validation
  // ============================================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Only JPG, JPEG, PNG, PDF allowed.");
      e.target.value = null;
      return;
    }

    if (selectedFile.size > maxSize) {
      alert("File size exceeds 2MB.");
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
  };

  // ============================================
  // Upload Document (NO TOKEN REQUIRED)
  // ============================================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !documentName) {
      alert("Please choose a file and enter a document name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("documentName", documentName);

    try {
      const res = await axios.post(`${BASE_URL}/documents/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Document uploaded successfully!");

      // Add latest uploaded document
      setDocuments((prev) => [...prev, res.data]);

      setFile(null);
      setDocumentName("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document");
    }
  };

  // ============================================
  // Delete Document
  // ============================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this document?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/documents/${id}`);

      
      setDocuments((prev) => prev.filter((doc) => doc.documentId !== id));

      alert("Document deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete document");
    }
  };

  return (
    <div className="my-documents-container">
      <h2>Upload Document</h2>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Document Name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          required
        />

        <input type="file" onChange={handleFileChange} required />

        <button type="submit">Upload</button>
      </form>

      <h3>My Documents</h3>

      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.documentId}>
              {doc.documentName} ({doc.originalFileName}) —{" "}
              {doc.uploadedAt}
              <div style={{ marginTop: "6px" }}>
                <a
                  href={`${BASE_URL}/documents/view/${doc.documentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>{" "}
                |{" "}
                <a
                  href={`${BASE_URL}/documents/download/${doc.documentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>{" "}
                |{" "}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(doc.documentId)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
