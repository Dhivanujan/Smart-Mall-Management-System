import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { apiClient } from "@/services/api/client";

import type { AuthUser, UserRole } from "@/types";

export type { UserRole, AuthUser };

interface AuthContextValue {
	user: AuthUser | null;
	token: string | null;
	isLoading: boolean;
	login: (params: { username: string; password: string }) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "smartmall_auth";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as { token: string; user: AuthUser };
				setToken(parsed.token);
				setUser(parsed.user);
			} catch {
				window.localStorage.removeItem(STORAGE_KEY);
			}
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (token) {
			apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
		} else {
			delete apiClient.defaults.headers.common.Authorization;
		}
	}, [token]);

	const login = useCallback(async ({ username, password }: { username: string; password: string }) => {
		setIsLoading(true);
		try {
			const tokenResponse = await apiClient.post(
				"/api/v1/auth/login",
				new URLSearchParams({
					username,
					password,
				}),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				},
			);
			const accessToken: string = tokenResponse.data.access_token;
			setToken(accessToken);
			apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

			const meResponse = await apiClient.get<AuthUser>("/api/v1/auth/me");
			const loggedInUser = meResponse.data;
			setUser(loggedInUser);
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: accessToken, user: loggedInUser }));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		setToken(null);
		window.localStorage.removeItem(STORAGE_KEY);
		delete apiClient.defaults.headers.common.Authorization;
	}, []);

	const value: AuthContextValue = {
		user,
		token,
		isLoading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return ctx;
};
