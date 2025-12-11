import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import CONFIG from "../../../config/config";

export default function AdminRegistration() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    panNumber: "",
    mobileNumber: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "username") {
      updatedValue = value.replace(/[^A-Za-z\s]/g, "");
    }

    if (name === "email") {
      updatedValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
    }

    if (name === "panNumber") {
      updatedValue = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    }

    if (name === "mobileNumber") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10); // only 10 digits
    }

    setFormData({ ...formData, [name]: updatedValue });
    setValidationErrors({ ...validationErrors, [name]: "" });
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format.";
    }

    if (!formData.panNumber.trim()) {
      errors.panNumber = "PAN number is required.";
    } else if (!panRegex.test(formData.panNumber)) {
      errors.panNumber = "Invalid PAN format (e.g., ABCDE1234F).";
    }

    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!mobileRegex.test(formData.mobileNumber)) {
      errors.mobileNumber = "Invalid mobile number (10 digits).";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validateForm()) return;

    const payload = {
      ...formData,
      mobileNumber: formData.mobileNumber.trim(),
    };

    try {
      await axios.post(`${CONFIG.BASE_URL}/admin/register`, payload);

      setSuccessMsg(
        `🎉 Admin registered successfully! Email sent to ${formData.email}`
      );

      setFormData({
        username: "",
        email: "",
        panNumber: "",
        mobileNumber: "",
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrorMsg(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // Inline CSS styles (merged file)
  const styles = {
    phoneWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "15px 0",
    },
    phoneCode: {
      background: "#e3e3e3",
      padding: "8px 14px",
      borderRadius: "6px",
      fontWeight: "bold",
      color: "#333",
    },
    phoneInput: {
      flex: 1,
      padding: "10px 12px",
      border: "1px solid #bbb",
      borderRadius: "6px",
      fontSize: "14px",
    },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, margin: "0 auto" }}>
      <Typography variant="h5" gutterBottom>
        📝 Register Admin
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!validationErrors.username}
          helperText={validationErrors.username}
        />

        <TextField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!validationErrors.email}
          helperText={validationErrors.email}
        />

        <TextField
          label="PAN Number"
          name="panNumber"
          value={formData.panNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!validationErrors.panNumber}
          helperText={validationErrors.panNumber}
        />

        {/* Mobile With +91 Outside */}
        <div style={styles.phoneWrapper}>
          <span style={styles.phoneCode}>+91</span>
          <input
            type="text"
            name="mobileNumber"
            style={styles.phoneInput}
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="Enter mobile number"
            maxLength="10"
          />
        </div>

        {validationErrors.mobileNumber && (
          <p style={{ color: "red", marginTop: "4px" }}>
            {validationErrors.mobileNumber}
          </p>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          fullWidth
        >
          Register Admin
        </Button>
      </form>
    </Box>
  );
}
