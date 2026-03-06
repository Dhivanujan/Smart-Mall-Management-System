import React from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/constants/navigation";

export const AdminLayout: React.FC = () => {
	return (
		<DashboardLayout title="Store Admin" navItems={ADMIN_NAV}>
			<Outlet />
		</DashboardLayout>
	);
};
