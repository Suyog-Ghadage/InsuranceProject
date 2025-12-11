import React, { useState, useEffect } from "react";
import "./AdminLogin.css";
import { login, verifyOtp } from "../AdminAPI/AdminLoginAPI";
import { useNavigate } from "react-router-dom";
 
export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
 
  // 🔥 TIMER STATES
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
 
  useEffect(() => {
    let interval;
 
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
 
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);
 
  // Reset timer when step changes
  useEffect(() => {
    if (step === 2) {
      setTimer(60);
      setIsTimerActive(true);
    }
  }, [step]);
 
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
 
  // RESEND OTP (timer resets)
  const handleResendOtp = async () => {
    if (timer > 0) return; // Prevent early clicks
 
    setResendLoading(true);
    try {
      await login(formData.email);
      window.alert("OTP Resent Successfully!");
 
      // Restart timer
      setTimer(60);
      setIsTimerActive(true);
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
 
            {/* TIMER TEXT */}
            <p style={{ marginTop: "-5px", marginBottom: "5px", color: "#1565c0" }}>
              OTP expires in: <strong>00:{String(timer).padStart(2, "0")}</strong>
            </p>
 
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
 
            {/* RESEND OTP BUTTON */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timer > 0 || resendLoading}
              className="resend-btn"
            >
              {timer > 0
                ? `Resend OTP in ${timer}s`
                : resendLoading
                ? "Resending..."
                : "Resend OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
 
 