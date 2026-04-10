'use client';

import { useEffect, useState, useCallback } from "react";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkflowRead {
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    status: string;
    is_enabled: boolean;
    is_public: boolean;
    trigger: any;
    action: any;
    subscribers_count: number;
}

export default function ExplorePage() {
    const [workflows, setWorkflows] = useState<WorkflowRead[]>([]);
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [loading, setLoading] = useState(true);

    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");
    const [sort, setSort] = useState("popular");
    const [providerId, setProviderId] = useState("");
    
    // Pagination
    const limit = 9;
    const [page, setPage] = useState(1);

    // Fetch Providers for filters
    useEffect(() => {
        httpClient.get('/api/v1/plugins/providers')
            .then(res => setProviders(res.data))
            .catch(console.error);
    }, []);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQ(q);
        }, 500);
        return () => clearTimeout(handler);
    }, [q]);

    // Fetch Workflows
    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedQ) params.append("q", debouncedQ);
            if (sort) params.append("sort", sort);
            if (providerId) params.append("provider_id", providerId);

            const res = await httpClient.get(`/api/v1/workflows/explore?${params.toString()}`);
            setWorkflows(res.data);
            setPage(1); // reset to page 1 on new filter
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [debouncedQ, sort, providerId]);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const getProviderIcon = (providerId: string) => {
        const p = providers.find(x => x.id === providerId);
        return p ? p.icon : "globe"; // For now return string name, rendering will happen via IconMap if we extract it
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
            <h1 className="text-4xl font-black mb-8 tracking-tight">Explore Workflows</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Input
                    placeholder="Search workflows..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="flex-1"
                />
                
                <select
                    value={providerId}
                    onChange={e => setProviderId(e.target.value)}
                    className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">All Providers</option>
                    {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="popular">Popular</option>
                    <option value="newest">Newest</option>
                </select>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: limit }).map((_, i) => (
                        <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : workflows.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    No workflows found.
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
                                    className="group block border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-zinc-900"
                                >
                                    <h3 className="font-bold text-xl mb-2 line-clamp-1">{wf.name}</h3>
                                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                        {wf.description || "No description provided."}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-900 z-10 text-xs">
                                                {getProviderIcon(wf.trigger?.plugin_provider_id)?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-900 z-0 text-xs">
                                                {getProviderIcon(wf.action?.plugin_provider_id)?.charAt(0).toUpperCase()}
                                            </div>
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
                                className="rounded-full px-8 border-2 border-zinc-200 dark:border-zinc-800"
                                onClick={() => setPage(page + 1)}
                            >
                                Load More
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
