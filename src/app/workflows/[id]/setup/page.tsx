'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ConfigForm, ConfigField } from "@/components/ConfigForm";

export default function WorkflowSetupPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    
    const [triggerCapability, setTriggerCapability] = useState<any>(null);
    const [actionCapability, setActionCapability] = useState<any>(null);

    const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
    const [actionConfig, setActionConfig] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/auth/login?next=/workflows/${workflowId}/setup`);
        }
    }, [isAuthenticated, authLoading, router, workflowId]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            try {
                // 1. Fetch dependencies concurrently
                const [wfRes, accountsRes, providersRes] = await Promise.all([
                    httpClient.get(`/api/v1/workflows/${workflowId}`),
                    httpClient.get('/api/v1/plugins/accounts'),
                    httpClient.get('/api/v1/plugins/providers')
                ]);

                const wfData = wfRes.data;
                const accountsData = accountsRes.data;
                
                setWorkflow(wfData);
                setAccounts(accountsData);
                setProviders(providersRes.data);

                // 2. Fetch specific capabilities using the query parameter provider filter
                if (wfData.trigger && wfData.trigger.plugin_provider_id) {
                    const trigRes = await httpClient.get(`/api/v1/triggers?provider_id=${wfData.trigger.plugin_provider_id}`);
                    const cap = trigRes.data.find((c: any) => c.unique_key === wfData.trigger.capability_key);
                    setTriggerCapability(cap);
                }

                if (wfData.action && wfData.action.plugin_provider_id) {
                    const actRes = await httpClient.get(`/api/v1/actions?provider_id=${wfData.action.plugin_provider_id}`);
                    const cap = actRes.data.find((c: any) => c.unique_key === wfData.action.capability_key);
                    setActionCapability(cap);
                }

                // Check for restored state from sessionStorage
                const saved = sessionStorage.getItem(`pendingWorkflowSetup_${workflowId}`);
                if (saved) {
                    const { triggerConf, actionConf } = JSON.parse(saved);
                    if (triggerConf) setTriggerConfig(triggerConf);
                    if (actionConf) setActionConfig(actionConf);
                    sessionStorage.removeItem(`pendingWorkflowSetup_${workflowId}`);
                }

            } catch (err) {
                console.error("Failed to load setup dependencies", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Listen for new account connections from other tabs/windows
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'account-connected') {
                fetchData(); // Re-fetch to get new connectivity status
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [workflowId, isAuthenticated]);

    if (loading || authLoading) {
        return <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-pulse">Loading setup...</div>;
    }

    if (!workflow) {
        return <div className="max-w-2xl mx-auto px-6 py-24 text-center">Workflow not found.</div>;
    }

    // Determine missing connections
    const triggerProviderId = workflow.trigger?.plugin_provider_id;
    const actionProviderId = workflow.action?.plugin_provider_id;

    const hasTriggerConn = accounts.some(a => a.plugin_provider_id === triggerProviderId);
    const hasActionConn = accounts.some(a => a.plugin_provider_id === actionProviderId);

    const triggerProvider = providers.find(p => p.id === triggerProviderId);
    const actionProvider = providers.find(p => p.id === actionProviderId);

    const handleConnectClick = async (providerId: string) => {
        // Save current config to sessionStorage
        sessionStorage.setItem(`pendingWorkflowSetup_${workflowId}`, JSON.stringify({
            triggerConf: triggerConfig,
            actionConf: actionConfig
        }));

        if (!isAuthenticated) {
            router.push(`/auth/login?next=/workflows/${workflowId}/setup&state=restored`);
            return;
        }

        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const redirectUri = `${appUrl}/auth/plugin/callback?dest=/workflows/${workflowId}/setup&state=restored&provider_id=${providerId}&is_new_tab=true`;
            const res = await httpClient.get(`/api/v1/plugins/accounts/${providerId}/oauth/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
            if (res.data && res.data.auth_url) {
                window.open(res.data.auth_url, '_blank');
            }
        } catch (e) {
            console.error(e);
            alert("Failed to initialize connection.");
        }
    };

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            await httpClient.post(`/api/v1/workflows/${workflowId}/subscribe`, {
                trigger_config: triggerConfig,
                action_config: actionConfig
            });
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to subscribe with config.');
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-24">
            <h1 className="text-3xl font-black mb-2">Setup Subscription</h1>
            <p className="text-zinc-500 mb-8">Configure connection and overrides for <strong>{workflow.name}</strong></p>

            <div className="space-y-12">
                {/* Trigger Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        1. Trigger: {triggerProvider?.name || 'Unknown'}
                    </h2>
                    
                    {!hasTriggerConn ? (
                        <div className="p-6 border rounded-xl border-dashed border-zinc-300 dark:border-zinc-700 space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-zinc-500">
                                    {!isAuthenticated 
                                        ? "Log in to connect your accounts." 
                                        : `You need to connect your ${triggerProvider?.name} account.`}
                                </p>
                                <Button onClick={() => handleConnectClick(triggerProviderId)} className="gap-2">
                                    {!isAuthenticated ? (
                                        "Login to Connect"
                                    ) : (
                                        <>
                                            {triggerProvider?.logo_url && (
                                                <img 
                                                    src={triggerProvider.logo_url} 
                                                    className="w-4 h-4 rounded-sm object-contain invert dark:invert-0" 
                                                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                />
                                            )}
                                            Connect {triggerProvider?.name}
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            {triggerCapability && triggerCapability.config_fields?.length > 0 && (
                                <div className="pt-4 border-t border-dashed">
                                    <h4 className="text-sm font-bold mb-4 opacity-50">Configuration (will be saved after you connect)</h4>
                                    <ConfigForm 
                                        fields={triggerCapability.config_fields}
                                        values={triggerConfig}
                                        onChange={(name, val) => setTriggerConfig(prev => ({...prev, [name]: val}))}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-emerald-600 mb-4 text-sm font-medium">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Connected
                            </div>
                            
                            {triggerCapability && triggerCapability.config_fields?.length > 0 && (
                                <ConfigForm 
                                    fields={triggerCapability.config_fields}
                                    values={triggerConfig}
                                    onChange={(name, val) => setTriggerConfig(prev => ({...prev, [name]: val}))}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        2. Action: {actionProvider?.name || 'Unknown'}
                    </h2>
                    
                    {!hasActionConn ? (
                        <div className="p-6 border rounded-xl border-dashed border-zinc-300 dark:border-zinc-700 space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-zinc-500">
                                    {!isAuthenticated 
                                        ? "Log in to connect your accounts." 
                                        : `You need to connect your ${actionProvider?.name} account.`}
                                </p>
                                <Button onClick={() => handleConnectClick(actionProviderId)} className="gap-2">
                                    {!isAuthenticated ? (
                                        "Login to Connect"
                                    ) : (
                                        <>
                                            {actionProvider?.logo_url && (
                                                <img 
                                                    src={actionProvider.logo_url} 
                                                    className="w-4 h-4 rounded-sm object-contain invert dark:invert-0" 
                                                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                />
                                            )}
                                            Connect {actionProvider?.name}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {actionCapability && actionCapability.config_fields?.length > 0 && (
                                <div className="pt-4 border-t border-dashed">
                                    <h4 className="text-sm font-bold mb-4 opacity-50">Configuration (will be saved after you connect)</h4>
                                    <ConfigForm 
                                        fields={actionCapability.config_fields}
                                        values={actionConfig}
                                        onChange={(name, val) => setActionConfig(prev => ({...prev, [name]: val}))}
                                        availableVariables={(triggerCapability?.outputs || []).map((o: any) => ({
                                            name: `trigger.payload.${o.key}`,
                                            label: `Ingredient: ${o.label}`
                                        }))}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-emerald-600 mb-4 text-sm font-medium">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Connected
                            </div>

                            {actionCapability && actionCapability.config_fields?.length > 0 && (
                                <ConfigForm 
                                    fields={actionCapability.config_fields}
                                    values={actionConfig}
                                    onChange={(name, val) => setActionConfig(prev => ({...prev, [name]: val}))}
                                    availableVariables={(triggerCapability?.outputs || []).map((o: any) => ({
                                        name: `trigger.payload.${o.key}`,
                                        label: `Ingredient: ${o.label}`
                                    }))}
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t flex justify-end">
                    <Button 
                        size="lg"
                        className="px-8"
                        disabled={!hasTriggerConn || !hasActionConn || subscribing}
                        onClick={handleSubscribe}
                    >
                        {subscribing ? "Subscribing..." : "Finish and Subscribe"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
