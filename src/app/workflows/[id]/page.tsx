'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
    ChevronLeft, Zap, Play, Users,
    Calendar, Check, Trash2, Edit3,
    Power, Loader2, Info, ArrowRight,
    User as UserIcon, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkflowDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<any>(null);
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [providersRes, workflowRes] = await Promise.all([
                httpClient.get(`/api/v1/plugins/providers`),
                httpClient.get(`/api/v1/workflows/${workflowId}`)
            ]);
            setProviders(providersRes.data);
            setWorkflow(workflowRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [workflowId]);

    const handleSubscribe = () => {
        router.push(`/workflows/${workflowId}/setup`);
    };

    const handleUnsubscribe = async () => {
        if (!confirm("Are you sure you want to unsubscribe from this workflow?")) return;
        setIsActionLoading(true);
        try {
            await httpClient.post(`/api/v1/workflows/${workflowId}/unsubscribe`);
            await fetchData();
        } catch (err) {
            console.error("Failed to unsubscribe", err);
            alert("Failed to unsubscribe from workflow.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggle = async (enable: boolean) => {
        setIsActionLoading(true);
        try {
            await httpClient.patch(`/api/v1/workflows/${workflowId}/toggle?enable=${enable}`);
            setWorkflow((prev: any) => ({ ...prev, is_enabled: enable }));
        } catch (err) {
            console.error("Failed to toggle workflow", err);
            alert("Failed to update workflow status.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("CRITICAL: Are you sure you want to delete this workflow? This action cannot be undone.")) return;
        setIsActionLoading(true);
        try {
            await httpClient.delete(`/api/v1/workflows/${workflowId}`);
            router.push('/dashboard');
        } catch (err) {
            console.error("Failed to delete workflow", err);
            alert("Failed to delete workflow.");
            setIsActionLoading(false);
        }
    };

    const handleEdit = () => {
        const stateToSave = {
            triggerProvider: providers.find(p => p.id === workflow.trigger?.plugin_provider_id),
            triggerCap: null, // We'll let the create page fetch the full capability if needed, or we can populate it
            triggerConf: workflow.trigger?.config || {},
            actionProvider: providers.find(p => p.id === workflow.action?.plugin_provider_id),
            actionCap: null,
            actionConf: workflow.action?.config || {}
        };
        // Special case: we provide enough data for the create page to restore the full UI
        sessionStorage.setItem('pendingWorkflow', JSON.stringify(workflow));
        router.push('/create?state=restored');
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
                <div className="animate-pulse space-y-8">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="space-y-4">
                        <div className="h-12 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
                        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-3xl"></div>
                        <div className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-3xl"></div>
                        <div className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-3xl"></div>
                    </div>
                    <div className="h-96 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem]"></div>
                </div>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-40 min-h-screen text-center">
                <ShieldAlert className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
                <h1 className="text-3xl font-black tracking-tight mb-2">Workflow Not Found</h1>
                <p className="text-zinc-500 mb-8">This workflow might have been deleted or is no longer public.</p>
                <Link href="/explore">
                    <Button size="lg" className="rounded-full px-8">Back to Explore</Button>
                </Link>
            </div>
        );
    }

    const triggerProvider = providers.find(p => p.id === workflow.trigger?.plugin_provider_id);
    const actionProvider = providers.find(p => p.id === workflow.action?.plugin_provider_id);

    const isCreator = user && workflow.user_id === user.id;
    const isSubscribed = user && workflow.subscribers?.some((s: any) => s.id === user.id);

    const renderConfigValue = (key: string, value: any) => {
        if (key === '_auth_context' || key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
            return null;
        }

        return (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 sm:mb-0">
                    {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 pt-24 px-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white mb-8 transition-colors">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                workflow.is_enabled ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                            )}>
                                {workflow.is_enabled ? "Active" : "Paused"}
                            </span>
                            <span className="text-zinc-400 text-sm font-medium">•</span>
                            <span className="text-zinc-500 text-sm font-medium flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(workflow.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">{workflow.name}</h1>
                        <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl">
                            {workflow.description || "A powerful automation designed to streamline your digital workflow by connecting your favorite services seamlessly."}
                        </p>
                    </motion.div>

                    {/* Interaction Components */}
                    <div className="space-y-6">
                        {/* Trigger Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap size={80} fill="currentColor" />
                            </div>
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-2xl font-black shadow-inner">
                                    {triggerProvider?.name.charAt(0) || 'T'}
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">Trigger Event</div>
                                    <div className="font-bold text-2xl tracking-tight">{triggerProvider?.name || 'Unknown Service'}</div>
                                    <div className="text-zinc-500 font-medium text-sm">{workflow.trigger?.name}</div>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 relative z-10 border border-zinc-100 dark:border-zinc-800/50">
                                <div className="flex items-center gap-2 mb-4 text-xs font-black text-zinc-400 uppercase tracking-wider">
                                    <Info size={14} />
                                    Configuration Details
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(workflow.trigger?.config || {}).map(([key, value]) => renderConfigValue(key, value))}
                                    {Object.keys(workflow.trigger?.config || {}).filter(k => k !== '_auth_context').length === 0 && (
                                        <p className="text-sm italic text-zinc-400">No public configuration visible.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Connector */}
                        <div className="flex justify-center -my-3 relative z-20">
                            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl border-4 border-zinc-50 dark:border-zinc-900 animate-bounce">
                                <ArrowRight size={20} className="rotate-90" />
                            </div>
                        </div>

                        {/* Action Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Play size={80} fill="currentColor" />
                            </div>
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-2xl font-black shadow-inner">
                                    {actionProvider?.name.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-1">Action Flow</div>
                                    <div className="font-bold text-2xl tracking-tight">{actionProvider?.name || 'Unknown Service'}</div>
                                    <div className="text-zinc-500 font-medium text-sm">{workflow.action?.name}</div>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 relative z-10 border border-zinc-100 dark:border-zinc-800/50">
                                <div className="flex items-center gap-2 mb-4 text-xs font-black text-zinc-400 uppercase tracking-wider">
                                    <Info size={14} />
                                    Configuration Details
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(workflow.action?.config || {}).map(([key, value]) => renderConfigValue(key, value))}
                                    {Object.keys(workflow.action?.config || {}).filter(k => k !== '_auth_context').length === 0 && (
                                        <p className="text-sm italic text-zinc-400">No public configuration visible.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-32"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            Manage Workflow
                        </h3>

                        <div className="space-y-4">
                            {/* Role Indicator */}
                            <div className="flex items-center gap-3 py-3 px-4 bg-white/10 rounded-2xl mb-6">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    {isCreator ? <ShieldAlert size={16} /> : <UserIcon size={16} />}
                                </div>
                                <div className="text-sm">
                                    <div className="font-black">Your Role</div>
                                    <div className="text-white/60 text-xs font-medium">
                                        {isCreator ? "Owner & Creator" : isSubscribed ? "Active Subscriber" : "External Discovery"}
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Controls */}
                            <AnimatePresence mode="wait">
                                {isCreator ? (
                                    <motion.div key="creator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                        <Button
                                            onClick={() => handleToggle(!workflow.is_enabled)}
                                            className={cn("w-full h-14 rounded-2xl text-base font-bold gap-2", workflow.is_enabled ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600")}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin" /> : <Power size={18} />}
                                            {workflow.is_enabled ? "Pause Workflow" : "Enable Workflow"}
                                        </Button>
                                        <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-bold gap-2 bg-transparent border-white/20 hover:bg-white/5" onClick={handleEdit}>
                                            <Edit3 size={18} />
                                            Edit as New Version
                                        </Button>
                                        <Button variant="ghost" className="w-full h-14 rounded-2xl text-base font-bold gap-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10" onClick={handleDelete}>
                                            <Trash2 size={18} />
                                            Delete Workflow
                                        </Button>
                                    </motion.div>
                                ) : isSubscribed ? (
                                    <motion.div key="subscriber" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <Check size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-emerald-400">Subscribed Successfully</span>
                                        </div>
                                        <Button
                                            onClick={() => handleToggle(!workflow.is_enabled)}
                                            className={cn("w-full h-14 rounded-2xl text-base font-bold gap-2", workflow.is_enabled ? "bg-zinc-700 hover:bg-zinc-600" : "bg-emerald-500 hover:bg-emerald-600")}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin" /> : <Power size={18} />}
                                            {workflow.is_enabled ? "Turn Off" : "Turn On"}
                                        </Button>
                                        <Button variant="ghost" className="w-full h-14 rounded-2xl text-base font-bold gap-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10" onClick={handleUnsubscribe}>
                                            <Trash2 size={18} />
                                            Unsubscribe
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="guest" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Button
                                            size="lg"
                                            className="w-full h-16 text-lg rounded-2xl bg-white text-black hover:bg-zinc-100"
                                            onClick={handleSubscribe}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin" /> : "Use this workflow"}
                                        </Button>
                                        <p className="mt-4 text-center text-xs text-white/40 font-medium">By using this workflow, you agree to our terms and conditions.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Stats Summary */}
                        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-white/40 mb-1">
                                    <Users size={14} />
                                    <span className="text-[10px] uppercase font-black tracking-tighter">Subscribers</span>
                                </div>
                                <div className="text-xl font-black">{workflow.subscribers_count || 0}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-white/40 mb-1">
                                    <Zap size={14} />
                                    <span className="text-[10px] uppercase font-black tracking-tighter">Executions</span>
                                </div>
                                <div className="text-xl font-black">{workflow.subscribers_count || 0}</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-6">
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-amber-500" />
                            Sharing Privacy
                        </h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                            This workflow is {workflow.is_public ? "Public" : "Private"}. Public workflows can be discovered by anyone in the community. Sensitive credentials and private tokens are always stripped before sharing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
