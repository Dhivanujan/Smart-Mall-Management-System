import React from "react";
import { Link } from "react-router-dom";
export const NotFoundPage = () => (<div className="not-found-page min-h-screen flex flex-col items-center justify-center bg-background text-center">
		<div className="not-found-code text-6xl font-bold text-primary mb-2">404</div>
		<h1 style={{ margin: "0.5rem 0 0.75rem", fontSize: "1.5rem", fontWeight: 600 }}>
			Page not found
		</h1>
		<p style={{ color: "var(--color-text-muted)", maxWidth: "380px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
			The page you&apos;re looking for doesn&apos;t exist or has been moved.
			Check the URL or head back to the homepage.
		</p>
		<Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4">
			← Back to homepage
		</Link>
	</div>);
