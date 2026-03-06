import React from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CUSTOMER_NAV } from "@/constants/navigation";

export const CustomerLayout: React.FC = () => {
	return (
		<DashboardLayout title="My Dashboard" navItems={CUSTOMER_NAV}>
			<Outlet />
		</DashboardLayout>
	);
};
