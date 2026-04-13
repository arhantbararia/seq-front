"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useAuth } from "@/hooks/useAuth";
import { httpClient } from "@/lib/httpClient";
import { Loader2 } from "lucide-react";

function RegisterForm() {
    const { register } = useAuth();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    const checkUsername = async (username: string) => {
        if (username.length < 3) {
            setUsernameError("Username must be at least 3 characters");
            return;
        }
        setIsCheckingUsername(true);
        setUsernameError("");
        try {
            await httpClient.get(`/api/v1/check-username?username=${username}`);
            // Success means available
        } catch (err: any) {
            if (err.response?.status === 409 || err.response?.status === 400) {
                setUsernameError(err.response.data.detail || "Username already taken");
            } else {
                setUsernameError("Failed to check username");
            }
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setFormData({ ...formData, username: value });
        
        // Debounce username check
        const timer = setTimeout(() => {
            if (value) checkUsername(value);
        }, 500);
        return () => clearTimeout(timer);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (usernameError) {
            setError("Please fix the username issue first");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const next = searchParams.get('next') || undefined;
            const state = searchParams.get('state');
            const redirectUrl = (next && state) ? `${next}?state=${state}` : next;

            await register(formData.email, formData.password, formData.username, redirectUrl);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail[0].msg);
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError(err.message || "An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            heading="Create an account"
            subheading={
                <>
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-black font-bold hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}
                <Input
                    label="Username"
                    type="text"
                    placeholder="unique_username"
                    value={formData.username}
                    onChange={handleUsernameChange}
                    error={usernameError}
                    required
                    minLength={3}
                />
                <Input
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                />
                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                />
                <Button type="submit" isLoading={isLoading}>
                    Create account
                </Button>
            </form>

            <SocialAuth />
        </AuthLayout>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
