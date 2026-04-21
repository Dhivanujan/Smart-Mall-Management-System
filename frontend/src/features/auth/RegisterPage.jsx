import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api/client";
export const RegisterPage = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setIsSubmitting(true);
        try {
            await apiClient.post("/api/v1/auth/register", {
                email,
                full_name: fullName,
                password,
            });
            navigate("/login", { state: { registered: true } });
        }
        catch (err) {
            const msg = err?.response?.data
                ?.detail ?? "Registration failed. Please try again.";
            setError(msg);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="app-page auth-page auth-page-register">
            <div className="app-page-inner auth-register-wrapper animate-fade-in-up">
                <div className="app-card auth-card auth-register-card">
                    <div className="app-card-header">
                        <Link to="/login" className="auth-back-link">
                            ← Back to login
                        </Link>
                        <div className="app-badge auth-badge" aria-label="Create account badge">
                            <span className="app-badge-pill auth-badge-pill">✨</span>
                            New account setup
                        </div>
                        <h2 className="app-card-title auth-register-title">Create your Smart Mall account</h2>
                        <p className="app-card-subtitle">
                            Set up your profile to access queue updates, parking reservations, loyalty rewards, and more.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="app-form auth-form-grid">
                        <label className="app-field-label">
                            <span>Full name</span>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="app-input" placeholder="Jane Doe" required/>
                        </label>

                        <label className="app-field-label">
                            <span>Email address</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="app-input" placeholder="you@example.com" required autoFocus/>
                        </label>

                        <label className="app-field-label">
                            <span>Password</span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="app-input" placeholder="At least 6 characters" required minLength={6}/>
                        </label>

                        <label className="app-field-label">
                            <span>Confirm password</span>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="app-input" placeholder="Repeat password" required minLength={6}/>
                        </label>

                        {error && (<div className="error-banner">
                                <span className="error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>)}

                        <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? (<span className="auth-loading-content">
                                    <span className="auth-spinner"/>
                                    Creating account...
                                </span>) : ("Create account")}
                        </button>
                    </form>

                    <div className="auth-footer-text">
                        Already have an account? <Link to="/login" className="auth-inline-link">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>);
};
