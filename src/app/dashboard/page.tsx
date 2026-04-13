'use client';

import { useEffect, useState } from "react";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Plus, Loader2 } from "lucide-react";
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
        // Optimistic update
        setSubscriptions(subs => subs.map(s => s.id === sub.id ? { ...s, is_active: newStatus } : s));

        try {
            await httpClient.patch(`/api/v1/me/subscriptions/${sub.id}`, { is_enabled: newStatus });
            
            // If user owns the workflow, we also toggle the workflow itself
            if (sub.workflow.user_id === user?.id) {
                await httpClient.patch(`/api/v1/workflows/${sub.workflow.id}/toggle?enable=${newStatus}`);
            }
        } catch (error) {
            console.error("Failed to toggle subscription", error);
            // Revert on failure
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
                <Link href="/auth/login"><Button>Login</Button></Link>
            </div>
        );
    }

    if (loading) {
        return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 pt-24 px-6">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">My Workflows</h1>
                    <p className="text-zinc-500">Manage your active automations.</p>
                </div>
                <Link href="/create">
                    <Button className="rounded-full px-6 gap-2" size="lg">
                        <Plus size={18} />
                        Create
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub, index) => {
                    const workflow = sub.workflow;
                    
                    return (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                relative p-6 rounded-3xl border transition-all hover:-translate-y-1 group flex flex-col h-full
                                ${sub.is_active
                                    ? 'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-sm hover:shadow-xl'
                                    : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 opacity-80 grayscale-[0.2]'}
                            `}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex -space-x-3 items-center">
                                    <div className="relative group/trigger">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold shadow-md border-4 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 z-10 uppercase overflow-hidden">
                                            {getProviderInitial(workflow.trigger?.plugin_provider_id)}
                                        </div>
                                        {/* Trigger Status Glow */}
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
                                        {/* Action Status Glow */}
                                        <div className={cn(
                                            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 transition-all duration-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                                            (accounts.includes(workflow.action?.plugin_provider_id) && workflow.action?.config)
                                                ? "bg-emerald-500 animate-pulse"
                                                : "bg-zinc-300 grayscale"
                                        )} title="Action Connected" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <span className={`text-xs font-bold ${sub.is_active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                        {sub.is_active ? 'On' : 'Off'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={sub.is_active} onChange={() => handleToggle(sub)} />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black dark:peer-focus:ring-white rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>

                            <Link href={`/workflows/${workflow.id}`} className="flex-1 block">
                                <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
                                    {workflow.name}
                                </h3>
                                <p className="text-sm text-zinc-500 line-clamp-2">
                                    {workflow.description || `Trigger: ${getProviderName(workflow.trigger?.plugin_provider_id)} → Action: ${getProviderName(workflow.action?.plugin_provider_id)}`}
                                </p>
                            </Link>

                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm font-medium text-zinc-500">
                                <span>{workflow.user_id === user?.id ? "Created by you" : "Community workflow"}</span>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" onClick={(e) => handleExecute(e, workflow.id)} className="text-zinc-500 hover:text-black">
                                        Test Run
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={(e) => handleUnsubscribe(e, sub.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        Delete
                                    </Button>
                                    <Link href={`/workflows/${workflow.id}`}>
                                        <ArrowRight size={16} className="text-zinc-400 hover:text-blue-600 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}

                {/* Create New Card (Empty State) */}
                <Link href="/create">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                        <Plus size={48} className="mb-4 opacity-50" />
                        <span className="font-bold">Create new workflow</span>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
