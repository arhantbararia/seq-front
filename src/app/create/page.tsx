'use client';

import { useState } from 'react';
import { TRIGGERS, ACTIONS, Plugin } from "@/lib/mockData";
import { PluginCard } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { ConfigForm } from "@/components/ConfigForm";
import { createWorkflow, WorkflowCreate } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, Check, ChevronLeft } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
    const router = useRouter();
    // Steps:
    // 1: Trigger Provider Select
    // 2: Trigger Function Select
    // 3: Trigger Config
    // 4: Action Provider Select
    // 5: Action Function Select
    // 6: Action Config
    // 7: Success
    const [step, setStep] = useState(1);

    const [selectedTriggerProvider, setSelectedTriggerProvider] = useState<string | null>(null);
    const [selectedTrigger, setSelectedTrigger] = useState<Plugin | null>(null);
    const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});

    const [selectedActionProvider, setSelectedActionProvider] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<Plugin | null>(null);
    const [actionConfig, setActionConfig] = useState<Record<string, string>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper functions
    const getUniqueProviders = (plugins: Plugin[]) => {
        return Array.from(new Map(plugins.map(p => [p.name, p])).values());
    };

    const getPluginsByProvider = (plugins: Plugin[], providerName: string) => {
        return plugins.filter(p => p.name === providerName);
    };

    // Handlers
    const handleTriggerProviderSelect = (plugin: Plugin) => {
        setSelectedTriggerProvider(plugin.name);
        setStep(2);
    };

    const handleTriggerSelect = (plugin: Plugin) => {
        setSelectedTrigger(plugin);
        setStep(3);
    };

    const handleTriggerConfigSubmit = () => {
        setStep(4);
    };

    const handleActionProviderSelect = (plugin: Plugin) => {
        setSelectedActionProvider(plugin.name);
        setStep(5);
    };

    const handleActionSelect = (plugin: Plugin) => {
        setSelectedAction(plugin);
        setStep(6);
    };

    const handleBack = () => {
        if (step === 2) {
            setSelectedTriggerProvider(null);
            setStep(1);
        } else if (step === 3) {
            setSelectedTrigger(null);
            setStep(2);
        } else if (step === 4) {
            // Going back from Action Provider Select means going back to Trigger Config (Step 3)
            setStep(3);
        } else if (step === 5) {
            setSelectedActionProvider(null);
            setStep(4);
        } else if (step === 6) {
            setSelectedAction(null);
            setStep(5);
        }
    };

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
            setStep(7);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 7) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-xl"
                >
                    <Check size={48} strokeWidth={4} />
                </motion.div>
                <h1 className="text-4xl font-bold">Connected!</h1>
                <p className="text-xl text-zinc-500">Your automation is now running.</p>
                <Link href="/">
                    <Button className="mt-8">Back to Home</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2">Create your own</h1>
                <p className="text-zinc-500">Connect two services together.</p>
            </div>

            <div className="flex flex-col items-center max-w-4xl mx-auto">
                {/* Step Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-2 mb-8 text-sm text-zinc-500">
                    <span className={step >= 1 ? "text-primary font-bold" : ""}>Trigger Service</span>
                    <ChevronRight size={14} />
                    <span className={step >= 2 ? "text-primary font-bold" : ""}>Event</span>
                    <ChevronRight size={14} />
                    <span className={step >= 3 ? "text-primary font-bold" : ""}>Config</span>
                    <ChevronRight size={14} />
                    <span className={step >= 4 ? "text-primary font-bold" : ""}>Action Service</span>
                    <ChevronRight size={14} />
                    <span className={step >= 5 ? "text-primary font-bold" : ""}>Function</span>
                    <ChevronRight size={14} />
                    <span className={step >= 6 ? "text-primary font-bold" : ""}>Config</span>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Trigger Provider Select */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-center">Choose a Trigger Service</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {getUniqueProviders(TRIGGERS).map(t => (
                                    <PluginCard key={t.id} plugin={t} onClick={handleTriggerProviderSelect} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Trigger Function Select */}
                    {step === 2 && selectedTriggerProvider && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <div className="flex items-center gap-4 mb-6 justify-center relative">
                                <Button variant="ghost" size="icon" onClick={handleBack} className="absolute left-0">
                                    <ChevronLeft size={20} />
                                </Button>
                                <h2 className="text-2xl font-bold text-center">Select {selectedTriggerProvider} Event</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {getPluginsByProvider(TRIGGERS, selectedTriggerProvider).map(t => (
                                    <PluginCard key={t.id} plugin={t} onClick={handleTriggerSelect} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Trigger Config */}
                    {step === 3 && selectedTrigger && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-2xl bg-card border rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <Button variant="ghost" size="icon" onClick={handleBack}>
                                    <ChevronLeft size={20} />
                                </Button>
                                <h2 className="text-2xl font-bold">Configure {selectedTrigger.description}</h2>
                            </div>

                            {selectedTrigger.configFields && selectedTrigger.configFields.length > 0 ? (
                                <ConfigForm
                                    fields={selectedTrigger.configFields}
                                    values={triggerConfig}
                                    onChange={(name, value) => setTriggerConfig(prev => ({ ...prev, [name]: value }))}
                                />
                            ) : (
                                <p className="text-zinc-500">No configuration needed.</p>
                            )}

                            <Button className="w-full mt-6" onClick={handleTriggerConfigSubmit}>
                                Next <ChevronRight size={16} className="ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 4: Action Provider Select */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <div className="flex items-center gap-4 mb-6 justify-center relative">
                                <Button variant="ghost" size="icon" onClick={handleBack} className="absolute left-0">
                                    <ChevronLeft size={20} />
                                </Button>
                                <h2 className="text-2xl font-bold text-center">Choose an Action Service</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {getUniqueProviders(ACTIONS).map(a => (
                                    <PluginCard key={a.id} plugin={a} onClick={handleActionProviderSelect} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Action Function Select */}
                    {step === 5 && selectedActionProvider && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <div className="flex items-center gap-4 mb-6 justify-center relative">
                                <Button variant="ghost" size="icon" onClick={handleBack} className="absolute left-0">
                                    <ChevronLeft size={20} />
                                </Button>
                                <h2 className="text-2xl font-bold text-center">Select {selectedActionProvider} Action</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {getPluginsByProvider(ACTIONS, selectedActionProvider).map(a => (
                                    <PluginCard key={a.id} plugin={a} onClick={handleActionSelect} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 6: Action Config */}
                    {step === 6 && selectedAction && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-2xl bg-card border rounded-xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <Button variant="ghost" size="icon" onClick={handleBack}>
                                    <ChevronLeft size={20} />
                                </Button>
                                <h2 className="text-2xl font-bold">Configure {selectedAction.description}</h2>
                            </div>

                            {selectedAction.configFields && selectedAction.configFields.length > 0 ? (
                                <ConfigForm
                                    fields={selectedAction.configFields}
                                    values={actionConfig}
                                    onChange={(name, value) => setActionConfig(prev => ({ ...prev, [name]: value }))}
                                />
                            ) : (
                                <p className="text-zinc-500">No configuration needed.</p>
                            )}

                            {error && (
                                <div className="p-3 bg-red-100 text-red-600 rounded-md mt-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button className="w-full mt-6" onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? 'Connecting...' : 'Connect'}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
