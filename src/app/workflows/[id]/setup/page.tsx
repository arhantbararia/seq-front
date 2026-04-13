'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ConfigForm } from "@/components/ConfigForm";
import { 
    ChevronLeft, 
    ShieldCheck, 
    Zap, 
    Play, 
    Check, 
    Loader2, 
    ArrowRight,
    Settings2,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PluginAuthModal } from "@/components/PluginAuthModal";

export default function WorkflowSetupPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
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

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalProvider, setAuthModalProvider] = useState<any | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/auth/login?next=/workflows/${workflowId}/setup`);
        }
    }, [isAuthenticated, authLoading, router, workflowId]);

    const fetchData = async () => {
        if (!isAuthenticated) return;
        try {
            const [wfRes, accountsRes, providersRes] = await Promise.all([
                httpClient.get(`/api/v1/workflows/${workflowId}`),
                httpClient.get('/api/v1/plugins/accounts'),
                httpClient.get('/api/v1/plugins/providers')
            ]);

            const wfData = wfRes.data;
            setWorkflow(wfData);
            setAccounts(accountsRes.data);
            setProviders(providersRes.data);

            if (wfData.trigger) {
                const trigRes = await httpClient.get(`/api/v1/triggers?provider_id=${wfData.trigger.plugin_provider_id}`);
                setTriggerCapability(trigRes.data.find((c: any) => c.unique_key === wfData.trigger.capability_key));
            }

            if (wfData.action) {
                const actRes = await httpClient.get(`/api/v1/actions?provider_id=${wfData.action.plugin_provider_id}`);
                setActionCapability(actRes.data.find((c: any) => c.unique_key === wfData.action.capability_key));
            }

            const saved = sessionStorage.getItem(`pendingWorkflowSetup_${workflowId}`);
            if (saved) {
                const { triggerConf, actionConf } = JSON.parse(saved);
                if (triggerConf) setTriggerConfig(triggerConf);
                if (actionConf) setActionConfig(actionConf);
                sessionStorage.removeItem(`pendingWorkflowSetup_${workflowId}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'account-connected') fetchData();
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [workflowId, isAuthenticated]);

    const handleConnectClick = async (provider: any) => {
        const authTypes = provider.auth_types || [];

        if (authTypes.includes('oauth2')) {
            sessionStorage.setItem(`pendingWorkflowSetup_${workflowId}`, JSON.stringify({
                triggerConf: triggerConfig,
                actionConf: actionConfig
            }));

            try {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                const redirectUri = `${appUrl}/auth/plugin/callback?dest=/workflows/${workflowId}/setup&state=restored&provider_id=${provider.id}&is_new_tab=true`;
                const res = await httpClient.get(`/api/v1/plugins/accounts/${provider.id}/oauth/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
                if (res.data?.auth_url) window.open(res.data.auth_url, '_blank');
            } catch (e) {
                alert("Failed to initialize connection.");
            }
        } else {
            setAuthModalProvider(provider);
            setIsAuthModalOpen(true);
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
            alert('Failed to subscribe with config.');
        } finally {
            setSubscribing(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-zinc-300 mb-4" />
                <p className="text-zinc-500 font-medium animate-pulse">Preparing configuration...</p>
            </div>
        );
    }

    const triggerProvider = providers.find(p => p.id === workflow.trigger?.plugin_provider_id);
    const actionProvider = providers.find(p => p.id === workflow.action?.plugin_provider_id);
    const hasTriggerConn = accounts.some(a => a.plugin_provider_id === triggerProvider?.id);
    const hasActionConn = accounts.some(a => a.plugin_provider_id === actionProvider?.id);

    const renderServiceCard = (type: 'trigger' | 'action', provider: any, capability: any, isConnected: boolean, config: any, setConfig: any) => {
        const Icon = type === 'trigger' ? Zap : Play;
        const accentColor = type === 'trigger' ? "text-indigo-500" : "text-emerald-500";
        const bgColor = type === 'trigger' ? "bg-indigo-500/10" : "bg-emerald-500/10";

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", bgColor, accentColor)}>
                            <Icon size={28} />
                        </div>
                        <div>
                            <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", accentColor)}>
                                {type === 'trigger' ? "Step 1: Trigger" : "Step 2: Action"}
                            </div>
                            <h3 className="text-xl font-black tracking-tight">{provider?.name || 'Unknown Service'}</h3>
                        </div>
                    </div>

                    {isConnected ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-xs font-black uppercase tracking-wider">
                            <Check size={14} /> Connected
                        </div>
                    ) : (
                        <Button variant="default" className="rounded-full px-6" onClick={() => handleConnectClick(provider)}>
                            Connect {provider?.name}
                        </Button>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Settings2 size={14} /> Functionality
                        </div>
                        <div className="font-bold">{capability?.name || workflow[type]?.name}</div>
                        <div className="text-sm text-zinc-500 mt-1">{capability?.description}</div>
                    </div>

                    <AnimatePresence>
                        {isConnected && capability?.config_fields?.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800"
                            >
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Configuration Parameters</div>
                                <ConfigForm
                                    fields={capability.config_fields}
                                    values={config}
                                    onChange={(name, val) => setConfig((prev: any) => ({ ...prev, [name]: val }))}
                                    availableVariables={type === 'action' ? (triggerCapability?.outputs || []).map((o: any) => ({
                                        name: `trigger.payload.${o.key}`,
                                        label: `Ingredient: ${o.label}`
                                    })) : []}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-6 pb-32 pt-12 min-h-screen">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">Setup your Instance</h1>
                        <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl">
                            Customize how <strong>{workflow.name}</strong> works for you. Connect your accounts and provide any required parameters below.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {renderServiceCard('trigger', triggerProvider, triggerCapability, hasTriggerConn, triggerConfig, setTriggerConfig)}
                        
                        <div className="flex justify-center -my-4 relative z-10">
                            <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl border-4 border-zinc-50 dark:border-zinc-900">
                                <ArrowRight size={18} className="rotate-90" />
                            </div>
                        </div>

                        {renderServiceCard('action', actionProvider, actionCapability, hasActionConn, actionConfig, setActionConfig)}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-[2.5rem] p-8 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Finalize Setup</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 py-3 px-4 bg-white/10 rounded-2xl">
                                <ShieldCheck className="text-emerald-400" size={20} />
                                <div className="text-xs font-bold leading-tight uppercase tracking-wider text-white/70">Secure Connection</div>
                            </div>

                            <p className="text-sm text-white/50 leading-relaxed">
                                We'll use your connected accounts to run this workflow on your behalf. You can manage or disconnect these at any time in your profile.
                            </p>

                            <Button 
                                size="lg" 
                                className="w-full h-16 text-lg rounded-2xl bg-white text-black hover:bg-zinc-100 disabled:bg-white/10 disabled:text-white/20"
                                onClick={handleSubscribe}
                                disabled={!hasTriggerConn || !hasActionConn || subscribing}
                            >
                                {subscribing ? <Loader2 className="animate-spin" /> : "Finish & Subscribe"}
                            </Button>
                        </div>
                    </motion.div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 flex gap-4 items-center">
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                            <Lock size={20} className="text-zinc-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Privacy Guaranteed</h4>
                            <p className="text-xs text-zinc-500">Your credentials never leave our secure vault.</p>
                        </div>
                    </div>
                </div>
            </div>

            <PluginAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                provider={authModalProvider}
                onSuccess={fetchData}
            />
        </div>
    );
}
