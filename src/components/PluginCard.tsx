'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    getProviderLogoUrl,
    getProviderColor,
    tintColor,
    isGenericIcon,
} from "@/lib/providerBrands";
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
    default: Globe,
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
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const logoUrl = getProviderLogoUrl(plugin.icon, plugin.logo_url);
    const brandColor = getProviderColor(plugin.name);
    const brandTint = tintColor(brandColor, 0.08);
    const showLogo = logoUrl && !imgError;
    const genericIcon = isGenericIcon(plugin.icon);

    // Resolve fallback Lucide icon
    const IconComponent = iconMap[plugin.icon?.toLowerCase()] || Globe;

    return (
        <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick && onClick(plugin)}
            className={cn(
                "cursor-pointer overflow-hidden rounded-3xl p-6 shadow-lg transition-all relative aspect-[4/3] flex flex-col justify-between border",
                selected ? "ring-4 ring-offset-4 ring-black dark:ring-white scale-105" : ""
            )}
            style={{
                backgroundColor: brandColor,
                borderColor: brandTint,
                color: "#fff",
            }}
        >
            {/* Subtle gradient overlay for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.15) 100%)`,
                }}
            />

            {/* Icon container */}
            <div className="relative z-10">
                <div className="bg-white/20 p-3 rounded-2xl w-fit backdrop-blur-sm overflow-hidden">
                    {showLogo ? (
                        <img
                            src={logoUrl}
                            alt={plugin.name}
                            className={cn(
                                "w-8 h-8 object-contain transition-opacity duration-300",
                                imgLoaded ? "opacity-100" : "opacity-0"
                            )}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        genericIcon ? (
                            <IconComponent size={32} className="text-white" />
                        ) : (
                            <span className="text-xl font-bold uppercase text-white w-8 h-8 flex items-center justify-center">
                                {plugin.name[0]}
                            </span>
                        )
                    )}

                    {/* Show Lucide icon while image is loading */}
                    {showLogo && !imgLoaded && (
                        <IconComponent size={32} className="text-white absolute inset-0 m-auto" />
                    )}
                </div>
            </div>

            {/* Text */}
            <div className="relative z-10">
                <h3 className="text-xl font-bold leading-tight truncate">{plugin.name}</h3>
                <p className="opacity-80 mt-1 font-medium text-sm">
                    {plugin.supports_trigger && "Triggers "}
                    {plugin.supports_trigger && plugin.supports_action && "• "}
                    {plugin.supports_action && "Actions"}
                </p>
            </div>
        </motion.div>
    );
}
