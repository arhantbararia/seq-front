'use client';

import { useEffect, useState } from "react";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Plus, Loader2, Zap, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SubscriptionRead {
    id: string;
    user_id: string;
    workflow_id: string;
    is_active: boolean;
    workflow: any; // WorkflowRead
}

export default function DashboardPage() {
    const { isAuthenticated, user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<SubscriptionRead[]>([]);
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [accounts, setAccounts] = useState<string[]>([]); // Connected provider_ids
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        Promise.all([
            httpClient.get('/api/v1/me/subscriptions'),
            httpClient.get('/api/v1/plugins/providers'),
            httpClient.get('/api/v1/plugins/accounts')
        ])
        .then(([subsRes, provRes, accRes]) => {
            setSubscriptions(subsRes.data);
            setProviders(provRes.data);
            setAccounts(accRes.data.map((a: any) => a.plugin_provider_id));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleToggle = async (sub: SubscriptionRead) => {
        const newStatus = !sub.is_active;
        setSubscriptions(subs => subs.map(s => s.id === sub.id ? { ...s, is_active: newStatus } : s));

        try {
            await httpClient.patch(`/api/v1/me/subscriptions/${sub.id}`, { is_enabled: newStatus });
            if (sub.workflow.user_id === user?.id) {
                await httpClient.patch(`/api/v1/workflows/${sub.workflow.id}/toggle?enable=${newStatus}`);
            }
        } catch (error) {
            console.error("Failed to toggle subscription", error);
            setSubscriptions(subs => subs.map(s => s.id === sub.id ? { ...s, is_active: !newStatus } : s));
        }
    };

    const handleExecute = async (e: React.MouseEvent, workflowId: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await httpClient.post(`/api/v1/workflows/${workflowId}/execute`);
            alert("Execution triggered successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to execute workflow.");
        }
    };

    const handleUnsubscribe = async (e: React.MouseEvent, subId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to unsubscribe?")) return;
        try {
            await httpClient.delete(`/api/v1/me/subscriptions/${subId}`);
            setSubscriptions(subs => subs.filter(s => s.id !== subId));
        } catch (err) {
            console.error(err);
            alert("Failed to unsubscribe.");
        }
    };

    const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || id;
    const getProviderInitial = (id: string) => getProviderName(id).charAt(0).toUpperCase();

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-10 h-10 text-zinc-400" />
                </div>
                <h1 className="text-3xl font-black mb-2 tracking-tight">Access Restricted</h1>
                <p className="text-zinc-500 mb-8 max-w-md">Please log in to view your detailed dashboard and manage your automations.</p>
                <Link href="/auth/login"><Button size="lg" className="rounded-full px-8">Login to Sequels</Button></Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="text-zinc-500 font-medium animate-pulse">Loading your dashboard...</p>
            </div>
        );
    }

    const myWorkflows = subscriptions.filter(s => s.workflow.user_id === user?.id);
    const subscribedWorkflows = subscriptions.filter(s => s.workflow.user_id !== user?.id);

    const renderWorkflowCard = (sub: SubscriptionRead, index: number) => {
        const workflow = sub.workflow;
        return (
            <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                    "relative p-6 rounded-3xl border transition-all hover:-translate-y-1 group flex flex-col h-full",
                    sub.is_active
                        ? 'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-sm hover:shadow-xl'
                        : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 opacity-80 grayscale-[0.2]'
                )}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex -space-x-3 items-center">
                        <div className="relative group/trigger">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 z-10 uppercase overflow-hidden">
                                {getProviderInitial(workflow.trigger?.plugin_provider_id)}
                            </div>
                            <div className={cn(
                                "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                                (accounts.includes(workflow.trigger?.plugin_provider_id) && workflow.trigger?.config)
                                    ? "bg-red-500 animate-pulse"
                                    : "bg-zinc-300 grayscale"
                            )} title="Trigger Connected" />
                        </div>
                        <div className="relative group/action">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-700 z-0 uppercase overflow-hidden">
                                {getProviderInitial(workflow.action?.plugin_provider_id)}
                            </div>
                            <div className={cn(
                                "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 transition-all duration-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                                (accounts.includes(workflow.action?.plugin_provider_id) && workflow.action?.config)
                                    ? "bg-emerald-500 animate-pulse"
                                    : "bg-zinc-300 grayscale"
                            )} title="Action Connected" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className={cn("text-xs font-bold", sub.is_active ? 'text-emerald-600' : 'text-zinc-400')}>
                            {sub.is_active ? 'On' : 'Off'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={sub.is_active} onChange={() => handleToggle(sub)} />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black dark:peer-focus:ring-white rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
                        </label>
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

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm font-medium text-zinc-500">
                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{workflow.user_id === user?.id ? "Personal" : "Community"}</span>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={(e) => handleExecute(e, workflow.id)} className="h-8 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            Test Run
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => handleUnsubscribe(e, sub.id)} className="h-8 rounded-lg text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Delete
                        </Button>
                        <Link href={`/workflows/${workflow.id}`}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <ArrowRight size={14} className="text-zinc-500" />
                            </div>
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 pt-24 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">My Dashboard</h1>
                    <p className="text-lg text-zinc-500 max-w-xl">Central hub for your personal creations and subscribed community automations.</p>
                </div>
                <Link href="/create">
                    <Button className="h-14 rounded-2xl px-8 gap-3 text-base font-bold shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98]" size="lg">
                        <Plus size={20} />
                        Create New
                    </Button>
                </Link>
            </div>

            {/* Your Creations Section */}
            <div className="mb-20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Your Creations</h2>
                        <p className="text-sm text-zinc-500">Workflows you've designed and built.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Create New Card */}
                    <Link href="/create" className="order-first">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full min-h-[280px] flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
                            </div>
                            <span className="font-black text-lg">Build New Workflow</span>
                            <span className="text-sm opacity-60 mt-2">Start from scratch</span>
                        </motion.div>
                    </Link>

                    {myWorkflows.map((sub, i) => renderWorkflowCard(sub, i))}
                </div>
            </div>

            {/* Subscribed Workflows Section */}
            {subscribedWorkflows.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Subscribed Workflows</h2>
                            <p className="text-sm text-zinc-500">Automations from the Sequels community.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {subscribedWorkflows.map((sub, i) => renderWorkflowCard(sub, i + myWorkflows.length))}
                    </div>
                </div>
            )}
        </div>
    );
}
