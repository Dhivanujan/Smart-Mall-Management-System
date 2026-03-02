import React from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../../features/auth/LoginPage";
import { AdminDashboardPage } from "../../features/store-admin/AdminDashboardPage";
import { SuperAdminDashboardPage } from "../../features/super-admin/SuperAdminDashboardPage";
import { HomePage } from "../../pages/HomePage";

export const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />

			<Route element={<ProtectedRoute requireRole="admin" />}>
				<Route path="/admin" element={<AdminDashboardPage />} />
			</Route>

			<Route element={<ProtectedRoute requireRole="super_admin" />}>
				<Route path="/super-admin" element={<SuperAdminDashboardPage />} />
			</Route>

			<Route path="*" element={<HomePage />} />
		</Routes>
	);
};
