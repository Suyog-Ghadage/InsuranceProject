import React, { useContext, useState, useEffect } from 'react';
import './Auth.css';
import { register, login, verifyOtp } from '../../../services/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // Login steps
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    otp: ''
  });

  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [resendMessage, setResendMessage] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState(''); // new state

  // -------------------------------
  // LOGIN OTP TIMER
  // -------------------------------
  const [otpTimer, setOtpTimer] = useState(60);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [resendCounter, setResendCounter] = useState(0);

  // -------------------------------
  // FORGOT PASSWORD OTP TIMER
  // -------------------------------
  const [fpOtpTimer, setFpOtpTimer] = useState(60);
  const [isFpOtpExpired, setIsFpOtpExpired] = useState(false);
  const [fpResendCounter, setFpResendCounter] = useState(0);

  // -------------------------------
  // LOGIN OTP TIMER
  // -------------------------------
  useEffect(() => {
    let timer;
    if (isLogin && step === 2) {
      setOtpTimer(60);
      setIsOtpExpired(false);

      timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLogin, step, resendCounter]);

  // -------------------------------
  // FORGOT PASSWORD OTP TIMER
  // -------------------------------
  useEffect(() => {
    let timer;
    if (isLogin && step === 4) {
      setFpOtpTimer(60);
      setIsFpOtpExpired(false);

      timer = setInterval(() => {
        setFpOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsFpOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLogin, step, fpResendCounter]);

  // -------------------------------
  // HANDLE INPUT CHANGE
  // -------------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------------
  // PASSWORD VALIDATION
  // -------------------------------
  const validatePassword = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(password)) {
      return "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special char.";
    }
    return "";
  };

  // -------------------------------
  // REGISTER
  // -------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setValidationErrors({ password: passwordError });
      return;
    }
    setValidationErrors({});

    try {
      await register(formData.userName, formData.email, formData.password);
      setMessage("Registration successful! Please login.");
      setIsLogin(true);
      setFormData({ ...formData, password: '' });
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  // -------------------------------
  // LOGIN → SEND OTP
  // -------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      alert("OTP sent to your email");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  // -------------------------------
  // VERIFY LOGIN OTP
  // -------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtp(formData.email, formData.otp);

      const userData = {
        userId: res?.userId,
        userName: res?.userName,
        role: res?.role,
        token: res?.token,
      };

      loginUser(userData);
      navigate("/");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  // -------------------------------
  // RESEND LOGIN OTP
  // -------------------------------
  const handleResendOtp = async () => {
    try {
      await login(formData.email, formData.password);
      setResendMessage("OTP resent successfully!");
      setResendCounter(prev => prev + 1);
    } catch {
      setResendMessage("Failed to resend OTP");
    }
  };

  // -------------------------------
  // FORGOT PASSWORD - SEND OTP
  // -------------------------------
  const handleForgotPasswordSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8089/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        alert("OTP sent to email");
        setStep(4);
      } else {
        alert("Email not found");
      }
    } catch {
      alert("Error sending OTP");
    }
  };

  // -------------------------------
  // FORGOT PASSWORD - VERIFY OTP
  // -------------------------------
  const handleForgotPasswordVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8089/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      if (res.ok) {
        alert("OTP verified");
        setStep(5); // Go to reset password
      } else {
        alert("Invalid OTP");
      }
    } catch {
      alert("Error verifying OTP");
    }
  };

  // -------------------------------
  // RESEND FORGOT PASSWORD OTP
  // -------------------------------
  const handleForgotPasswordResendOtp = async () => {
    try {
      const res = await fetch("http://localhost:8089/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        setResendMessage("OTP resent successfully!");
        setFpResendCounter(prev => prev + 1);
      } else {
        setResendMessage("Failed to resend OTP");
      }
    } catch {
      setResendMessage("Error sending OTP");
    }
  };

  // -------------------------------
  // FORGOT PASSWORD - RESET PASSWORD
  // -------------------------------
  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setResetPasswordError(passwordError);
      return;
    }
    setResetPasswordError('');

    try {
      const res = await fetch("http://localhost:8089/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.password,
        }),
      });

      if (res.ok) {
        alert("Password updated successfully!");
        setStep(1);
        setFormData({ ...formData, password: '' });
      } else {
        alert("Failed to reset password");
      }
    } catch {
      alert("Error resetting password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="close-button" onClick={() => navigate('/')}>
          &times;
        </div>

        <h2>
          {isLogin
            ? step === 1
              ? "Login"
              : step === 2
              ? "Verify OTP"
              : step === 3
              ? "Forgot Password"
              : step === 4
              ? "Verify OTP"
              : "Reset Password"
            : "Register"}
        </h2>

        {/* LOGIN STEP 1 */}
        {isLogin && step === 1 && (
          <form onSubmit={handleLogin}>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button type="submit">Send OTP</button>

            <p className="fake-link" style={{ marginTop: "10px", textAlign: "center" }} onClick={() => setStep(3)}>
              Forgot Password?
            </p>

            <p className="footer-text">
              Don't have an account?{" "}
              <span className="fake-link" onClick={() => setIsLogin(false)}>Register</span>
            </p>
          </form>
        )}

        {/* LOGIN STEP 2 */}
        {isLogin && step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} required disabled={isOtpExpired} />
            <button type="submit" disabled={isOtpExpired}>Verify OTP</button>

            <p className="otp-timer" style={{ color: otpTimer <= 10 ? "red" : "#1976d2" }}>
              {isOtpExpired ? "OTP expired. Please resend." : `OTP expires in: ${otpTimer}s`}
            </p>

            <p className="resend-otp-text">
              Didn’t get the OTP?{" "}
              <span className="fake-link" onClick={handleResendOtp}>Resend OTP</span>
            </p>

            {resendMessage && <p className="auth-message">{resendMessage}</p>}
          </form>
        )}

        {/* FORGOT PASSWORD STEP 3 */}
        {isLogin && step === 3 && (
          <form onSubmit={handleForgotPasswordSendOtp}>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
            <button type="submit">Send OTP</button>
            <p className="fake-link" onClick={() => setStep(1)}>Back to Login</p>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 4 */}
        {isLogin && step === 4 && (
          <form onSubmit={handleForgotPasswordVerifyOtp}>
            <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} required disabled={isFpOtpExpired} />
            <button type="submit" disabled={isFpOtpExpired}>Verify OTP</button>

            <p className="otp-timer" style={{ color: fpOtpTimer <= 10 ? "red" : "#1976d2" }}>
              {isFpOtpExpired ? "OTP expired. Please resend." : `OTP expires in: ${fpOtpTimer}s`}
            </p>

            <p className="resend-otp-text">
              Didn’t get the OTP?{" "}
              <span className="fake-link" onClick={handleForgotPasswordResendOtp}>Resend OTP</span>
            </p>

            {resendMessage && <p className="auth-message">{resendMessage}</p>}
            <p className="fake-link" onClick={() => setStep(3)}>Back</p>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 5 (Reset Password) */}
        {isLogin && step === 5 && (
          <form onSubmit={handleForgotPasswordReset}>
            <input type="password" name="password" placeholder="New Password" value={formData.password} onChange={handleChange} required />
            {resetPasswordError && <p className="error-text">{resetPasswordError}</p>}
            <button type="submit">Reset Password</button>
            <p className="fake-link" onClick={() => setStep(1)}>Back to Login</p>
          </form>
        )}

        {/* REGISTER */}
        {!isLogin && (
          <form onSubmit={handleRegister}>
            <input type="text" name="userName" placeholder="Full Name" value={formData.userName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            {validationErrors.password && <p className="error-text">{validationErrors.password}</p>}
            <button type="submit">Register</button>
            <p className="footer-text">
              Already have an account?{" "}
              <span className="fake-link" onClick={() => setIsLogin(true)}>Login</span>
            </p>
          </form>
        )}

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}
