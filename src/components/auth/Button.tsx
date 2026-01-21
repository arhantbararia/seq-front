"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function Button({
    className,
    isLoading,
    disabled,
    children,
    variant = 'primary',
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-black text-white hover:bg-neutral-800 border border-transparent",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-transparent",
        outline: "bg-transparent text-neutral-900 border border-neutral-300 hover:bg-neutral-50",
        ghost: "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent"
    };

    return (
        <button
            disabled={isLoading || disabled}
            className={cn(
                "flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {children}
        </button>
    );
}
