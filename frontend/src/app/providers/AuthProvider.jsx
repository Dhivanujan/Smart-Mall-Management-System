import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/api/client";
const AuthContext = createContext(undefined);
const STORAGE_KEY = "smartmall_auth";
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setToken(parsed.token);
                setUser(parsed.user);
            }
            catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);
    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        else {
            delete apiClient.defaults.headers.common.Authorization;
        }
    }, [token]);
    const login = useCallback(async ({ username, password }) => {
        setIsLoading(true);
        try {
            const tokenResponse = await apiClient.post("/api/v1/auth/login", new URLSearchParams({
                username,
                password,
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const accessToken = tokenResponse.data.access_token;
            setToken(accessToken);
            apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            const meResponse = await apiClient.get("/api/v1/auth/me");
            const loggedInUser = meResponse.data;
            setUser(loggedInUser);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: accessToken, user: loggedInUser }));
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(STORAGE_KEY);
        delete apiClient.defaults.headers.common.Authorization;
    }, []);
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
