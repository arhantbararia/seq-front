"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
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
            const next = searchParams.get('next') || undefined;
            const state = searchParams.get('state');
            
            // Build redirect URL if state is present
            const redirectUrl = (next && state) ? `${next}?state=${state}` : next;
            
            await login(formData.email, formData.password, redirectUrl);
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
