"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { httpClient, setAccessToken } from '@/lib/httpClient';

export interface User {
    id: string;
    email: string;
    username: string;
    is_active?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, redirect?: string) => Promise<void>;
    loginWithToken: (accessToken: string, refreshToken?: string, redirect?: string) => Promise<void>;
    register: (email: string, password: string, username: string, redirect?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchMe = async () => {
        try {
            const res = await httpClient.get('/api/v1/me');
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        const handleLogoutEvent = () => {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('refresh_token');
            router.push('/auth/login');
        };
        window.addEventListener('auth-logout', handleLogoutEvent);
        return () => window.removeEventListener('auth-logout', handleLogoutEvent);
    }, [router]);

    useEffect(() => {
        const initializeAuth = async () => {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const res = await fetch(`${(process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/token/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setAccessToken(data.access_token);
                        if (data.refresh_token) {
                            localStorage.setItem('refresh_token', data.refresh_token);
                        }
                        await fetchMe();
                    } else {
                        localStorage.removeItem('refresh_token');
                    }
                } catch (error) {
                    console.error("Failed default auth init:", error);
                    localStorage.removeItem('refresh_token');
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const handlePendingWorkflow = async () => {
        const pendingValue = sessionStorage.getItem('pendingWorkflow');
        if (pendingValue) {
            try {
                const workflowData = JSON.parse(pendingValue);
                await httpClient.post('/api/v1/workflows/', workflowData);
                sessionStorage.removeItem('pendingWorkflow');
                return true;
            } catch (e) {
                console.error("Failed to auto-save pending workflow:", e);
            }
        }
        return false;
    };

    const loginWithToken = async (accessToken: string, refreshToken?: string, redirect?: string) => {
        setAccessToken(accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
        await fetchMe();
        // Migrate anon drafts into per-user keys if present
        try {
            const username = (await (async () => { const res = await httpClient.get('/api/v1/me'); return res.data.username; })()) as string;
            // migrate pendingWorkflowCreate:anon -> pendingWorkflowCreate:{username}
            const anonKey = 'pendingWorkflowCreate:anon';
            const userKey = `pendingWorkflowCreate:${username}`;
            const anonDraft = sessionStorage.getItem(anonKey);
            const existingUserDraft = sessionStorage.getItem(userKey);
            if (anonDraft && !existingUserDraft) {
                try {
                    const parsed = JSON.parse(anonDraft);
                    parsed.owner = username;
                    sessionStorage.setItem(userKey, JSON.stringify(parsed));
                    sessionStorage.removeItem(anonKey);
                } catch (e) {
                    console.debug('Failed to migrate anon draft', e);
                }
            } else if (anonDraft && existingUserDraft) {
                // archive to avoid overwrite
                try { sessionStorage.setItem(anonKey + ':archived', anonDraft); sessionStorage.removeItem(anonKey); } catch(e) { }
            }

            // migrate pendingWorkflow (full) if present and no user copy
            const anonFull = sessionStorage.getItem('pendingWorkflow');
            const userFullKey = `pendingWorkflow:${username}`;
            if (anonFull && !sessionStorage.getItem(userFullKey)) {
                sessionStorage.setItem(userFullKey, anonFull);
                sessionStorage.removeItem('pendingWorkflow');
            }
        } catch (e) {
            console.debug('Migration check failed', e);
        }

        // If any pending workflow drafts exist (full or per-user), restore builder
        const hasPending = !!sessionStorage.getItem('pendingWorkflow') || Object.keys(sessionStorage).some(k => k.startsWith('pendingWorkflowCreate:'));
        if (hasPending) {
            router.push('/create?state=restored');
        } else {
            router.push(redirect || '/dashboard');
        }
    };

    const login = async (email: string, password: string, redirect?: string) => {
        const res = await httpClient.post('/api/v1/auth/login', { email, password });
        const { access_token, refresh_token } = res.data;
        await loginWithToken(access_token, refresh_token, redirect);
    };

    const register = async (email: string, password: string, username: string, redirect?: string) => {
        await httpClient.post('/api/v1/auth/register', { email, password, username });
        await login(email, password, redirect);
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                await httpClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
            } catch (e) {
                console.error("Logout API failed:", e);
            }
        }
        setAccessToken(null);
        localStorage.removeItem('refresh_token');
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithToken, register, logout, refreshUser: fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
