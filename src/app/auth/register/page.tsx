"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${backendUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Registration failed");
            }

            const data = await res.json();
            // If registration returns a token, login immediately.
            // Otherwise, redirect to login (or login automatically if flow allows)
            if (data.access_token) {
                login(data.access_token);
            } else {
                // Fallback or specific message
                // For this task, assuming we want to get them in ASAP, but if backend
                // doesn't return token on register, we might need to login manually.
                // Let's assume for now we might need to login after register if no token.
                // Attempt auto-login if no token provided but registration was successful
                const loginRes = await fetch(`${backendUrl}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formData.email,
                        password: formData.password,
                    })
                });

                const loginData = await loginRes.json();
                if (loginRes.ok && loginData.access_token) {
                    login(loginData.access_token);
                } else {
                    window.location.href = '/auth/login?registered=true';
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
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
