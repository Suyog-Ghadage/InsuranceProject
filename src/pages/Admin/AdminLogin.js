import React, { useState } from "react";
import "./AdminLogin.css";
import { login, verifyOtp } from "../AdminAPI/AdminLoginAPI";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // NEW

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email);
      sessionStorage.setItem("adminEmail", formData.email);
      window.alert("OTP has been sent to your registered email.");
      setStep(2);
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(formData.email, formData.otp);

      sessionStorage.setItem("adminId", res.id);
      sessionStorage.setItem("adminRole", res.role);
      sessionStorage.setItem("adminToken", res.token);
      sessionStorage.setItem("adminUsername", res.username);
      sessionStorage.setItem("adminProfileId", res.profileId);

      setTimeout(() => navigate("/admin/dashboard"), 500);
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIMPLE RESEND OTP FUNCTION
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await login(formData.email);
      window.alert("OTP Resent Successfully!");
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page2">
      <div className="auth-form2">
        <button
          className="close-btn"
          onClick={() => navigate("/")}
          title="Go to Home"
        >
           ✖
        </button>

        <h2>{step === 1 ? "Admin Login" : "Verify OTP"}</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              name="email"
              placeholder="Enter Admin Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
            />
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* ✅ SIMPLE RESEND BUTTON */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="resend-btn"
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
