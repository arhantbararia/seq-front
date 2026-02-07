'use client';

import { useState, useRef, useEffect } from 'react';
import { TRIGGERS, ACTIONS, Plugin } from "@/lib/mockData";
import { PluginCard } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { ConfigForm } from "@/components/ConfigForm";
import { createWorkflow, WorkflowCreate } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Zap, Play, Loader2, Link2 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function CreatePage() {
    const router = useRouter();
    const actionSectionRef = useRef<HTMLDivElement>(null);

    // View State
    const [view, setView] = useState<ViewState>('root');

    // Trigger State
    const [selectedTriggerProvider, setSelectedTriggerProvider] = useState<string | null>(null);
    const [selectedTrigger, setSelectedTrigger] = useState<Plugin | null>(null);
    const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
    const [triggerAuthenticated, setTriggerAuthenticated] = useState(false);
    const [isTriggerAuthenticating, setIsTriggerAuthenticating] = useState(false);

    // Action State
    const [selectedActionProvider, setSelectedActionProvider] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<Plugin | null>(null);
    const [actionConfig, setActionConfig] = useState<Record<string, string>>({});
    const [actionAuthenticated, setActionAuthenticated] = useState(false);
    const [isActionAuthenticating, setIsActionAuthenticating] = useState(false);

    // Global State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helpers
    const getUniqueProviders = (plugins: Plugin[]) => {
        return Array.from(new Map(plugins.map(p => [p.name, p])).values());
    };

    const getPluginsByProvider = (plugins: Plugin[], providerName: string) => {
        return plugins.filter(p => p.name === providerName);
    };

    const scrollToActions = () => {
        setTimeout(() => {
            actionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    // --- Trigger Handlers ---

    const handleTriggerProviderSelect = (plugin: Plugin) => {
        setSelectedTriggerProvider(plugin.name);
        setTriggerConfig({});
        setTriggerAuthenticated(false);
        setView('trigger-function');
    };

    const handleTriggerSelect = (plugin: Plugin) => {
        setSelectedTrigger(plugin);
        setTriggerConfig({});
        setTriggerAuthenticated(false);
        setView('trigger-config');
    };

    const handleTriggerConfigSubmit = () => {
        setView('root');
        // Auto-check auth requirements
        if (!selectedTrigger?.authType || selectedTrigger.authType === 'None') {
            setTriggerAuthenticated(true);
            scrollToActions();
        }
    };

    const handleTriggerConnect = () => {
        setIsTriggerAuthenticating(true);
        // Simulate Auth
        setTimeout(() => {
            setIsTriggerAuthenticating(false);
            setTriggerAuthenticated(true);
            scrollToActions();
        }, 1500);
    };

    // --- Action Handlers ---

    const handleActionProviderSelect = (plugin: Plugin) => {
        setSelectedActionProvider(plugin.name);
        setActionConfig({});
        setActionAuthenticated(false);
        setView('action-function');
    };

    const handleActionSelect = (plugin: Plugin) => {
        setSelectedAction(plugin);
        setActionConfig({});
        setActionAuthenticated(false);
        setView('action-config');
    };

    const handleActionConfigSubmit = () => {
        setView('root');
        // Auto-check auth requirements
        if (!selectedAction?.authType || selectedAction.authType === 'None') {
            setActionAuthenticated(true);
        }
    };

    const handleActionConnect = () => {
        setIsActionAuthenticating(true);
        // Simulate Auth
        setTimeout(() => {
            setIsActionAuthenticating(false);
            setActionAuthenticated(true);
        }, 1500);
    };

    // --- Final Submit ---

    const handleCreate = async () => {
        if (!selectedTrigger || !selectedAction) return;

        setIsSubmitting(true);
        setError(null);

        const workflowData: WorkflowCreate = {
            name: `${selectedTrigger.name} to ${selectedAction.name}`,
            description: `Workflow triggered by ${selectedTrigger.name} and performing ${selectedAction.name}`,
            workflow_json: {
                trigger: {
                    name: selectedTrigger.id,
                    config: triggerConfig
                },
                action: {
                    name: selectedAction.id,
                    config: actionConfig
                }
            }
        };

        try {
            await createWorkflow(workflowData);
            setView('success');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setIsSubmitting(false);
        }
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
        plugin: Plugin,
        config: Record<string, string>,
        authenticated: boolean,
        authenticating: boolean,
        onConnect: () => void,
        onEdit: () => void
    ) => {
        const needsAuth = plugin.authType && plugin.authType !== 'None';
        const isReady = authenticated || !needsAuth;

        return (
            <div className="w-full max-w-2xl relative group">
                <div className={cn(
                    "bg-card border rounded-2xl p-6 shadow-sm transition-all",
                    !isReady && "border-primary/20 bg-primary/5"
                )}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", plugin.color)}>
                                {/* Icon would go here */}
                                <span className="font-bold text-xl">{plugin.name[0]}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{plugin.description}</h3>
                                <p className="text-muted-foreground text-sm">{plugin.name}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
                    </div>

                    {/* Config Summary */}
                    <div className="space-y-1 mb-6">
                        {Object.entries(config).map(([key, value]) => (
                            <div key={key} className="text-sm">
                                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}: </span>
                                <span className="font-medium truncate block sm:inline">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Auth Status / Connect Button */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2 text-sm">
                            {needsAuth ? (
                                <>
                                    <span className="text-muted-foreground">Authentication:</span>
                                    <span className="font-medium">{plugin.authType}</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">No authentication required</span>
                            )}
                        </div>

                        {needsAuth && !authenticated && (
                            <Button
                                onClick={onConnect}
                                disabled={authenticating}
                                className="min-w-[120px]"
                            >
                                {authenticating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="mr-2 h-4 w-4" />
                                        Login to Connect
                                    </>
                                )}
                            </Button>
                        )}

                        {(authenticated || !needsAuth) && (
                            <div className="flex items-center text-green-600 font-medium px-4 py-2 bg-green-50 rounded-full text-sm">
                                <Check className="w-4 h-4 mr-1.5" strokeWidth={3} />
                                Connected
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---

    if (view === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-xl">
                    <Check size={48} strokeWidth={4} />
                </div>
                <h1 className="text-4xl font-bold">Workflow Created!</h1>
                <p className="text-xl text-zinc-500">Your automation is now active and running.</p>
                <Link href="/">
                    <Button className="mt-8" size="lg">Back to Home</Button>
                </Link>
            </div>
        )
    }

    if (view !== 'root') {
        // Selection Views
        const isTrigger = view.startsWith('trigger');
        const isConfig = view.includes('config');
        const isFunction = view.includes('function');

        let title = "";
        let content = null;

        if (view === 'trigger-provider') {
            title = "Choose a Trigger Service";
            content = (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getUniqueProviders(TRIGGERS).map(t => (
                        <PluginCard key={t.id} plugin={t} onClick={handleTriggerProviderSelect} />
                    ))}
                </div>
            );
        } else if (view === 'trigger-function') {
            title = `Select ${selectedTriggerProvider} Event`;
            content = (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getPluginsByProvider(TRIGGERS, selectedTriggerProvider!).map(t => (
                        <PluginCard key={t.id} plugin={t} onClick={handleTriggerSelect} />
                    ))}
                </div>
            );
        } else if (view === 'trigger-config') {
            title = `Configure ${selectedTrigger?.description}`;
            content = (
                <div className="w-full max-w-2xl bg-card border rounded-xl p-6 shadow-sm mx-auto">
                    {selectedTrigger?.configFields && selectedTrigger.configFields.length > 0 ? (
                        <ConfigForm
                            fields={selectedTrigger.configFields}
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
                    {getUniqueProviders(ACTIONS).map(a => (
                        <PluginCard key={a.id} plugin={a} onClick={handleActionProviderSelect} />
                    ))}
                </div>
            );
        } else if (view === 'action-function') {
            title = `Select ${selectedActionProvider} Action`;
            content = (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getPluginsByProvider(ACTIONS, selectedActionProvider!).map(a => (
                        <PluginCard key={a.id} plugin={a} onClick={handleActionSelect} />
                    ))}
                </div>
            );
        } else if (view === 'action-config') {
            title = `Configure ${selectedAction?.description}`;
            content = (
                <div className="w-full max-w-2xl bg-card border rounded-xl p-6 shadow-sm mx-auto">
                    {selectedAction?.configFields && selectedAction.configFields.length > 0 ? (
                        <ConfigForm
                            fields={selectedAction.configFields}
                            values={actionConfig}
                            onChange={(name, value) => setActionConfig(prev => ({ ...prev, [name]: value }))}
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
            <div className="max-w-6xl mx-auto pb-20 pt-8 px-4">
                <div className="flex items-center gap-4 mb-8 justify-center relative">
                    <Button variant="outline" size="icon" onClick={handleBack} className="absolute left-0 w-12 h-12 border-2 rounded-xl">
                        <ChevronLeft size={28} />
                    </Button>
                    <h2 className="text-3xl font-bold text-center">{title}</h2>
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
        <div className="max-w-5xl mx-auto pb-32 pt-10 px-4">
            <div className="mb-16 text-center">
                <h1 className="text-5xl font-black tracking-tight mb-4">Create your own</h1>
                <p className="text-xl text-zinc-500">Connect two services to build powerful automations.</p>
            </div>

            <div className="flex flex-col items-center gap-4 relative">

                {/* Trigger Section */}
                <div className="w-full flex flex-col items-center z-10">

                    {!selectedTrigger ? (
                        <button
                            onClick={() => setView('trigger-provider')}
                            className="w-full max-w-lg h-32 bg-black hover:bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-4 text-3xl font-bold shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <span className="bg-white/20 p-2 rounded-full"><Zap size={32} fill="currentColor" /></span>
                            Choose Trigger
                        </button>
                    ) : (
                        renderSelectedCard(
                            'trigger',
                            selectedTrigger,
                            triggerConfig,
                            triggerAuthenticated,
                            isTriggerAuthenticating,
                            handleTriggerConnect,
                            () => setView('trigger-config') // Allow re-editing config
                        )
                    )}
                </div>

                {/* Connector Line */}
                <div className="h-16 w-0.5 bg-border my-2"></div>

                {/* Action Section */}
                <div ref={actionSectionRef} className="w-full flex flex-col items-center z-10">

                    {!selectedAction ? (
                        <button
                            onClick={() => setView('action-provider')}
                            className="w-full max-w-lg h-32 bg-zinc-100 hover:bg-zinc-200 text-black border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-2xl flex items-center justify-center gap-4 text-3xl font-bold transition-all duration-300"
                        >
                            <span className="bg-black/5 p-2 rounded-full"><Play size={32} fill="currentColor" /></span>
                            Choose Action
                        </button>
                    ) : (
                        renderSelectedCard(
                            'action',
                            selectedAction,
                            actionConfig,
                            actionAuthenticated,
                            isActionAuthenticating,
                            handleActionConnect,
                            () => setView('action-config')
                        )
                    )}
                </div>

                {/* Create Button (Sticky Bottom or just bottom) */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                    <Button
                        size="lg"
                        className={cn(
                            "w-full h-16 text-xl rounded-full shadow-2xl transition-all duration-500",
                            (triggerAuthenticated && actionAuthenticated)
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-10 pointer-events-none"
                        )}
                        onClick={handleCreate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Creating Workflow...
                            </>
                        ) : (
                            "Create Workflow"
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
}
