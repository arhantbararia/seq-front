'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getServiceIcon, isGenericIcon, getProviderColor } from "@/lib/providerBrands";
import { PluginProviderRead } from "./PluginCard";
import {
    Webhook, Clock, Rss, Mail, Globe, Twitter,
    Facebook, Youtube, Music, Instagram, Camera,
    Smartphone, HardDrive, FileText, Activity,
    Linkedin, MessageCircle, MessageSquare, Bell,
    Send, Calendar, Github
} from "lucide-react";

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

interface ProviderAvatarProps {
    provider?: PluginProviderRead | null;
    className?: string;
    style?: React.CSSProperties;
}

export function ProviderAvatar({ provider, className, style }: ProviderAvatarProps) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    if (!provider) {
        return (
            <div 
                className={cn(
                    "w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-900 text-xs shadow-sm",
                    className
                )} 
                style={style}
            >
                <Globe size={14} className="text-zinc-500" />
            </div>
        );
    }

    const brandColor = getProviderColor(provider.name);
    // Request white icons since background is colored
    const logoUrl = provider.logo_url || getServiceIcon(provider.icon, true);
    const showLogo = logoUrl && !imgError;
    const genericIcon = isGenericIcon(provider.icon);

    const IconComponent = iconMap[provider.icon?.toLowerCase()] || Globe;

    return (
        <div 
            className={cn(
                "relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 text-xs text-white shadow-sm overflow-hidden",
                className
            )} 
            style={{ backgroundColor: brandColor, ...style }}
            title={provider.name}
        >
            {showLogo ? (
                <>
                    <img
                        src={logoUrl!}
                        alt={provider.name}
                        className={cn(
                            "w-4 h-4 object-contain transition-opacity duration-300 z-10",
                            imgLoaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                    />
                    {!imgLoaded && (
                         <IconComponent size={14} className="absolute text-white opacity-50 inset-0 m-auto" />
                    )}
                </>
            ) : genericIcon ? (
                <IconComponent size={14} className="text-white" />
            ) : (
                <span className="font-bold uppercase text-white leading-none">{provider.name[0]}</span>
            )}
        </div>
    );
}
