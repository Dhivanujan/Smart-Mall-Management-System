import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const isLoading = useAuthStore((state) => state.isLoading);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};
