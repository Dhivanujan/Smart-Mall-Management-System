import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/app/routing/AppRoutes";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { GlobalCommandPalette } from "@/components/GlobalCommandPalette";
import "@/styles/global.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <GlobalCommandPalette />
                        <AppRoutes />
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </React.StrictMode>
    );
}
