'use client';

import { cn } from "@/lib/utils";
import {
    Webhook, Clock, Rss, Mail, Globe, Twitter,
    Facebook, Youtube, Music, Instagram, Camera,
    Smartphone, HardDrive, FileText, Activity,
    Linkedin, MessageCircle, MessageSquare, Bell,
    Send, Calendar, Github
} from "lucide-react";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.FC<any>> = {
    webhook: Webhook,
    clock: Clock,
    rss: Rss,
    mail: Mail,
    globe: Globe,
    twitter: Twitter,
    facebook: Facebook,
    youtube: Youtube,
    music: Music,
    instagram: Instagram,
    camera: Camera,
    smartphone: Smartphone,
    'hard-drive': HardDrive,
    'file-text': FileText,
    activity: Activity,
    linkedin: Linkedin,
    'message-circle': MessageCircle,
    'message-square': MessageSquare,
    bell: Bell,
    send: Send,
    calendar: Calendar,
    github: Github,
};

const colorMap = [
    "bg-zinc-900 border border-zinc-800 text-white",
    "bg-blue-600 border border-blue-500 text-white",
    "bg-emerald-600 border border-emerald-500 text-white",
    "bg-purple-600 border border-purple-500 text-white",
    "bg-orange-600 border border-orange-500 text-white",
    "bg-rose-600 border border-rose-500 text-white"
];

const getDeterministicColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return colorMap[Math.abs(hash) % colorMap.length];
};

export interface PluginProviderRead {
    id: string;
    name: string;
    icon: string;
    logo_url?: string;
    supports_trigger: boolean;
    supports_action: boolean;
    created_at: string;
    auth_types?: string[];
}

interface PluginCardProps {
    plugin: PluginProviderRead;
    onClick?: (plugin: PluginProviderRead) => void;
    selected?: boolean;
}

export function PluginCard({ plugin, onClick, selected }: PluginCardProps) {
    const IconComponent = iconMap[plugin.icon] || Globe;
    const bgClass = getDeterministicColor(plugin.name);

    const getLogoUrl = () => {
        if (plugin.logo_url) return plugin.logo_url;
        if (plugin.icon) {
            if (plugin.icon.startsWith('http')) return plugin.icon;
            const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
            return token ? `https://img.logo.dev/${plugin.icon}?token=${token}` : null;
        }
        return null;
    };

    const logoUrl = getLogoUrl();

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick && onClick(plugin)}
            className={cn(
                "cursor-pointer overflow-hidden rounded-3xl p-6 shadow-xl transition-all relative aspect-[4/3] flex flex-col justify-between",
                bgClass,
                selected ? "ring-4 ring-offset-4 ring-black dark:ring-white scale-105" : ""
            )}
        >
            <div className="bg-white/20 p-3 rounded-2xl w-fit backdrop-blur-sm overflow-hidden">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={plugin.name}
                        className="w-8 h-8 object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML =
                                `<span class="text-xl font-bold uppercase">${plugin.name[0]}</span>`;
                        }}
                    />
                ) : (
                    <IconComponent size={32} className="text-white" />
                )}
            </div>
            <div>
                <h3 className="text-xl font-bold leading-tight truncate">{plugin.name}</h3>
                <p className="opacity-90 mt-1 font-medium text-sm">
                    {plugin.supports_trigger && "Triggers "}
                    {plugin.supports_trigger && plugin.supports_action && "• "}
                    {plugin.supports_action && "Actions"}
                </p>
            </div>
        </motion.div>
    );
}
