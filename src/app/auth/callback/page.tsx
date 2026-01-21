"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            login(token);
        } else {
            // Handle error or missing token
            router.push("/auth/login?error=InvalidCallback");
        }
    }, [searchParams, login, router]);

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
            <p className="text-sm font-bold text-neutral-500">Authenticating...</p>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-black" /></div>}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
