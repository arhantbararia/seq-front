"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null; // Or a loading skeleton

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md dark:bg-black/80 border-b border-zinc-100 dark:border-zinc-800">
            <Link href="/" className="text-3xl font-black tracking-tighter">
                Sequels
            </Link>
            <div className="flex items-center gap-4">
                {!isAuthenticated ? (
                    <>
                        <Link href="/auth/login">
                            <Button variant="ghost" size="default">
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button variant="default" size="default">
                                Sign Up
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="default">
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/create">
                            <Button variant="default" size="default">
                                Create
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
