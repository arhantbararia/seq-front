"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(searchParams.get("error") || "");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const nextParam = searchParams.get('next') || undefined;
    const stateParam = searchParams.get('state');
    const redirectUrl = (nextParam && stateParam) ? `${nextParam}?state=${stateParam}` : nextParam;
    
    const searchString = searchParams.toString();
    const registerUrl = `/auth/register${searchString ? `?${searchString}` : ''}`;

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            // Optional formatting of error message.
            if (errorParam === 'InvalidCallback') {
                setError("Authentication failed. Please try again.");
            } else {
                setError(errorParam);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
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
                    <Link href={registerUrl} className="text-black font-bold hover:underline">
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

            <SocialAuth redirectUrl={redirectUrl} />
            <p className="mt-4 text-sm text-neutral-500">
                By signing in, you agree to our{' '}
                <Link href="/terms-and-privacy" className="text-black font-medium hover:underline">
                    Terms & Privacy
                </Link>
                .
            </p>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
