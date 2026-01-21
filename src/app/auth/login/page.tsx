"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${backendUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // The backend expects specific fields. Assuming standard email/password here.
                    // Adjust if backend expects x-www-form-urlencoded (OAuth2 standard) 
                    // or json. Based on user prompt: POST /auth/login
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await res.json();
            // Expecting { access_token: "...", token_type: "bearer" }
            login(data.access_token);
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
            heading="Welcome back"
            subheading={
                <>
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="text-black font-bold hover:underline">
                        Sign up
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <div className="flex justify-end">
                    <Link href="#" className="text-sm font-bold text-neutral-500 hover:text-black">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" isLoading={isLoading}>
                    Sign in
                </Button>
            </form>

            <SocialAuth />
        </AuthLayout>
    );
}
