/**
 * Provider Brand Registry
 *
 * Maps plugin provider names → brand colors and fallback icon identifiers.
 * The backend `icon` field contains either:
 *   - A logo.dev domain (e.g. "youtube.com") for brand providers
 *   - A generic Lucide icon key (e.g. "clock", "webhook", "bell") for utility providers
 *   - "default" for unmapped providers
 *
 * This module provides the color/styling layer on top of that.
 */

// ── Brand color map keyed by lowercase provider name ──
// Colors sourced from official brand guidelines.
export const PROVIDER_BRAND_COLORS: Record<string, string> = {
    youtube: "#FF0000",
    spotify: "#1DB954",
    github: "#181717",
    "x.com": "#000000",
    telegram: "#26A5E4",
    reddit: "#FF4500",
    gmail: "#EA4335",
    facebook: "#1877F2",
    linkedin: "#0A66C2",
    whatsapp: "#25D366",
    instagram: "#E4405F",
    "google calendar": "#4285F4",
    "google sheets": "#0F9D58",
    soundcloud: "#FF5500",
    blogger: "#FF5722",
    fitbit: "#00B0B9",
    clicksend: "#2196F3",
    threads: "#000000",
    email: "#6366F1",
    webhooks: "#6366F1",
    "date & time": "#8B5CF6",
    notifications: "#F59E0B",
    "android device": "#3DDC84",
    "android sms": "#3DDC84",
};

// ── Generic icon keys ──
// These are icon values from the backend that are NOT logo.dev domains.
// The frontend should render them as Lucide icons rather than <img> tags.
const GENERIC_ICON_KEYS = new Set([
    "default",
    "clock",
    "rss",
    "mail",
    "globe",
    "webhook",
    "music",
    "bell",
    "smartphone",
    "camera",
    "hard-drive",
    "file-text",
    "activity",
    "message-circle",
    "message-square",
    "send",
    "calendar",
]);

/**
 * Returns true if the icon value is a generic Lucide key (not a logo.dev domain).
 */
export function isGenericIcon(icon: string): boolean {
    if (!icon) return true;
    return GENERIC_ICON_KEYS.has(icon.toLowerCase());
}

/**
 * Build the logo.dev URL for a provider's icon field.
 * Returns null if the icon is generic (should use Lucide instead).
 */
export function getProviderLogoUrl(icon: string, logoUrl?: string): string | null {
    // Explicit logo_url always wins
    if (logoUrl) return logoUrl;
    if (!icon) return null;

    // Already a full URL
    if (icon.startsWith("http")) return icon;

    // Generic icons → no logo.dev URL
    if (isGenericIcon(icon)) return null;

    // It's a logo.dev domain
    const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
    if (!token) return null;
    return `https://img.logo.dev/${icon}?token=${token}&size=64`;
}

/**
 * Get the brand color for a provider by name.
 * Falls back to a deterministic color for unknown providers.
 */
export function getProviderColor(providerName: string): string {
    const color = PROVIDER_BRAND_COLORS[providerName.toLowerCase()];
    if (color) return color;

    // Deterministic hash-based fallback for unknown providers
    let hash = 0;
    for (let i = 0; i < providerName.length; i++) {
        hash = providerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const fallbackColors = [
        "#18181B", "#3B82F6", "#10B981", "#8B5CF6", "#F97316", "#EF4444",
    ];
    return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

/**
 * Compute a lighter tinted version of a hex color for card overlays.
 */
export function tintColor(hex: string, amount: number = 0.15): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
    const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
    const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
    return `rgb(${r}, ${g}, ${b})`;
}
