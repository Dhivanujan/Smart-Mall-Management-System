import React from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SUPER_ADMIN_NAV } from "@/constants/navigation";

export const SuperAdminLayout: React.FC = () => {
	return (
		<DashboardLayout title="Super Admin" navItems={SUPER_ADMIN_NAV}>
			<Outlet />
		</DashboardLayout>
	);
};
