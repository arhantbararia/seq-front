'use client';

import { Plugin } from "@/lib/mockData";
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

interface PluginCardProps {
    plugin: Plugin;
    onClick?: (plugin: Plugin) => void;
    selected?: boolean;
}

export function PluginCard({ plugin, onClick, selected }: PluginCardProps) {
    const Icon = iconMap[plugin.icon] || Globe;

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick && onClick(plugin)}
            className={cn(
                "cursor-pointer overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all relative aspect-square flex flex-col justify-between",
                plugin.color,
                selected ? "ring-4 ring-offset-4 ring-black dark:ring-white scale-105" : ""
            )}
        >
            <div className="bg-white/20 p-3 rounded-2xl w-fit backdrop-blur-sm">
                <Icon size={32} className="text-white" />
            </div>
            <div>
                <h3 className="text-2xl font-bold leading-tight">{plugin.name}</h3>
                <p className="opacity-90 mt-2 font-medium">{plugin.description}</p>
            </div>
        </motion.div>
    );
}
