import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

const ROLE_OPTIONS = [
  {
    role: "customer",
    label: "Customer",
    title: "Customer experience",
    description: "Browse stores, join queues, reserve parking, and track offers.",
    username: "customer@example.com",
    password: "customer123",
    accent: "from-sky-500 to-cyan-400",
  },
  {
    role: "admin",
    label: "Store admin",
    title: "Store operations",
    description: "Manage products, queues, bookings, and customer support.",
    username: "admin@example.com",
    password: "admin123",
    accent: "from-amber-500 to-orange-400",
  },
  {
    role: "super_admin",
    label: "Super admin",
    title: "Platform oversight",
    description: "Monitor malls, admin accounts, analytics, and governance.",
    username: "superadmin@example.com",
    password: "super123",
    accent: "from-emerald-500 to-teal-400",
  },
];

const ROLE_ROUTES = {
  customer: "/dashboard",
  admin: "/admin",
  super_admin: "/super-admin",
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("customer");

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRole = useMemo(() => ROLE_OPTIONS.find((option) => option.role === selectedRole) ?? ROLE_OPTIONS[0], [selectedRole]);

  useEffect(() => {
    if (user) {
      navigate(ROLE_ROUTES[user.role] ?? "/", { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    const requestedRole = searchParams.get("role");
    if (requestedRole && ROLE_OPTIONS.some((option) => option.role === requestedRole)) {
      setSelectedRole(requestedRole);
    }
  }, [searchParams]);

  const applyDemoCredentials = (role) => {
    const preset = ROLE_OPTIONS.find((option) => option.role === role) ?? ROLE_OPTIONS[0];
    setSelectedRole(preset.role);
    setUsername(preset.username);
    setPassword(preset.password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({ username, password });
      const from = location.state?.from?.pathname;
      const fallbackPath = ROLE_ROUTES[authenticatedUser?.role] ?? "/";
      navigate(from ?? fallbackPath, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid credentials. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page min-h-screen grid md:grid-cols-[1.15fr_0.95fr] bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="hidden md:flex items-center justify-center">
        <div className="max-w-xl space-y-8 p-10 rounded-[2rem] border border-border bg-card/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="space-y-4">
            <Link to="/" className="auth-back-link text-sm">
              ← Back to home
            </Link>
            <div className="auth-badge inline-flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Single login panel, role-aware access
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight text-foreground">
              Sign in once, then land in the right workspace.
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Customer, store admin, and super admin all use the same secure panel. Choose an access mode, load the demo credentials if needed, and the app will route you automatically.
            </p>
          </div>

          <div className="grid gap-3">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => applyDemoCredentials(option.role)}
                className={`demo-account-btn ${selectedRole === option.role ? "active" : ""}`}
              >
                <div className={`auth-account-icon w-10 h-10 rounded-xl bg-gradient-to-br ${option.accent} text-white flex items-center justify-center shadow-sm`}>
                  {option.role === "customer" ? "🛍️" : option.role === "admin" ? "📊" : "🏗️"}
                </div>
                <div>
                  <div className="auth-account-role">{option.label}</div>
                  <div className="auth-account-desc">{option.title}</div>
                  <div className="auth-account-email">Load demo credentials</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="auth-card space-y-6 animate-fade-in-up">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {activeRole.label} access
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use the same form for every role. The panel routes you based on the account you use.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => setSelectedRole(option.role)}
                className={`rounded-2xl border px-3 py-3 text-left transition-all ${selectedRole === option.role ? "border-primary bg-primary/10 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]" : "border-border bg-background hover:border-ring hover:bg-secondary/50"}`}
              >
                <div className="text-sm font-semibold text-foreground">{option.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="app-form">
            <label className="app-field-label">
              <span className="font-medium">Email or Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeRole.username}
                className="app-input"
                autoComplete="username"
                required
              />
            </label>

            <label className="app-field-label">
              <span className="font-medium">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="app-input"
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <div className="error-banner" role="alert">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary auth-submit-btn"
            >
              {isSubmitting ? (
                <span className="auth-loading-content">
                  <span className="auth-spinner" />
                  Signing in...
                </span>
              ) : (
                `Continue as ${activeRole.label}`
              )}
            </button>
          </form>

          <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Demo access</p>
            <p className="mt-1">
              Tap a role on the left to auto-fill the seeded credentials, or keep your own username and password and the app will route you to the correct dashboard after login.
            </p>
          </div>

          <p className="auth-footer-text">
            Don’t have an account?{" "}
            <Link to="/register" className="auth-inline-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};