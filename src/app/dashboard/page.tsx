'use client';

import { TRIGGERS, ACTIONS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

// Mock Data for User's Active Applets
const MY_APPLETS = [
    {
        id: '1',
        trigger: TRIGGERS[0], // Webhook
        action: ACTIONS[0],   // Email
        isActive: true,
        createdAt: '2023-10-27',
    },
    {
        id: '2',
        trigger: TRIGGERS[1], // Timer
        action: ACTIONS[1],   // Webhook Action
        isActive: true,
        createdAt: '2023-11-01',
    },
    {
        id: '3',
        trigger: TRIGGERS[2], // RSS
        action: ACTIONS[2],   // Twitter
        isActive: false,
        createdAt: '2023-11-15',
    }
];

export default function DashboardPage() {
    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">My Applets</h1>
                    <p className="text-zinc-500">Manage your active automations.</p>
                </div>
                <Link href="/create">
                    <Button className="rounded-full px-6 gap-2">
                        <Plus size={18} />
                        Create
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MY_APPLETS.map((applet, index) => (
                    <motion.div
                        key={applet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            relative p-6 rounded-3xl border-2 transition-all hover:scale-[1.02] cursor-pointer group
                            ${applet.isActive
                                ? 'bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm hover:shadow-xl'
                                : 'bg-zinc-50 border-zinc-100 dark:bg-black dark:border-zinc-800 opacity-75 grayscale-[0.5]'}
                        `}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex -space-x-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md border-4 border-white dark:border-zinc-900 ${applet.trigger.color}`}>
                                    {/* Ideally render icon component here */}
                                    <span className="font-bold text-xs">IF</span>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md border-4 border-white dark:border-zinc-900 ${applet.action.color} z-10`}>
                                    <span className="font-bold text-xs">THEN</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${applet.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'}`}>
                                {applet.isActive ? 'On' : 'Off'}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                            If {applet.trigger.name}, then {applet.action.name.toLowerCase()}
                        </h3>

                        <p className="text-sm text-zinc-500 line-clamp-2">
                            {applet.trigger.description} → {applet.action.description}
                        </p>

                        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-sm font-medium text-zinc-500">
                            <span>Connected</span>
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-600" />
                        </div>
                    </motion.div>
                ))}

                {/* Create New Card (Empty State) */}
                <Link href="/create">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                        <Plus size={48} className="mb-4 opacity-50" />
                        <span className="font-bold">Create new Applet</span>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
