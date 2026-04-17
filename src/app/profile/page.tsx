'use client';

import { useEffect, useState } from "react";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
    User, Mail, ArrowRight, Loader2, 
    Layers, Zap, ShieldCheck, ExternalLink,
    ChevronRight, Settings, AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface UserProfileRead {
    id: string;
    email: string;
    username: string;
    is_active: boolean;
    connected_accounts: string[]; // UUIDs of providers
    created_workflows: string[]; // UUIDs of workflows
    subscribed_workflows_count: number;
}

interface WorkflowRead {
    name: string;
    description: string | null;
    id: string;
    user_id: string;
    active_version_id: string | null;
    status: string;
    is_enabled: boolean;
    is_public: boolean;
    created_at: string;
    updated_at: string | null;
    trigger: any;
    action: any;
    subscribers_count: number | null;
}

export default function ProfilePage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfileRead | null>(null);
    const [createdWorkflows, setCreatedWorkflows] = useState<WorkflowRead[]>([]);
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use allSettled to prevent one failing request from crashing the whole page
            const results = await Promise.allSettled([
                httpClient.get('/api/v1/me/profile'),
                httpClient.get('/api/v1/workflows/'),
                httpClient.get('/api/v1/plugins/providers')
            ]);

            const profileResult = results[0];
            const workflowsResult = results[1];
            const providersResult = results[2];

            if (profileResult.status === 'fulfilled') {
                setProfile(profileResult.value.data);
            } else {
                console.error("Profile fetch failed:", profileResult.reason);
                // Fallback: If profile fetch fails, we might still have user data from AuthContext
                // But for now, we'll mark it as a critical failure if we can't get basic profile info
                // OR we can try to continue with what we have.
            }

            if (providersResult.status === 'fulfilled') {
                setProviders(providersResult.value.data);
            }

            if (workflowsResult.status === 'fulfilled' && profileResult.status === 'fulfilled') {
                const myWorkflows = workflowsResult.value.data.filter((w: WorkflowRead) => w.user_id === profileResult.value.data.id);
                setCreatedWorkflows(myWorkflows);
            }

            if (profileResult.status === 'rejected') {
                throw new Error("Major data fetch failed");
            }

        } catch (error) {
            console.error("Failed to fetch profile data:", error);
            setError("We couldn't load your profile data. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) return;

        fetchData();
    }, [isAuthenticated, authLoading]);

    // Listen for cross-tab workflow toggles to update UI immediately
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (!e.key) return;
            if (e.key.startsWith('workflow-toggle:')) {
                try {
                    const payload = JSON.parse(e.newValue || 'null');
                    const wfId = e.key.split(':')[1];
                    if (!payload) return;
                    setCreatedWorkflows(prev => prev.map(w => w.id === wfId ? { ...w, is_enabled: !!payload.is_enabled } : w));
                } catch (err) {
                    // ignore
                }
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    // Poll created workflow statuses every 2 minutes
    useEffect(() => {
        if (!isAuthenticated) return;
        let mounted = true;
        const poll = async () => {
            const ids = createdWorkflows.map(w => w.id);
            if (ids.length === 0) return;
            const promises = ids.map(id => httpClient.get(`/api/v1/workflows/${id}/status`).then(r => ({ id, data: r.data })).catch(e => ({ id, error: e })));
            const results = await Promise.allSettled(promises);
            if (!mounted) return;
            setCreatedWorkflows(prev => {
                const copy = [...prev];
                results.forEach((res: any) => {
                    if (res.status === 'fulfilled') {
                        const payload = res.value;
                        const idx = copy.findIndex(c => c.id === payload.id);
                        if (idx !== -1) {
                            const respData = payload.data;
                            if (respData && typeof respData.is_enabled === 'boolean') {
                                copy[idx] = { ...copy[idx], is_enabled: respData.is_enabled };
                            } else if (respData && respData.status) {
                                copy[idx] = { ...copy[idx], is_enabled: respData.status === 'active' };
                            }
                        }
                    }
                });
                return copy;
            });
        };
        const id = setInterval(poll, 2 * 60 * 1000);
        return () => { mounted = false; clearInterval(id); };
    }, [isAuthenticated, createdWorkflows]);

    if (authLoading || (isAuthenticated && loading && !error)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-zinc-900 dark:text-zinc-100" />
                <p className="text-zinc-500 font-medium animate-pulse">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-zinc-400" />
                </div>
                <h1 className="text-3xl font-black mb-2 tracking-tight">Oops! Something went wrong</h1>
                <p className="text-zinc-500 mb-8 max-w-md">{error}</p>
                <Button onClick={fetchData} size="lg" className="rounded-full px-8 gap-2 bg-black dark:bg-white text-white dark:text-black">
                    <RefreshCw size={18} />
                    Try Again
                </Button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-zinc-400" />
                </div>
                <h1 className="text-3xl font-black mb-2 tracking-tight">Access Restricted</h1>
                <p className="text-zinc-500 mb-8 max-w-md">Please log in to view your detailed profile and manage your automations.</p>
                <Link href="/auth/login">
                    <Button size="lg" className="rounded-full px-8 bg-black dark:bg-white text-white dark:text-black">Login to Sequels</Button>
                </Link>
            </div>
        );
    }

    const connectedProviders = providers.filter(p => profile?.connected_accounts.includes(p.id));
    const connectedAccountIds = connectedProviders.map(p => p.id);
    const getProviderInitial = (id: string) => providers.find(p => p.id === id)?.name?.charAt(0).toUpperCase() || "?";
    const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || id;

    return (
        <div className="max-w-6xl mx-auto pb-32 pt-24 px-6">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-12 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
                <div className="bg-white dark:bg-zinc-950 p-6 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-4xl md:text-6xl font-black relative z-10">
                            {profile?.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">{profile?.username}</h1>
                            {profile?.is_active && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                    Active Account
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 text-zinc-500 font-medium">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                <Mail size={16} className="text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">{profile?.email}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                <User size={16} className="text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">Member since {profile ? new Date().getFullYear() : '---'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/connections">
                            <Button variant="outline" className="rounded-full gap-2 border-zinc-200 dark:border-zinc-800 font-bold">
                                <Settings size={18} />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                    { label: 'Subscribed Workflows', value: profile?.subscribed_workflows_count, icon: Zap },
                    { label: 'Created Workflows', value: createdWorkflows.length, icon: Layers },
                    { label: 'Connected Accounts', value: profile?.connected_accounts.length, icon: ShieldCheck },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 p-8 rounded-[2rem] hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-transform group-hover:scale-110">
                            <stat.icon size={24} className="text-zinc-900 dark:text-zinc-100" />
                        </div>
                        <div className="text-4xl font-black mb-1 tabular-nums">{stat.value}</div>
                        <div className="text-zinc-500 font-bold text-sm uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Created Workflows Section */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Created Workflows</h2>
                        <p className="text-zinc-500">Automations you've built and shared.</p>
                    </div>
                    <Link href="/create" className="text-zinc-900 dark:text-white font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        Create New <ChevronRight size={18} />
                    </Link>
                </div>

                {createdWorkflows.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {createdWorkflows.map((workflow, index) => (
                            <motion.div
                                key={workflow.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative p-6 rounded-3xl border bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex -space-x-3 items-center">
                                        <div className="relative group/trigger">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 z-10 uppercase overflow-hidden">
                                                {getProviderInitial(workflow.trigger?.plugin_provider_id)}
                                            </div>
                                            <div className={cn(
                                                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 transition-all duration-500",
                                                connectedAccountIds.includes(workflow.trigger?.plugin_provider_id)
                                                    ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                    : "bg-zinc-300 grayscale"
                                            )} />
                                        </div>
                                        <div className="relative group/action">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-700 z-0 uppercase overflow-hidden">
                                                {getProviderInitial(workflow.action?.plugin_provider_id)}
                                            </div>
                                            <div className={cn(
                                                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 transition-all duration-500",
                                                connectedAccountIds.includes(workflow.action?.plugin_provider_id)
                                                    ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                                    : "bg-zinc-300 grayscale"
                                            )} />
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                        workflow.is_enabled ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                                    )}>
                                        {workflow.is_enabled ? "running" : "Paused"}
                                    </div>
                                </div>

                                <Link href={`/workflows/${workflow.id}`} className="flex-1 block">
                                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:underline transition-all line-clamp-2 min-h-[56px]">
                                        {workflow.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500 line-clamp-2">
                                        {workflow.description || `Trigger: ${getProviderName(workflow.trigger?.plugin_provider_id)} → Action: ${getProviderName(workflow.action?.plugin_provider_id)}`}
                                    </p>
                                </Link>

                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-400 capitalize">{workflow.status}</span>
                                    <Link href={`/workflows/${workflow.id}`}>
                                        <Button variant="ghost" size="sm" className="rounded-full gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold">
                                            Manage <ArrowRight size={14} />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-12 text-center">
                        <Layers size={48} className="mx-auto mb-4 text-zinc-300" />
                        <h3 className="text-lg font-bold mb-1">No Workflows Created</h3>
                        <p className="text-zinc-500 mb-6">Build your first automation to see it here.</p>
                        <Link href="/create">
                            <Button variant="outline" className="rounded-full font-bold">Get Started</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Connected Services Section */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Connected Services</h2>
                        <p className="text-zinc-500">Third-party platforms linked to your account.</p>
                    </div>
                    <Link href="/connections">
                        <Button variant="ghost" className="gap-2 text-zinc-900 dark:text-white font-bold hover:bg-transparent px-0">
                            Manage Connections <ExternalLink size={16} />
                        </Button>
                    </Link>
                </div>

                {connectedProviders.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {connectedProviders.map((provider, i) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[1.5rem] flex flex-col items-center gap-3 transition-all hover:border-zinc-900 dark:hover:border-white hover:shadow-lg text-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors">
                                    <span className="text-xl font-black text-zinc-400 group-hover:text-white dark:group-hover:text-black">
                                        {provider.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="font-bold text-sm tracking-tight truncate w-full">{provider.name}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-12 text-center">
                        <ShieldCheck size={48} className="mx-auto mb-4 text-zinc-300" />
                        <h3 className="text-lg font-bold mb-1">No Connected Accounts</h3>
                        <p className="text-zinc-500 mb-6">Connect your favorite apps to start automating.</p>
                        <Link href="/connections">
                            <Button variant="outline" className="rounded-full font-bold">Link Accounts</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
