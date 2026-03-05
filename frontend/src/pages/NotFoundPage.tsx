import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => (
	<div className="not-found-page">
		<div className="not-found-code">404</div>
		<h1 style={{ margin: "0.5rem 0 0.75rem", fontSize: "1.5rem", fontWeight: 600 }}>
			Page not found
		</h1>
		<p style={{ color: "var(--color-text-muted)", maxWidth: "380px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
			The page you&apos;re looking for doesn&apos;t exist or has been moved.
			Check the URL or head back to the homepage.
		</p>
		<Link to="/" className="btn btn-primary">
			← Back to homepage
		</Link>
	</div>
);
