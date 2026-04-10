'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { PluginCard, PluginProviderRead } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { ConfigForm } from "@/components/ConfigForm";
import { PluginAuthModal } from "@/components/PluginAuthModal";
import { httpClient } from "@/lib/httpClient";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Zap, Play, Loader2, Link2 } from "lucide-react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";

type ViewState =
    | 'root'
    | 'trigger-provider'
    | 'trigger-function'
    | 'trigger-config'
    | 'action-provider'
    | 'action-function'
    | 'action-config'
    | 'success';

interface PluginCapabilityRead {
    unique_key: string;
    name: string;
    description: string | null;
    component_type: string;
    provider: PluginProviderRead;
    auth: Record<string, any>;
    config_fields: any[];
    outputs: any[];
}

function CreatePageInternal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuth();
    const actionSectionRef = useRef<HTMLDivElement>(null);

    // Data State
    const [providers, setProviders] = useState<PluginProviderRead[]>([]);
    const [triggers, setTriggers] = useState<PluginCapabilityRead[]>([]);
    const [actions, setActions] = useState<PluginCapabilityRead[]>([]);
    const [accounts, setAccounts] = useState<string[]>([]); // Connected provider_ids
    const [dataLoading, setDataLoading] = useState(true);

    // View State
    const [view, setView] = useState<ViewState>('root');

    // Trigger State
    const [selectedTriggerProvider, setSelectedTriggerProvider] = useState<PluginProviderRead | null>(null);
    const [selectedTrigger, setSelectedTrigger] = useState<PluginCapabilityRead | null>(null);
    const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});

    // Action State
    const [selectedActionProvider, setSelectedActionProvider] = useState<PluginProviderRead | null>(null);
    const [selectedAction, setSelectedAction] = useState<PluginCapabilityRead | null>(null);
    const [actionConfig, setActionConfig] = useState<Record<string, string>>({});

    // Global State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalProvider, setAuthModalProvider] = useState<PluginProviderRead | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [provRes, trigRes, actRes] = await Promise.all([
                    httpClient.get('/api/v1/plugins/providers'),
                    httpClient.get('/api/v1/triggers'),
                    httpClient.get('/api/v1/actions')
                ]);
                setProviders(provRes.data);
                const fetchedTriggers = trigRes.data;
                const fetchedActions = actRes.data;
                setTriggers(fetchedTriggers);
                setActions(fetchedActions);

                if (isAuthenticated) {
                    const accRes = await httpClient.get('/api/v1/plugins/accounts');
                    const connectedProviderIds = accRes.data.map((a: any) => a.plugin_provider_id);
                    setAccounts(connectedProviderIds);
                }

                // Check for restored state from sessionStorage
                if (searchParams.get('state') === 'restored') {
                    const saved = sessionStorage.getItem('pendingWorkflowCreate');
                    if (saved) {
                        const { triggerProvider, triggerCap, triggerConf, actionProvider, actionCap, actionConf } = JSON.parse(saved);
                        if (triggerProvider) setSelectedTriggerProvider(triggerProvider);
                        if (triggerCap) setSelectedTrigger(triggerCap);
                        if (triggerConf) setTriggerConfig(triggerConf);
                        if (actionProvider) setSelectedActionProvider(actionProvider);
                        if (actionCap) setSelectedAction(actionCap);
                        if (actionConf) setActionConfig(actionConf);
                        
                        // Clear storage so it doesn't happens on manual refreshes
                        sessionStorage.removeItem('pendingWorkflowCreate');
                    }
                }
            } catch (err) {
                console.error("Failed to fetch builder data", err);
            } finally {
                setDataLoading(false);
            }
        };
        loadData();

        // Listen for new account connections from other tabs/windows
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'account-connected') {
                httpClient.get('/api/v1/plugins/accounts').then(accRes => {
                    const connectedProviderIds = accRes.data.map((a: any) => a.plugin_provider_id);
                    setAccounts(connectedProviderIds);
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isAuthenticated, searchParams]);

    const scrollToActions = () => {
        setTimeout(() => {
            actionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    // --- Trigger Handlers ---

    const handleTriggerProviderSelect = async (plugin: PluginProviderRead) => {
        setSelectedTriggerProvider(plugin);
        setTriggerConfig({});
        
        try {
            const trigRes = await httpClient.get(`/api/v1/triggers?provider_id=${plugin.id}`);
            setTriggers(trigRes.data);
        } catch (e) {
            console.error(e);
        }
        
        setView('trigger-function');
    };

    const handleTriggerSelect = (plugin: PluginCapabilityRead) => {
        setSelectedTrigger(plugin);
        setTriggerConfig({});
        setView('trigger-config');
    };

    const handleTriggerConfigSubmit = () => {
        setView('root');
        scrollToActions();
    };

    // --- Action Handlers ---

    const handleActionProviderSelect = async (plugin: PluginProviderRead) => {
        setSelectedActionProvider(plugin);
        setActionConfig({});

        try {
            const actRes = await httpClient.get(`/api/v1/actions?provider_id=${plugin.id}`);
            setActions(actRes.data);
        } catch (e) {
            console.error(e);
        }

        setView('action-function');
    };

    const handleActionSelect = (plugin: PluginCapabilityRead) => {
        setSelectedAction(plugin);
        setActionConfig({});
        setView('action-config');
    };

    const handleActionConfigSubmit = () => {
        setView('root');
    };

    // --- Final Submit ---

    const handleCreate = async () => {
        if (!selectedTrigger || !selectedAction || !selectedTriggerProvider || !selectedActionProvider) return;

        setIsSubmitting(true);
        setError(null);

        const workflowData = {
            name: `${selectedTrigger.name} to ${selectedAction.name}`,
            description: null,
            is_enabled: false,
            is_public: true,
            trigger: {
                name: selectedTrigger.name,
                plugin_provider_id: selectedTriggerProvider.id,
                capability_key: selectedTrigger.unique_key,
                config: triggerConfig
            },
            action: {
                name: selectedAction.name,
                plugin_provider_id: selectedActionProvider.id,
                capability_key: selectedAction.unique_key,
                config: actionConfig
            }
        };

        if (!isAuthenticated) {
            sessionStorage.setItem('pendingWorkflow', JSON.stringify(workflowData));
            router.push('/auth/signup');
            return;
        }

        // Check auth status
        const triggerRequiresAuth = selectedTriggerProvider.auth_types && !selectedTriggerProvider.auth_types.includes('none');
        const actionRequiresAuth = selectedActionProvider.auth_types && !selectedActionProvider.auth_types.includes('none');

        const triggerConnected = accounts.includes(selectedTriggerProvider.id);
        const actionConnected = accounts.includes(selectedActionProvider.id);

        if ((triggerRequiresAuth && !triggerConnected) || (actionRequiresAuth && !actionConnected)) {
            setError("Please connect your required plugin accounts in the Connections tab before saving.");
            setIsSubmitting(false);
            return;
        }

        try {
            await httpClient.post('/api/v1/workflows/', workflowData);
            setView('success');
        } catch (err: any) {
            setError(err.response?.data?.detail?.[0]?.msg || err.message || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    const handleConnectProvider = async (provider: PluginProviderRead) => {
        if (!isAuthenticated) {
            // Save state and redirect to login
            const stateToSave = {
                triggerProvider: selectedTriggerProvider,
                triggerCap: selectedTrigger,
                triggerConf: triggerConfig,
                actionProvider: selectedActionProvider,
                actionCap: selectedAction,
                actionConf: actionConfig
            };
            sessionStorage.setItem('pendingWorkflowCreate', JSON.stringify(stateToSave));
            router.push(`/auth/login?next=/create&state=restored`);
            return;
        }

        const authTypes = provider.auth_types || [];
        
        // Priority 1: OAuth 2.0
        if (authTypes.includes('oauth2')) {
            try {
                // Use a clean redirect URI that user can register in console
                // We keep provider_id because it's needed by the callback page to identify the endpoint
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                const redirectUri = `${appUrl}/auth/plugin/callback?provider_id=${provider.id}&is_new_tab=true&dest=/create&state=restored`;
                
                const res = await httpClient.get(`/api/v1/plugins/accounts/${provider.id}/oauth/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
                if (res.data?.auth_url) {
                    window.open(res.data.auth_url, '_blank');
                }
            } catch (err) {
                console.error("Failed to get auth url", err);
                alert("Failed to initialize connection.");
            }
            return;
        }

        // Priority 2: Form-based auth (API Keys, tokens, etc.)
        const formAuthTypes = ['api_key', 'bot_token', 'webhook_secret', 'basic_auth'];
        if (authTypes.some(type => formAuthTypes.includes(type))) {
            setAuthModalProvider(provider);
            setIsAuthModalOpen(true);
            return;
        }

        alert("No supported authentication method found for this provider.");
    };

    const handleAuthSuccess = () => {
        // Refresh accounts list
        httpClient.get('/api/v1/plugins/accounts').then(accRes => {
            const connectedProviderIds = accRes.data.map((a: any) => a.plugin_provider_id);
            setAccounts(connectedProviderIds);
        });
    };

    const handleBack = () => {
        if (view === 'trigger-provider') setView('root');
        if (view === 'trigger-function') setView('trigger-provider');
        if (view === 'trigger-config') setView('trigger-function');
        if (view === 'action-provider') setView('root');
        if (view === 'action-function') setView('action-provider');
        if (view === 'action-config') setView('action-function');
    };

    // --- Render Helpers ---

    const renderSelectedCard = (
        type: 'trigger' | 'action',
        cap: PluginCapabilityRead,
        provider: PluginProviderRead,
        config: Record<string, string>,
        onEdit: () => void
    ) => {
        const requiresAuth = provider.auth_types && !provider.auth_types.includes('none');
        const isConnected = accounts.includes(provider.id);
        const authOk = !requiresAuth || isConnected;

        return (
            <div className="w-full max-w-2xl relative group">
                <div className={cn(
                    "bg-white dark:bg-zinc-950 border rounded-2xl p-6 shadow-sm transition-all",
                    !authOk && "border-amber-200 bg-amber-50/30 dark:bg-amber-900/10"
                )}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-black dark:bg-white text-black font-bold overflow-hidden">
                                {provider.logo_url ? (
                                    <img 
                                        src={provider.logo_url} 
                                        alt={provider.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerText = provider.name[0];
                                        }}
                                    />
                                ) : (
                                    provider.name[0]
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{cap.name}</h3>
                                <p className="text-zinc-500 text-sm">{provider.name}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
                    </div>

                    {/* Config Summary */}
                    <div className="space-y-1 mb-6">
                        {Object.entries(config).map(([key, value]) => (
                            <div key={key} className="text-sm">
                                <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}: </span>
                                <span className="font-medium truncate block sm:inline">{value}</span>
                            </div>
                        ))}
                        {Object.keys(config).length === 0 && (
                            <div className="text-sm text-zinc-400 italic">No configuration values.</div>
                        )}
                    </div>

                    {/* Auth Status / Connect Button */}
                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        {authOk ? (
                            <div className="flex items-center text-emerald-600 font-medium px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-sm">
                                <Check className="w-4 h-4 mr-1.5" strokeWidth={3} />
                                {requiresAuth ? "Connected" : "No Auth Required"}
                            </div>
                        ) : (
                            <div className="flex items-center text-amber-600 font-medium px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full text-sm">
                                Not Connected
                            </div>
                        )}

                        {!authOk && (
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-2 rounded-full overflow-hidden px-4" 
                                onClick={() => handleConnectProvider(provider)}
                            >
                                {!isAuthenticated ? (
                                    "Login to Connect"
                                ) : (
                                    <>
                                        {provider.logo_url && <img src={provider.logo_url} className="w-4 h-4 rounded-sm object-contain invert dark:invert-0" />}
                                        Connect {provider.name}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---

    if (dataLoading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
    }

    if (view === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-xl">
                    <Check size={48} strokeWidth={4} />
                </div>
                <h1 className="text-4xl font-black tracking-tight">Workflow Created!</h1>
                <p className="text-xl text-zinc-500">Your automation is now saved.</p>
                <div className="flex gap-4 mt-8">
                    <Link href="/dashboard">
                        <Button className="px-8" size="lg">Go to Dashboard</Button>
                    </Link>
                    <Button variant="outline" className="px-8" size="lg" onClick={() => {
                        setView('root'); setSelectedTrigger(null); setSelectedAction(null); setSelectedTriggerProvider(null); setSelectedActionProvider(null);
                    }}>Create Another</Button>
                </div>
            </div>
        )
    }

    if (view !== 'root') {
        // Selection Views
        const isTrigger = view.startsWith('trigger');

        let title = "";
        let content = null;

        if (view === 'trigger-provider') {
            title = "Choose a Trigger Service";
            content = (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {providers.filter(p => p.supports_trigger).map(p => (
                        <PluginCard key={p.id} plugin={p} onClick={() => handleTriggerProviderSelect(p)} />
                    ))}
                </div>
            );
        } else if (view === 'trigger-function') {
            title = `Select ${selectedTriggerProvider?.name} Event`;
            const provTriggers = triggers.filter(t => t.provider.id === selectedTriggerProvider?.id);
            content = (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provTriggers.map(t => (
                        <div key={t.unique_key} onClick={() => handleTriggerSelect(t)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
                            <h3 className="font-bold text-lg">{t.name}</h3>
                            <p className="text-zinc-500 text-sm mt-2">{t.description}</p>
                        </div>
                    ))}
                </div>
            );
        } else if (view === 'trigger-config') {
            title = `Configure ${selectedTrigger?.name}`;
            content = (
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm mx-auto">
                    {selectedTrigger?.config_fields && selectedTrigger.config_fields.length > 0 ? (
                        <ConfigForm
                            fields={selectedTrigger.config_fields}
                            values={triggerConfig}
                            onChange={(name, value) => setTriggerConfig(prev => ({ ...prev, [name]: value }))}
                        />
                    ) : (
                        <p className="text-zinc-500 text-center py-8">No specific configuration needed for this trigger.</p>
                    )}
                    <Button className="w-full mt-8" size="lg" onClick={handleTriggerConfigSubmit}>
                        Done <Check size={18} className="ml-2" />
                    </Button>
                </div>
            );
        } else if (view === 'action-provider') {
            title = "Choose an Action Service";
            content = (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {providers.filter(p => p.supports_action).map(p => (
                        <PluginCard key={p.id} plugin={p} onClick={() => handleActionProviderSelect(p)} />
                    ))}
                </div>
            );
        } else if (view === 'action-function') {
            title = `Select ${selectedActionProvider?.name} Action`;
            const provActions = actions.filter(a => a.provider.id === selectedActionProvider?.id);
            content = (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provActions.map(a => (
                        <div key={a.unique_key} onClick={() => handleActionSelect(a)} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
                            <h3 className="font-bold text-lg">{a.name}</h3>
                            <p className="text-zinc-500 text-sm mt-2">{a.description}</p>
                        </div>
                    ))}
                </div>
            );
        } else if (view === 'action-config') {
            title = `Configure ${selectedAction?.name}`;
            content = (
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm mx-auto">
                    {selectedAction?.config_fields && selectedAction.config_fields.length > 0 ? (
                        <ConfigForm
                            fields={selectedAction.config_fields}
                            values={actionConfig}
                            onChange={(name, value) => setActionConfig(prev => ({ ...prev, [name]: value }))}
                            availableVariables={(selectedTrigger?.outputs || []).map((o: string) => ({
                                name: `trigger.payload.${o}`,
                                label: `Trigger token: ${o}`
                            }))}
                        />
                    ) : (
                        <p className="text-zinc-500 text-center py-8">No specific configuration needed for this action.</p>
                    )}
                    <Button className="w-full mt-8" size="lg" onClick={handleActionConfigSubmit}>
                        Done <Check size={18} className="ml-2" />
                    </Button>
                </div>
            );
        }

        return (
            <div className="max-w-6xl mx-auto pb-20 pt-24 px-4">
                <div className="flex items-center gap-4 mb-12 justify-center relative">
                    <Button variant="outline" size="icon" onClick={handleBack} className="absolute left-0 w-12 h-12 border-2 rounded-2xl">
                        <ChevronLeft size={28} />
                    </Button>
                    <h2 className="text-3xl font-black tracking-tight text-center">{title}</h2>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                >
                    {content}
                </motion.div>
            </div>
        );
    }

    // Root View (The Stack)
    return (
        <div className="max-w-5xl mx-auto pb-32 pt-24 px-4">
            <div className="mb-16 text-center">
                <h1 className="text-5xl font-black tracking-tight mb-4">Create your own</h1>
                <p className="text-xl text-zinc-500">Connect two services to build powerful automations.</p>
            </div>

            <div className="flex flex-col items-center gap-4 relative">

                {/* Trigger Section */}
                <div className="w-full flex flex-col items-center z-10">

                    {!selectedTrigger || !selectedTriggerProvider ? (
                        <button
                            onClick={() => setView('trigger-provider')}
                            className="w-full max-w-lg h-32 bg-black dark:bg-zinc-900 border dark:border-zinc-800 text-white rounded-3xl flex items-center justify-center gap-4 text-3xl font-bold shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            <span className="bg-white/20 p-2 rounded-full"><Zap size={32} fill="currentColor" /></span>
                            Choose Trigger
                        </button>
                    ) : (
                        renderSelectedCard(
                            'trigger',
                            selectedTrigger,
                            selectedTriggerProvider,
                            triggerConfig,
                            () => setView('trigger-config')
                        )
                    )}
                </div>

                {/* Connector Line */}
                <div className="h-16 w-0.5 bg-zinc-200 dark:bg-zinc-800 my-2"></div>

                {/* Action Section */}
                <div ref={actionSectionRef} className="w-full flex flex-col items-center z-10">

                    {!selectedAction || !selectedActionProvider ? (
                        <button
                            onClick={() => setView('action-provider')}
                            className="w-full max-w-lg h-32 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-black dark:text-white border-2 border-dashed border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500 rounded-3xl flex items-center justify-center gap-4 text-3xl font-bold transition-all duration-300"
                        >
                            <span className="bg-black/5 dark:bg-white/10 p-2 rounded-full"><Play size={32} fill="currentColor" /></span>
                            Choose Action
                        </button>
                    ) : (
                        renderSelectedCard(
                            'action',
                            selectedAction,
                            selectedActionProvider,
                            actionConfig,
                            () => setView('action-config')
                        )
                    )}
                </div>

                {error && (
                    <div className="mt-8 bg-red-50 dark:bg-red-950/30 text-red-600 px-6 py-4 rounded-2xl w-full max-w-lg mx-auto text-center font-medium border border-red-100 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                {/* Create Button */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                    <Button
                        size="lg"
                        className={cn(
                            "w-full h-16 text-xl font-bold rounded-full shadow-2xl transition-all duration-500",
                            (selectedTrigger && selectedAction)
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-10 pointer-events-none"
                        )}
                        onClick={handleCreate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Saving Workflow...
                            </>
                        ) : (
                            "Create Workflow"
                        )}
                    </Button>
                </div>

                {/* Plugin Auth Modal */}
                <PluginAuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    provider={authModalProvider}
                    onSuccess={handleAuthSuccess}
                />

            </div>
        </div>
    );
}

export default function CreatePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>}>
            <CreatePageInternal />
        </Suspense>
    );
}
