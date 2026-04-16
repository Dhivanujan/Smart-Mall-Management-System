import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/app/routing/AppRoutes";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import "@/styles/global.css";
const rootElement = document.getElementById("root");
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<React.StrictMode>
			<BrowserRouter>
				<AuthProvider>
					<GlobalCommandPalette />
					<AppRoutes />
				</AuthProvider>
			</BrowserRouter>
		</React.StrictMode>);
}
