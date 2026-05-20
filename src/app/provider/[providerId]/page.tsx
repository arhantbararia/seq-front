'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { getProviderColor } from "@/lib/providerBrands";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, Zap } from "lucide-react";

interface WorkflowRead {
    id: string;
    name: string;
    description: string | null;
    trigger: any;
    action: any;
    subscribers_count: number;
}

interface PluginCapabilityRead {
    name: string;
    description: string | null;
    capability_key: string;
}

export default function ProviderPage() {
    const { providerId } = useParams() as { providerId: string };
    
    const [provider, setProvider] = useState<PluginProviderRead | null>(null);
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [triggers, setTriggers] = useState<PluginCapabilityRead[]>([]);
    const [actions, setActions] = useState<PluginCapabilityRead[]>([]);
    const [workflows, setWorkflows] = useState<WorkflowRead[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 9;

    useEffect(() => {
        if (!providerId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [providerRes, triggersRes, actionsRes, providersRes] = await Promise.all([
                    httpClient.get(`/api/v1/plugins/providers/${providerId}`),
                    httpClient.get(`/api/v1/triggers?provider_id=${providerId}`),
                    httpClient.get(`/api/v1/actions?provider_id=${providerId}`),
                    httpClient.get(`/api/v1/plugins/providers`),
                ]);
                
                setProvider(providerRes.data);
                setTriggers(triggersRes.data);
                setActions(actionsRes.data);
                setProviders(providersRes.data);
            } catch (err) {
                console.error("Failed to fetch provider details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [providerId]);

    useEffect(() => {
        if (!providerId) return;

        const fetchWorkflows = async () => {
            try {
                const res = await httpClient.get(`/api/v1/workflows/explore?provider_id=${providerId}`);
                setWorkflows(res.data.items || []);
            } catch (err) {
                console.error("Failed to fetch workflows", err);
            }
        };

        fetchWorkflows();
    }, [providerId]);

    const getProvider = (id: string) => {
        return providers.find(x => x.id === id) || null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-3xl mb-4"></div>
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mb-2"></div>
                </div>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Provider not found</h1>
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        );
    }

    const brandColor = getProviderColor(provider.name);

    return (
        <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center mb-20"
            >
                <div 
                    className="w-32 h-32 rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 border-4 border-white dark:border-zinc-900 relative overflow-hidden"
                    style={{ backgroundColor: brandColor }}
                >
                    <ProviderAvatar provider={provider} className="w-full h-full text-5xl !border-none !shadow-none !rounded-none" />
                </div>
                <h1 className="text-5xl font-black mb-4 tracking-tight">{provider.name}</h1>
                <p className="text-xl text-zinc-500 max-w-2xl">
                    Explore available triggers and actions for {provider.name}, and discover powerful workflows.
                </p>
            </motion.div>

            {/* Capabilities Section */}
            <div className="mb-24">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Capabilities</h2>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Triggers */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">Triggers</h3>
                        </div>
                        {triggers.length === 0 ? (
                            <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50">
                                No triggers available for this provider.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {triggers.map((trigger, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:shadow-md transition-all cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-900/50 group bg-white dark:bg-zinc-900"
                                    >
                                        <h4 className="font-bold text-lg mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{trigger.name || trigger.capability_key}</h4>
                                        <p className="text-zinc-500 text-sm">{trigger.description || 'When this event happens...'}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                                <Play size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">Actions</h3>
                        </div>
                        {actions.length === 0 ? (
                            <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50">
                                No actions available for this provider.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {actions.map((action, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:shadow-md transition-all cursor-pointer hover:border-blue-200 dark:hover:border-blue-900/50 group bg-white dark:bg-zinc-900"
                                    >
                                        <h4 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.name || action.capability_key}</h4>
                                        <p className="text-zinc-500 text-sm">{action.description || 'Do this action automatically.'}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Workflows Section */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Workflows with {provider.name}</h2>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                </div>
                
                {workflows.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50">
                        No workflows found using {provider.name}.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workflows.slice(0, page * limit).map((wf, idx) => (
                                <Link href={`/workflows/${wf.id}`} key={wf.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * (idx % limit) }}
                                        className="group block border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-zinc-900 h-full flex flex-col"
                                    >
                                        <h3 className="font-bold text-xl mb-4 leading-tight break-words">{wf.name}</h3>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-4">
                                            <div className="flex -space-x-2">
                                                <ProviderAvatar provider={getProvider(wf.trigger?.plugin_provider_id)} className="z-10" />
                                                <ProviderAvatar provider={getProvider(wf.action?.plugin_provider_id)} className="z-0" />
                                            </div>
                                            
                                            <div className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                                                {wf.subscribers_count} users
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>

                        {workflows.length > page * limit && (
                            <div className="mt-12 flex justify-center">
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="rounded-full px-8 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    onClick={() => setPage(page + 1)}
                                >
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
