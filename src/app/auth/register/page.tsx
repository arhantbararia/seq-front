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

    const nextParam = searchParams.get('next') || undefined;
    const stateParam = searchParams.get('state');
    const redirectUrl = (nextParam && stateParam) ? `${nextParam}?state=${stateParam}` : nextParam;

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

    const validatePassword = (pass: string) => {
        const minLength = pass.length >= 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

        if (!minLength) return "Password must be at least 8 characters long";
        if (!hasUpper) return "Password must contain at least one uppercase letter";
        if (!hasLower) return "Password must contain at least one lowercase letter";
        if (!hasNumber) return "Password must contain at least one number";
        if (!hasSpecial) return "Password must contain at least one special character (!@#$%^&*)";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (usernameError) {
            setError("Please fix the username issue first");
            return;
        }

        const passError = validatePassword(formData.password);
        if (passError) {
            setError(passError);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
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

            <SocialAuth redirectUrl={redirectUrl} />
            <p className="mt-4 text-sm text-neutral-500">
                By creating an account, you agree to our{' '}
                <Link href="/terms-and-privacy" className="text-black font-medium hover:underline">
                    Terms & Privacy
                </Link>
                .
            </p>
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
