import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "@/app/routing/AppRoutes";
import { AuthProvider } from "@/app/providers/AuthProvider";
import "@/styles/global.css";

const rootElement = document.getElementById("root");

if (rootElement) {
	const root = ReactDOM.createRoot(rootElement as HTMLElement);

	root.render(
		<React.StrictMode>
			<BrowserRouter>
				<AuthProvider>
					<AppRoutes />
				</AuthProvider>
			</BrowserRouter>
		</React.StrictMode>
	);
}

