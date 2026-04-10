'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { PluginProviderRead } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function WorkflowDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<any>(null);
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        Promise.all([
            httpClient.get(`/api/v1/plugins/providers`),
            httpClient.get(`/api/v1/workflows/${workflowId}`)
        ])
        .then(([providersRes, workflowRes]) => {
            setProviders(providersRes.data);
            setWorkflow(workflowRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [workflowId]);

    const handleUseWorkflow = async () => {
        if (!isAuthenticated) {
            router.push(`/auth/login?next=/workflows/${workflowId}/setup`);
            return;
        }

        router.push(`/workflows/${workflowId}/setup`);
    };

    if (loading) {
        return <div className="max-w-3xl mx-auto px-6 py-24 min-h-screen animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-zinc-200 rounded"></div>
            <div className="h-4 w-1/2 bg-zinc-200 rounded"></div>
            <div className="h-48 w-full bg-zinc-200 rounded mt-8"></div>
        </div>;
    }

    if (!workflow) {
        return <div className="max-w-3xl mx-auto px-6 py-24 min-h-screen text-center">
            <h1 className="text-2xl font-bold">Workflow not found</h1>
            <Link href="/explore">
                <Button className="mt-4">Back to Explore</Button>
            </Link>
        </div>;
    }

    const triggerProvider = providers.find(p => p.id === workflow.trigger?.provider_id);
    const actionProvider = providers.find(p => p.id === workflow.action?.provider_id);
    
    // Check if user is already subscribed
    const isSubscribed = user && workflow.subscribers?.includes(user.id);

    return (
        <div className="max-w-3xl mx-auto px-6 py-24 min-h-screen">
            <Link href="/explore" className="text-sm font-medium text-zinc-500 hover:text-black mb-8 inline-block">
                &larr; Back to Explore
            </Link>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <h1 className="text-3xl font-black mb-2">{workflow.name}</h1>
                <p className="text-zinc-500 mb-8">{workflow.description || "No description provided."}</p>

                <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 mb-8">
                    <span>{workflow.subscribers_count} subscribers</span>
                    <span>•</span>
                    <span>By {workflow.user_id === user?.id ? "You" : "Community"}</span>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center font-bold">
                                {triggerProvider?.name.charAt(0) || 'T'}
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Trigger</div>
                                <div className="font-semibold text-lg">{triggerProvider?.name || 'Unknown Provider'}</div>
                            </div>
                        </div>
                        <pre className="mt-4 bg-zinc-200 dark:bg-zinc-950 p-4 rounded-xl text-xs overflow-x-auto">
                            {JSON.stringify(workflow.trigger, null, 2)}
                        </pre>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10 w-full">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                            &darr;
                        </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center font-bold">
                                {actionProvider?.name.charAt(0) || 'A'}
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Action</div>
                                <div className="font-semibold text-lg">{actionProvider?.name || 'Unknown Provider'}</div>
                            </div>
                        </div>
                        <pre className="mt-4 bg-zinc-200 dark:bg-zinc-950 p-4 rounded-xl text-xs overflow-x-auto">
                            {JSON.stringify(workflow.action, null, 2)}
                        </pre>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    {isSubscribed ? (
                        <div className="text-center">
                            <p className="text-sm font-medium text-emerald-600 mb-2">You are already subscribed to this workflow.</p>
                            <Link href="/dashboard">
                                <Button variant="outline">Go to Dashboard</Button>
                            </Link>
                        </div>
                    ) : (
                        <Button 
                            size="lg" 
                            className="px-12 py-6 text-lg rounded-full" 
                            onClick={handleUseWorkflow}
                            disabled={subscribing}
                        >
                            {subscribing ? "Subscribing..." : "Use this workflow"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
