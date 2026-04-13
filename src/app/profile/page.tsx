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
    ChevronRight, Settings
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

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) return;

        const fetchData = async () => {
            try {
                const [profileRes, workflowsRes, providersRes] = await Promise.all([
                    httpClient.get('/api/v1/me/profile'),
                    httpClient.get('/api/v1/workflows/'),
                    httpClient.get('/api/v1/plugins/providers')
                ]);

                setProfile(profileRes.data);
                setProviders(providersRes.data);
                
                // Filter workflows created by this user
                const myWorkflows = workflowsRes.data.filter((w: WorkflowRead) => w.user_id === profileRes.data.id);
                setCreatedWorkflows(myWorkflows);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, authLoading]);

    if (authLoading || (isAuthenticated && loading)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="text-zinc-500 font-medium animate-pulse">Loading your profile...</p>
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
                    <Button size="lg" className="rounded-full px-8">Login to Sequels</Button>
                </Link>
            </div>
        );
    }

    const connectedProviders = providers.filter(p => profile?.connected_accounts.includes(p.id));
    const getProviderInitial = (id: string) => providers.find(p => p.id === id)?.name?.charAt(0).toUpperCase() || "?";
    const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || id;

    return (
        <div className="max-w-6xl mx-auto pb-32 pt-24 px-6">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-500 p-1"
            >
                <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl rounded-[2.4rem] p-6 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white text-4xl md:text-6xl font-black shadow-2xl relative z-10">
                            {profile?.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{profile?.username}</h1>
                            {profile?.is_active && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                    Active Account
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 text-zinc-500 font-medium">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                <Mail size={16} className="text-indigo-500" />
                                <span>{profile?.email}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                                <User size={16} className="text-violet-500" />
                                <span>Member since {profile ? new Date().getFullYear() : '---'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/connections">
                            <Button variant="outline" className="rounded-full gap-2 border-zinc-200 dark:border-zinc-800">
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
                    { label: 'Subscribed Workflows', value: profile?.subscribed_workflows_count, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'Created Workflows', value: createdWorkflows.length, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
                    { label: 'Connected Accounts', value: profile?.connected_accounts.length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div className="text-4xl font-black mb-1 tabular-nums">{stat.value}</div>
                        <div className="text-zinc-500 font-bold text-sm uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Created Workflows Section (Dashboard Style) */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Created Workflows</h2>
                        <p className="text-zinc-500">Automations you've built and shared.</p>
                    </div>
                    <Link href="/create" className="text-indigo-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
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
                                className="relative p-6 rounded-3xl border bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex -space-x-3 items-center">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 z-10 uppercase overflow-hidden">
                                            {getProviderInitial(workflow.trigger?.plugin_provider_id)}
                                        </div>
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-700 z-0 uppercase overflow-hidden">
                                            {getProviderInitial(workflow.action?.plugin_provider_id)}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                        workflow.is_enabled ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                                    )}>
                                        {workflow.is_enabled ? "Active" : "Paused"}
                                    </div>
                                </div>

                                <Link href={`/workflows/${workflow.id}`} className="flex-1 block">
                                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[56px]">
                                        {workflow.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500 line-clamp-2">
                                        {workflow.description || `Trigger: ${getProviderName(workflow.trigger?.plugin_provider_id)} → Action: ${getProviderName(workflow.action?.plugin_provider_id)}`}
                                    </p>
                                </Link>

                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-400 capitalize">{workflow.status}</span>
                                    <Link href={`/workflows/${workflow.id}`}>
                                        <Button variant="ghost" size="sm" className="rounded-full gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-900">
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
                            <Button variant="outline" className="rounded-full">Get Started</Button>
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
                        <Button variant="ghost" className="gap-2 text-indigo-600 font-bold hover:bg-transparent px-0">
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
                                className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[1.5rem] flex flex-col items-center gap-3 transition-all hover:border-indigo-500/50 hover:shadow-lg text-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                    <span className="text-xl font-black text-zinc-400 group-hover:text-indigo-500">
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
                            <Button variant="outline" className="rounded-full">Link Accounts</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
