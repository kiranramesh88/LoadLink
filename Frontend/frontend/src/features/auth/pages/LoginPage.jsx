import React, { useState, useRef, useEffect } from "react";
import { loginApi, registerApi, verifyOtpApi, forgotPasswordApi, resetPasswordApi, resendOtpApi } from "../services/authAPI";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../slice/authSlice";
import toast from "react-hot-toast";
import "./LoginPage.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // UI State
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // OTP State
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(45);
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    // Forgot Password State
    const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: none, 1: phone, 2: otp, 3: new password
    const [verifiedOtp, setVerifiedOtp] = useState("");

    // Form Data State
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const roles = [

    {
        label: "Worker",
        value: "WORKER",
    },

    {
        label: "Customer",
        value: "CUSTOMER",
    },

    {
        label: "Union Admin",
        value: "UNION_ADMIN",
    },
    ];
    const [role, setRole] = useState("WORKER");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [language, setLanguage] = useState("en");
    const [countryCode, setCountryCode] = useState("+1");

    const getErrorMessage = (error, fallback) => {
        const data = error.response?.data;
        if (data?.errors) {
            const errs = data.errors;
            if (typeof errs === 'object') {
                const firstKey = Object.keys(errs)[0];
                const firstError = errs[firstKey];
                if (Array.isArray(firstError)) {
                    return firstError[0];
                } else if (typeof firstError === 'string') {
                    return firstError;
                } else {
                    return JSON.stringify(firstError);
                }
            }
        }
        return data?.detail || data?.message || fallback;
    };

    useEffect(() => {
        let interval;
        if ((showOTP || forgotPasswordStep === 2) && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showOTP, forgotPasswordStep, timer]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        if (value.length > 1) {
            const pastedData = value.replace(/\D/g, '').slice(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedData[i];
                }
            }
            setOtp(newOtp);
            const nextEmptyIndex = newOtp.findIndex(val => val === "");
            if (nextEmptyIndex !== -1) {
                otpRefs[nextEmptyIndex].current?.focus();
            } else {
                otpRefs[5].current?.focus();
            }
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== "" && index < 5) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);
            const response = await verifyOtpApi({
                phone_number: `+91${phoneNumber}`,
                otp_code: otpCode,
            });
            toast.success("Identity verified successfully!");
            
            if (forgotPasswordStep === 2) {
                setVerifiedOtp(otpCode);
                setForgotPasswordStep(3);
                setOtp(["", "", "", "", "", ""]);
            } else {
                setIsLogin(true);
                setShowOTP(false);
            }
        } catch (error) {
            console.log("OTP VERIFY ERROR:", error);
            const errMessage = getErrorMessage(error, "Invalid OTP");
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!phoneNumber.trim() || !/^[0-9]{10}$/.test(phoneNumber)) {
            setErrors({ phoneNumber: "Enter a valid 10-digit phone number" });
            return;
        }

        try {
            setLoading(true);
            await forgotPasswordApi({ phone_number: `+91${phoneNumber}` });
            toast.success("OTP sent successfully to your phone.");
            setForgotPasswordStep(2);
            setTimer(45);
            setOtp(["", "", "", "", "", ""]);
            clearErrors("phoneNumber");
        } catch (error) {
            console.log("FORGOT PASSWORD ERROR:", error);
            const errMessage = getErrorMessage(error, "Failed to send OTP");
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!password.trim() || password.length < 6) {
            setErrors({ password: "Password must be at least 6 characters" });
            return;
        }

        try {
            setLoading(true);
            await resetPasswordApi({
                phone_number: `+91${phoneNumber}`,
                otp_code: verifiedOtp,
                new_password: password
            });
            toast.success("Password reset successfully. You can now log in.");
            setForgotPasswordStep(0);
            setIsLogin(true);
            setPassword("");
            setVerifiedOtp("");
        } catch (error) {
            console.log("RESET PASSWORD ERROR:", error);
            const errMessage = getErrorMessage(error, "Failed to reset password");
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
            isValid = false;
        } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
            newErrors.phoneNumber = "Enter valid 10 digit number";
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        if (!isLogin) {
            if (!fullName.trim()) {
                newErrors.fullName = "Full name is required";
                isValid = false;
            }
            if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
                newErrors.email = "Valid email is required";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleAuth = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            if (isLogin) {
                const response = await loginApi({
                    phone_number: `+91${phoneNumber}`,
                    password: password,
                });

                const data = response.data?.data || response.data;

                // Store token under 'token' — must match authSlice and workerAPI
                localStorage.setItem("token", data.access);
                localStorage.setItem("refresh", data.refresh);

                // Populate Redux auth state so user info is available app-wide
                dispatch(loginSuccess({ token: data.access, user: data.user }));

                toast.success("Login successful");

                // Role-based redirect
                const userRole = data.user?.role;
                if (userRole === "CUSTOMER") {
                    navigate("/customer/dashboard");
                } else if (userRole === "WORKER") {
                    navigate("/worker");
                } else if (userRole === "UNION_ADMIN") {
                    navigate("/union/dashboard");
                } else {
                    navigate("/worker"); // fallback
                }
            } else {
                // Register Flow
                const response = await registerApi({
                    role: role,
                    full_name: fullName,
                    phone_number: `+91${phoneNumber}`,
                    email: email,
                    password: password,
                    language_preference: language,
                });
                
                toast.success("Account created successfully. Please verify OTP.");
                setShowOTP(true);
                setTimer(45);
                setOtp(["", "", "", "", "", ""]);
            }
        } catch (error) {
            console.log("FULL ERROR:", error);
            const errMessage = getErrorMessage(error, isLogin ? "Login failed" : "Registration failed");
            
            // Check if user is unverified and needs to verify OTP
            if (isLogin && errMessage.toLowerCase().includes("verify your account")) {
                toast.error(errMessage);
                try {
                    // Send OTP automatically
                    await resendOtpApi({
                        phone_number: `+91${phoneNumber}`,
                        purpose: "registration"
                    });
                    toast.success("Verification code sent to your phone number.");
                    setShowOTP(true);
                    setTimer(45);
                    setOtp(["", "", "", "", "", ""]);
                } catch (resendErr) {
                    console.log("AUTO RESEND OTP ERROR:", resendErr);
                    toast.error("Failed to send verification code. Please register again.");
                }
            } else {
                toast.error(errMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const clearErrors = (field) => {
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    return (
        <div className="login-page">
            {/* Background Elements for Premium Feel */}
            <div className="background-elements">
                <div className="bg-shape-top-right"></div>
                <div className="bg-shape-bottom-left"></div>
            </div>
            
            {/* Main Content Area */}
            <div className="main-content">
                <div className="auth-container">
                    {/* Auth Card */}
                    <div className="glass-card">
                        {showOTP || forgotPasswordStep === 2 ? (
                            <>
                                {/* OTP View */}
                                <div className="otp-header">
                                    <button 
                                        aria-label="Go back" 
                                        className="back-button"
                                        onClick={() => {
                                            if (forgotPasswordStep === 2) {
                                                setForgotPasswordStep(1);
                                            } else {
                                                setShowOTP(false);
                                            }
                                        }}
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        <span>{forgotPasswordStep === 2 ? "Back to phone input" : "Back to register"}</span>
                                    </button>
                                    <h1 className="otp-title">Verify your identity</h1>
                                    <p className="otp-subtitle">We've sent a 6-digit code to <span>+91 {phoneNumber}</span>.</p>
                                </div>
                                <div className="otp-form">
                                    <div className="otp-inputs">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={otpRefs[index]}
                                                className="otp-input"
                                                type="text"
                                                maxLength={6}
                                                placeholder="-"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            />
                                        ))}
                                    </div>
                                    <div className="otp-actions">
                                        <button 
                                            className="submit-btn" 
                                            type="button"
                                            disabled={loading || otp.join("").length < 6}
                                            onClick={handleVerifyOtp}
                                        >
                                            <span className="btn-content">
                                                {loading ? "Verifying..." : "Verify & Proceed"}
                                                {!loading && <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>}
                                            </span>
                                            <div className="btn-ripple"></div>
                                        </button>
                                        <div className="resend-button-container">
                                            <button 
                                                className="resend-button" 
                                                type="button"
                                                disabled={timer > 0}
                                                onClick={async () => {
                                                    try {
                                                        await resendOtpApi({
                                                            phone_number: `+91${phoneNumber}`,
                                                            purpose: forgotPasswordStep === 2 ? "password_reset" : "registration"
                                                        });
                                                        setTimer(45);
                                                        toast.success("OTP resent successfully");
                                                    } catch (err) {
                                                        const msg = getErrorMessage(err, "Failed to resend OTP");
                                                        toast.error(msg);
                                                    }
                                                }}
                                            >
                                                <span className="material-symbols-outlined" data-icon="refresh">refresh</span>
                                                {timer > 0 ? `Resend code in 0:${timer.toString().padStart(2, '0')}` : "Resend code"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : forgotPasswordStep === 1 ? (
                            <>
                                {/* Forgot Password - Phone Input */}
                                <div className="otp-header">
                                    <button 
                                        aria-label="Go back" 
                                        className="back-button"
                                        onClick={() => setForgotPasswordStep(0)}
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        <span>Back to login</span>
                                    </button>
                                    <h1 className="otp-title">Forgot Password</h1>
                                    <p className="otp-subtitle">Enter your registered phone number to receive a reset code.</p>
                                </div>
                                <form className="auth-form" onSubmit={handleForgotPassword}>
                                    <div className="form-group">
                                        <label htmlFor="forgotPhone">Phone Number</label>
                                        <div className="input-ring">
                                            <input 
                                                id="forgotPhone" 
                                                style={{ padding: "0 var(--spacing-md)", width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--color-on-surface)" }}
                                                placeholder="Enter phone number"
                                                type="tel" 
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    setPhoneNumber(e.target.value);
                                                    clearErrors("phoneNumber");
                                                }}
                                            />
                                        </div>
                                        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                                    </div>
                                    <button 
                                        className="submit-btn" 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        <span className="btn-content">
                                            {loading ? "Sending..." : "Send OTP"}
                                            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                                        </span>
                                        <div className="btn-ripple"></div>
                                    </button>
                                </form>
                            </>
                        ) : forgotPasswordStep === 3 ? (
                            <>
                                {/* Forgot Password - New Password Input */}
                                <div className="otp-header">
                                    <button 
                                        aria-label="Go back" 
                                        className="back-button"
                                        onClick={() => setForgotPasswordStep(0)}
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        <span>Back to login</span>
                                    </button>
                                    <h1 className="otp-title">Reset Password</h1>
                                    <p className="otp-subtitle">Enter your new secure password below.</p>
                                </div>
                                <form className="auth-form" onSubmit={handleResetPassword}>
                                    <div className="form-group">
                                        <label htmlFor="newPassword">New Password</label>
                                        <div className="input-ring input-with-icon">
                                            <span className="material-symbols-outlined icon-left" data-icon="lock">lock</span>
                                            <input 
                                                id="newPassword" 
                                                placeholder="••••••••"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    clearErrors("password");
                                                }}
                                            />
                                            <button 
                                                aria-label="Toggle password visibility" 
                                                className="icon-right" 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <span className="material-symbols-outlined" data-icon={showPassword ? "visibility_off" : "visibility"}>
                                                    {showPassword ? "visibility_off" : "visibility"}
                                                </span>
                                            </button>
                                        </div>
                                        <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-outline)' }}>Must be at least 6 characters.</p>
                                        {errors.password && <p className="error-text">{errors.password}</p>}
                                    </div>
                                    <button 
                                        className="submit-btn" 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        <span className="btn-content">
                                            {loading ? "Resetting..." : "Reset Password"}
                                            {!loading && <span className="material-symbols-outlined">check_circle</span>}
                                        </span>
                                        <div className="btn-ripple"></div>
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Header / Brand */}
                                <div className="auth-header">
                            <div className="brand-logo">
                                <span className="material-symbols-outlined" data-icon="local_shipping" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    local_shipping
                                </span>
                            </div>
                            <h1 className="title">{isLogin ? "Welcome back" : "LoadLink"}</h1>
                            <p className="subtitle">
                                {isLogin ? "Sign in to LoadLink Operations" : "Create your operational account."}
                            </p>
                        </div>
                        
                        {/* Form */}
                        <form className="auth-form" onSubmit={handleAuth}>
                            
                            {!isLogin && (
                                <>
                                    {/* Role Selection */}
                                    <div className="form-group">
                                        <label>Select Role</label>
                                        <div className="segmented-control">
                                            {
                                                roles.map((r) => (

                                                    <button
                                                        key={r.value}
                                                        type="button"
                                                        className={
                                                            role === r.value
                                                                ? "active"
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            setRole(r.value)
                                                        }
                                                    >

                                                        {r.label}

                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <div className="input-ring">
                                            <input 
                                                id="fullName" 
                                                style={{ padding: "0 var(--spacing-md)", width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--color-on-surface)" }}
                                                placeholder="Jane Doe" 
                                                type="text" 
                                                value={fullName}
                                                onChange={(e) => {
                                                    setFullName(e.target.value);
                                                    clearErrors("fullName");
                                                }}
                                            />
                                        </div>
                                        {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                                    </div>
                                </>
                            )}

                            {/* Phone Input */}
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <div className="input-ring">
                                    <input 
                                        id="phone" 
                                        style={{ padding: "0 var(--spacing-md)", width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--color-on-surface)" }}
                                        placeholder="Enter phone number" 
                                        type="tel" 
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            setPhoneNumber(e.target.value);
                                            clearErrors("phoneNumber");
                                        }}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                            </div>
                            
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-ring">
                                        <input 
                                            id="email" 
                                            style={{ padding: "0 var(--spacing-md)", width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--color-on-surface)" }}
                                            placeholder="jane@example.com" 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                clearErrors("email");
                                            }}
                                        />
                                    </div>
                                    {errors.email && <p className="error-text">{errors.email}</p>}
                                </div>
                            )}

                            {/* Password Input */}
                            <div className="form-group">
                                <div className="label-with-link">
                                    <label htmlFor="password">Password</label>
                                    {isLogin && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setForgotPasswordStep(1); 
                                                setErrors({});
                                                setPhoneNumber("");
                                                setPassword("");
                                            }} 
                                            style={{background:'none', border:'none', color:'var(--color-primary)', fontSize:'12px', fontWeight:500, cursor:'pointer', padding:0, fontFamily:'inherit'}}
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="input-ring input-with-icon">
                                    <span className="material-symbols-outlined icon-left" data-icon="lock">lock</span>
                                    <input 
                                        id="password" 
                                        placeholder={isLogin ? "Enter your password" : "••••••••"}
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearErrors("password");
                                        }}
                                    />
                                    <button 
                                        aria-label="Toggle password visibility" 
                                        className="icon-right" 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined" data-icon={showPassword ? "visibility_off" : "visibility"}>
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {!isLogin && <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-outline)' }}>Must be at least 8 characters.</p>}
                                {errors.password && <p className="error-text">{errors.password}</p>}
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="language">Language Preference</label>
                                    <div className="input-ring">
                                        <select 
                                            id="language"
                                            className="input-full"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="ml">Malayalam</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            
                            {/* Action Button */}
                            <button 
                                className="submit-btn" 
                                type="submit"
                                disabled={loading}
                            >
                                <span className="btn-content">
                                    {loading ? (isLogin ? "Logging in..." : "Creating Account...") : (isLogin ? "Login" : "Create Account")}
                                    {!loading && <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>}
                                </span>
                                <div className="btn-ripple"></div>
                            </button>
                        </form>
                        
                        {/* Divider */}
                        {isLogin && (
                            <div className="divider">
                                <div className="line"></div>
                                <span>or</span>
                                <div className="line"></div>
                            </div>
                        )}
                        
                        {/* Secondary Actions */}
                        <div className="secondary-actions" style={{ marginTop: isLogin ? '0' : '16px' }}>
                            <p>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setErrors({});
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        fontFamily: 'inherit',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'var(--color-primary)',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: '2px'
                                    }}
                                >
                                    {isLogin ? "Create an account" : "Login"}
                                </button>
                            </p>
                        </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Global Footer */}
            <footer className="global-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span>© 2024 LoadLink Operations. All rights reserved.</span>
                    </div>
                    <div className="footer-right">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <div className="language-selector">
                            <span className="material-symbols-outlined" data-icon="language">language</span>
                            <span>EN (US)</span>
                            <span className="material-symbols-outlined" data-icon="arrow_drop_down">arrow_drop_down</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;
