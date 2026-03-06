import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiClient } from "@/services/api/client";

export const RegisterPage: React.FC = () => {
	const navigate = useNavigate();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent) => {
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
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { detail?: string } } })?.response?.data
					?.detail ?? "Registration failed. Please try again.";
			setError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="app-page" style={{ alignItems: "stretch" }}>
			<div
				className="app-page-inner animate-fade-in-up"
				style={{ maxWidth: 480, margin: "0 auto" }}
			>
				<div className="app-card">
					<div className="app-card-header">
						<Link
							to="/login"
							style={{
								fontSize: "0.82rem",
								color: "var(--color-text-muted)",
								textDecoration: "none",
								marginBottom: "0.75rem",
								display: "inline-block",
							}}
						>
							← Back to login
						</Link>
						<h2 className="app-card-title">Create your account</h2>
						<p className="app-card-subtitle">
							Sign up to access queues, parking, loyalty rewards and more.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="app-form">
						<label className="app-field-label">
							<span>Full name</span>
							<input
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="app-input"
								placeholder="Jane Doe"
								required
							/>
						</label>

						<label className="app-field-label">
							<span>Email address</span>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="app-input"
								placeholder="you@example.com"
								required
								autoFocus
							/>
						</label>

						<label className="app-field-label">
							<span>Password</span>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="app-input"
								placeholder="At least 6 characters"
								required
								minLength={6}
							/>
						</label>

						<label className="app-field-label">
							<span>Confirm password</span>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="app-input"
								placeholder="Repeat password"
								required
								minLength={6}
							/>
						</label>

						{error && (
							<div className="error-banner" style={{ marginBottom: 0 }}>
								<span className="error-icon">⚠️</span>
								<span>{error}</span>
							</div>
						)}

						<button
							type="submit"
							className="btn btn-primary"
							disabled={isSubmitting}
							style={{ width: "100%", marginTop: "0.25rem" }}
						>
							{isSubmitting ? (
								<span
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
									}}
								>
									<span
										style={{
											width: 14,
											height: 14,
											border: "2px solid rgba(255,255,255,0.3)",
											borderTopColor: "#fff",
											borderRadius: "999px",
											animation: "spin 0.6s linear infinite",
											display: "inline-block",
										}}
									/>
									Creating account…
								</span>
							) : (
								"Create account →"
							)}
						</button>
					</form>

					<div
						style={{
							marginTop: "1rem",
							textAlign: "center",
							fontSize: "0.78rem",
							color: "var(--color-text-muted)",
						}}
					>
						Already have an account?{" "}
						<Link
							to="/login"
							style={{ color: "var(--color-accent-strong)" }}
						>
							Sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
