import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";

interface ProtectedRouteProps {
	requireRole?: "admin" | "super_admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireRole }) => {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
				<div className="loading-spinner" />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (requireRole === "admin" && !["admin", "super_admin"].includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	if (requireRole === "super_admin" && user.role !== "super_admin") {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};
