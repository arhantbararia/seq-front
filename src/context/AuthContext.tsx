"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/lib/utils';

interface User {
    email: string;
    // Add other user properties as needed
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const token = getAuthToken();
            if (token) {
                // Ideally, verify token with backend here or decode JWT to get user info.
                // For now, we'll assume if token exists, user is logged in.
                // You might want to decode the JWT on the client to get the email instantly
                // or fetch /me endpoint. A basic valid check:
                if (token.split('.').length === 3) {
                    setUser({ email: 'user@example.com' }); // Placeholder until we parse/fetch
                } else {
                    removeAuthToken();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (token: string) => {
        setAuthToken(token);
        // Simple parse to simulate user, in real app verify/fetch me
        setUser({ email: 'user@example.com' });
        setIsLoading(false);
        router.push('/dashboard');
    };

    const logout = () => {
        removeAuthToken();
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
