"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut, User, Menu, X, Plus, Layers, Search, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import DarkModeToggle from "./ui/DarkModeToggle";

export function Navbar() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    if (isLoading) return null;

    const navLinks = [
        { name: "Explore", href: "/explore", icon: Search },
        ...(isAuthenticated ? [
            { name: "Dashboard", href: "/dashboard", icon: Layers },
            { name: "Create", href: "/create", icon: Plus },
        ] : [])
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 transition-all duration-300">
                <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter hover:opacity-70 transition-opacity">
                    Sequels
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Button variant="ghost" className="rounded-full px-5 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                {link.name}
                            </Button>
                        </Link>
                    ))}
                    
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-2 ml-4">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="rounded-full px-6 font-bold">Login</Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button variant="default" className="rounded-full px-6 font-bold bg-black dark:bg-white text-white dark:text-black">Sign Up</Button>
                            </Link>
                            <DarkModeToggle />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                            <DarkModeToggle />
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" title="Profile" className="rounded-full w-10 h-10">
                                    <User className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/connections">
                                <Button variant="ghost" size="icon" title="Settings" className="rounded-full w-10 h-10">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="rounded-full w-10 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Fullscreen Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="fixed inset-0 z-[90] bg-white dark:bg-black p-8 pt-32 flex flex-col items-center text-center space-y-12 overflow-y-auto"
                    >
                        <div className="space-y-6 w-full max-w-sm">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Navigation</div>
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                                    <div className="group flex items-center justify-between p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 active:scale-95 transition-all">
                                        <div className="flex items-center gap-4 text-2xl font-black italic tracking-tight">
                                            <link.icon className="text-zinc-900 dark:text-white" size={24} />
                                            {link.name}
                                        </div>
                                        <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="space-y-4 w-full max-w-sm">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Account</div>
                            {!isAuthenticated ? (
                                <div className="grid grid-cols-1 gap-4">
                                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-16 rounded-3xl text-xl font-bold border-2">Login</Button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full h-16 rounded-3xl text-xl font-bold bg-black text-white dark:bg-white dark:text-black">Sign Up</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                                            <User size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-lg">Profile</div>
                                            <div className="text-xs text-zinc-500">{user?.email}</div>
                                        </div>
                                    </Link>
                                    <Link href="/connections" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                                            <Settings size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-lg">Settings</div>
                                            <div className="text-xs text-zinc-500">Integrations</div>
                                        </div>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-16 rounded-3xl text-xl font-bold border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                        onClick={() => { logout(); setIsMenuOpen(false); }}
                                    >
                                        <LogOut size={20} className="mr-2" /> Logout
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 opacity-40 text-[10px] font-bold uppercase tracking-widest italic">
                            Sequels &copy; 2026 Premium Automation
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
        </svg>
    )
}
