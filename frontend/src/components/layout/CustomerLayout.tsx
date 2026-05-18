import React from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CUSTOMER_NAV } from "@/constants/navigation";
export const CustomerLayout = () => {
    return (<DashboardLayout title="My Dashboard" navItems={CUSTOMER_NAV}>
			<Outlet />
		</DashboardLayout>);
};
