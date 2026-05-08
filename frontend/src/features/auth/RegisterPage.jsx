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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/api/v1/auth/register", {
        email,
        full_name: fullName,
        password,
      });

      navigate("/login", { state: { registered: true } });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-[pulse_4s_ease-in-out_infinite]"></div>
      
      <div className="auth-card space-y-6 animate-scale-in relative z-10 backdrop-blur-xl border border-border/50 bg-card/80 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Customer account
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground mt-4">Create Account</h2>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
            Join Smart Mall to manage queues, parking, and rewards
          </p>
        </div>

        <Link
          to="/login"
          className="auth-back-link justify-center w-full hover:-translate-x-1 transition-transform"
        >
          ← Back to login
        </Link>

        <form onSubmit={handleSubmit} className="app-form">
          <label className="app-field-label">
            <span className="font-medium text-foreground/90">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="app-input focus:ring-2 focus:ring-primary/20"
              required
            />
          </label>

          <label className="app-field-label">
            <span className="font-medium text-foreground/90">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="app-input focus:ring-2 focus:ring-primary/20"
              required
            />
          </label>

          <label className="app-field-label">
            <span className="font-medium text-foreground/90">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="app-input focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </label>

          <label className="app-field-label">
            <span className="font-medium text-foreground/90">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="app-input focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </label>

          {error && (
            <div className="error-banner animate-fade-in" role="alert">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary auth-submit-btn shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)]"
          >
            {isSubmitting ? (
              <span className="auth-loading-content">
                <span className="auth-spinner" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-footer-text pt-2 border-t border-border/50">
          Already have an account?{" "}
          <Link to="/login" className="auth-inline-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};