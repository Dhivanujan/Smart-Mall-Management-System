import React from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { AdminDashboardPage } from "@/features/store-admin/AdminDashboardPage";
import { SuperAdminDashboardPage } from "@/features/super-admin/SuperAdminDashboardPage";
import { AdminStoresPage } from "@/features/store-admin/AdminStoresPage";
import { SuperAdminAdminsPage } from "@/features/super-admin/SuperAdminAdminsPage";
import { SuperAdminTenantsPage } from "@/features/super-admin/SuperAdminTenantsPage";
import { MallOverviewPage } from "@/features/customer/MallOverviewPage";
import { StoreDetailsPage } from "@/features/customer/StoreDetailsPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
// Customer pages
import { CustomerDashboardPage } from "@/features/customer/CustomerDashboardPage";
import { QueuePage } from "@/features/customer/QueuePage";
import { ParkingPage } from "@/features/customer/ParkingPage";
import { LoyaltyPage } from "@/features/customer/LoyaltyPage";
import { OffersPage } from "@/features/customer/OffersPage";
import { NotificationsPage } from "@/features/customer/NotificationsPage";
import { ComplaintsPage } from "@/features/customer/ComplaintsPage";
import { MallMapPage } from "@/features/customer/MallMapPage";
import { ServicesPage } from "@/features/customer/ServicesPage";
// Store admin pages
import { ProductManagementPage } from "@/features/store-admin/ProductManagementPage";
import { OfferManagementPage } from "@/features/store-admin/OfferManagementPage";
import { SalesDashboardPage } from "@/features/store-admin/SalesDashboardPage";
import { QueueMonitoringPage } from "@/features/store-admin/QueueMonitoringPage";
import { CustomerInsightsPage } from "@/features/store-admin/CustomerInsightsPage";
// Super admin pages
import { AnalyticsPage } from "@/features/super-admin/AnalyticsPage";
import { CrowdTrafficPage } from "@/features/super-admin/CrowdTrafficPage";
import { QueueEfficiencyPage } from "@/features/super-admin/QueueEfficiencyPage";
import { ParkingManagementPage } from "@/features/super-admin/ParkingManagementPage";
import { StoreManagementPage } from "@/features/super-admin/StoreManagementPage";
import { UserManagementPage } from "@/features/super-admin/UserManagementPage";
import { ComplaintManagementPage } from "@/features/super-admin/ComplaintManagementPage";
// Layout wrappers for route groups
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
export const AppRoutes = () => {
    return (<Routes>
			<Route path="/" element={<HomePage />}/>
			<Route path="/login" element={<LoginPage />}/>
			<Route path="/register" element={<RegisterPage />}/>
			<Route path="/mall" element={<MallOverviewPage />}/>
			<Route path="/services" element={<ServicesPage />}/>
            <Route path="/mall/stores/:storeId" element={<StoreDetailsPage />}/>
			<Route path="/stores/:storeId" element={<StoreDetailsPage />}/>
			<Route path="/offers" element={<OffersPage />}/>
			<Route path="/map" element={<MallMapPage />}/>

			{/* Customer routes with layout */}
			<Route element={<ProtectedRoute requireRole="customer"/>}>
				<Route element={<CustomerLayout />}>
					<Route path="/dashboard" element={<CustomerDashboardPage />}/>
					<Route path="/queue" element={<QueuePage />}/>
					<Route path="/parking" element={<ParkingPage />}/>
					<Route path="/loyalty" element={<LoyaltyPage />}/>
					<Route path="/notifications" element={<NotificationsPage />}/>
					<Route path="/complaints" element={<ComplaintsPage />}/>
				</Route>
			</Route>

			{/* Store admin routes — existing pages have own DashboardLayout */}
			<Route element={<ProtectedRoute requireRole="admin"/>}>
				<Route path="/admin" element={<AdminDashboardPage />}/>
				<Route path="/admin/stores" element={<AdminStoresPage />}/>
				{/* New admin pages use layout wrapper */}
				<Route element={<AdminLayout />}>
					<Route path="/admin/products" element={<ProductManagementPage />}/>
					<Route path="/admin/offers" element={<OfferManagementPage />}/>
					<Route path="/admin/sales" element={<SalesDashboardPage />}/>
					<Route path="/admin/queue" element={<QueueMonitoringPage />}/>
					<Route path="/admin/customers" element={<CustomerInsightsPage />}/>
				</Route>
			</Route>

			{/* Super admin routes — existing pages have own DashboardLayout */}
			<Route element={<ProtectedRoute requireRole="super_admin"/>}>
				<Route path="/super-admin" element={<SuperAdminDashboardPage />}/>
				<Route path="/super-admin/admins" element={<SuperAdminAdminsPage />}/>
				<Route path="/super-admin/tenants" element={<SuperAdminTenantsPage />}/>
				{/* New super-admin pages use layout wrapper */}
				<Route element={<SuperAdminLayout />}>
					<Route path="/super-admin/analytics" element={<AnalyticsPage />}/>
					<Route path="/super-admin/crowd" element={<CrowdTrafficPage />}/>
					<Route path="/super-admin/queues" element={<QueueEfficiencyPage />}/>
					<Route path="/super-admin/parking" element={<ParkingManagementPage />}/>
					<Route path="/super-admin/stores" element={<StoreManagementPage />}/>
					<Route path="/super-admin/users" element={<UserManagementPage />}/>
					<Route path="/super-admin/complaints" element={<ComplaintManagementPage />}/>
				</Route>
			</Route>

			<Route path="*" element={<NotFoundPage />}/>
		</Routes>);
};
