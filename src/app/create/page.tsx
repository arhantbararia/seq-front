'use client';

import { useState } from 'react';
import { TRIGGERS, ACTIONS, Plugin } from "@/lib/mockData";
import { PluginCard } from "@/components/PluginCard";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, Check, ChevronLeft } from "lucide-react";
import Link from 'next/link';

export default function CreatePage() {
    const [selectedTrigger, setSelectedTrigger] = useState<Plugin | null>(null);
    const [selectedAction, setSelectedAction] = useState<Plugin | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCreate = async () => {
        setIsSubmitting(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Created workflow:', { trigger: selectedTrigger, action: selectedAction });
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
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

            <div className="flex flex-col md:flex-row gap-8 items-start relative">

                {/* Step 1: Trigger */}
                <div className={`flex-1 w-full transition-all duration-500 ${selectedTrigger ? 'md:max-w-sm' : ''}`}>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="bg-black text-white dark:bg-white dark:text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Trigger
                        </h2>
                        {selectedTrigger && (
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedTrigger(null); setSelectedAction(null); }}>
                                Change
                            </Button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedTrigger ? (
                            <motion.div
                                key="selected-trigger"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <PluginCard plugin={selectedTrigger} selected />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="trigger-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            >
                                {TRIGGERS.map(t => (
                                    <PluginCard key={t.id} plugin={t} onClick={setSelectedTrigger} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Connector Arrow */}
                {selectedTrigger && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden md:flex self-center text-zinc-300"
                    >
                        <ChevronRight size={48} />
                    </motion.div>
                )}

                {/* Step 2: Action */}
                <AnimatePresence>
                    {selectedTrigger && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 w-full"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <span className="bg-black text-white dark:bg-white dark:text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                    Action
                                </h2>
                                {selectedAction && (
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                                        Change
                                    </Button>
                                )}
                            </div>

                            {selectedAction ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <PluginCard plugin={selectedAction} selected />
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {ACTIONS.map(a => (
                                        <PluginCard key={a.id} plugin={a} onClick={setSelectedAction} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Step 3: Action Bar */}
            <AnimatePresence>
                {selectedTrigger && selectedAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                    >
                        <div className="flex items-center gap-4 max-w-4xl w-full justify-between">
                            <div className="hidden md:flex items-center gap-4">
                                <span className="font-bold">{selectedTrigger.name}</span>
                                <ArrowRight size={16} />
                                <span className="font-bold">{selectedAction.name}</span>
                            </div>
                            <Button size="lg" onClick={handleCreate} disabled={isSubmitting} className="w-full md:w-auto text-lg px-12 rounded-full">
                                {isSubmitting ? 'Connecting...' : 'Connect'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
