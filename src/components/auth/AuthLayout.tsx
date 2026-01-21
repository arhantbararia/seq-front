"use client";

import React from "react";
import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
    heading: string;
    subheading?: React.ReactNode;
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
            <Link href="/" className="mb-8 block">
                <h1 className="text-4xl font-black tracking-tighter text-black">
                    sequels<span className="text-blue-600">.</span>
                </h1>
            </Link>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                        {heading}
                    </h2>
                    {subheading && (
                        <div className="text-sm text-neutral-500">
                            {subheading}
                        </div>
                    )}
                </div>

                {children}
            </div>
        </div>
    );
}
