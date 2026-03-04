import React from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../../features/auth/LoginPage";
import { AdminDashboardPage } from "../../features/store-admin/AdminDashboardPage";
import { SuperAdminDashboardPage } from "../../features/super-admin/SuperAdminDashboardPage";
import { AdminStoresPage } from "../../features/store-admin/AdminStoresPage";
import { SuperAdminAdminsPage } from "../../features/super-admin/SuperAdminAdminsPage";
import { SuperAdminTenantsPage } from "../../features/super-admin/SuperAdminTenantsPage";
import { MallOverviewPage } from "../../features/customer/MallOverviewPage";
import { StoreDetailsPage } from "../../features/customer/StoreDetailsPage";
import { HomePage } from "../../pages/HomePage";

export const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/mall" element={<MallOverviewPage />} />
			<Route path="/mall/stores/:storeId" element={<StoreDetailsPage />} />

			<Route element={<ProtectedRoute requireRole="admin" />}>
				<Route path="/admin" element={<AdminDashboardPage />} />
				<Route path="/admin/stores" element={<AdminStoresPage />} />
			</Route>

			<Route element={<ProtectedRoute requireRole="super_admin" />}>
				<Route path="/super-admin" element={<SuperAdminDashboardPage />} />
				<Route path="/super-admin/admins" element={<SuperAdminAdminsPage />} />
				<Route path="/super-admin/tenants" element={<SuperAdminTenantsPage />} />
			</Route>

			<Route path="*" element={<HomePage />} />
		</Routes>
	);
};
