"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut, User } from "lucide-react";

export function Navbar() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md dark:bg-black/80 border-b border-zinc-100 dark:border-zinc-800">
            <Link href="/" className="text-3xl font-black tracking-tighter">
                Sequels
            </Link>
            <div className="flex items-center gap-4">
                <Link href="/explore">
                    <Button variant="ghost" size="default">
                        Explore
                    </Button>
                </Link>
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
                        
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" title="Profile">
                                    <User className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/connections">
                                <Button variant="ghost" size="icon" title="Manage Connections"><Settings className="w-4 h-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout"><LogOut className="w-4 h-4" /></Button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
