'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PluginAuthModal } from "@/components/PluginAuthModal";
import { Plus, Link2, X, Zap } from "lucide-react";

interface PluginProvider {
    id: string;
    name: string;
    icon?: string;
    logo_url?: string;
    auth_types?: string[];
    supports_trigger?: boolean;
    supports_action?: boolean;
}

interface PluginAccount {
    id: string;
    plugin_provider_id: string;
    external_account_id?: string | null;
    status: string;
    created_at: string;
}

export default function ConnectionsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [providers, setProviders] = useState<PluginProvider[]>([]);
    const [accounts, setAccounts] = useState<PluginAccount[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalProvider, setAuthModalProvider] = useState<PluginProvider | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login?next=/connections');
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [provRes, accRes] = await Promise.all([
                httpClient.get('/api/v1/plugins/providers'),
                httpClient.get('/api/v1/plugins/accounts')
            ]);
            setProviders(provRes.data ?? []);
            setAccounts(accRes.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchData();

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'account-connected') {
                fetchData();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isAuthenticated]);

    const handleConnectProvider = async (provider: PluginProvider) => {
        const authTypes = provider.auth_types || [];

        if (authTypes.includes('oauth2')) {
            try {
                const res = await httpClient.get(
                    `/api/v1/plugins/accounts/${provider.id}/oauth/auth-url`
                );
                if (res.data?.auth_url) {
                    // Stash providerId so the callback page (in the popup) knows what to use
                    localStorage.setItem('oauth_provider_id', provider.id);
                    localStorage.setItem('oauth_is_new_tab', 'true');
                    window.open(res.data.auth_url, '_blank');
                }
            } catch (e) {
                console.error(e);
                alert("Failed to initialize OAuth flow");
            }
            return;
        }

        const formAuthTypes = ['api_key', 'bot_token', 'webhook_secret', 'basic_auth'];
        if (authTypes.some((type: string) => formAuthTypes.includes(type))) {
            setAuthModalProvider(provider);
            setIsAuthModalOpen(true);
            return;
        }

        alert("No supported authentication method found for this provider.");
    };

    // Disconnect by accountId (the PluginAccount.id), not the provider ID
    const handleDisconnect = async (accountId: string, providerName: string) => {
        if (!confirm(`Disconnect ${providerName}? All associated workflows using this connection will be affected.`)) return;
        try {
            await httpClient.delete(`/api/v1/plugins/accounts/${accountId}`);
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to disconnect");
        }
    };

    const handleAuthSuccess = () => {
        fetchData();
    };

    // Get provider details by plugin_provider_id
    const getProvider = (plugin_provider_id: string) =>
        providers.find(p => p.id === plugin_provider_id);

    // Accounts with their matched providers
    const connectedWithProviders = accounts
        .map(acc => ({ account: acc, provider: getProvider(acc.plugin_provider_id) }))
        .filter(({ provider }) => provider !== undefined) as { account: PluginAccount; provider: PluginProvider }[];

    // Providers that have no connected account
    const connectedProviderIds = new Set(accounts.map(a => a.plugin_provider_id));
    const unconnectedProviders = providers.filter(p => !connectedProviderIds.has(p.id));

    const getLogoUrl = (provider: PluginProvider) => {
        if (provider.logo_url) return provider.logo_url;
        if (provider.icon) {
            // If icon looks like a URL already, use it directly
            if (provider.icon.startsWith('http')) return provider.icon;
            // Otherwise treat it as a logo.dev domain hint
            const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
            return token ? `https://img.logo.dev/${provider.icon}?token=${token}` : null;
        }
        return null;
    };

    if (loading || authLoading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
                    <div className="h-4 w-72 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-24 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Connections</h1>
                    <p className="text-zinc-500 text-lg">Manage your connected plugin accounts securely.</p>
                </div>
            </div>

            <div className="space-y-16">
                {/* Connected Services */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h2 className="text-2xl font-bold">Your Connected Services</h2>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
                            {accounts.length} Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black dark:text-white">
                        {connectedWithProviders.map(({ account, provider }) => {
                            const logoUrl = getLogoUrl(provider);
                            return (
                                <div
                                    key={account.id}
                                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={provider.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                                                            `<span class="text-xl font-bold uppercase">${provider.name[0]}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-xl font-bold uppercase">{provider.name[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-0.5">{provider.name}</h3>
                                            <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                {account.status === 'active' ? 'Active' : account.status}
                                            </div>
                                        </div>
                                    </div>

                                    {account.external_account_id && (
                                        <p className="text-xs text-zinc-400 mb-3 font-mono truncate">
                                            ID: {account.external_account_id}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                                        {provider.supports_trigger && (
                                            <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <Zap size={10} /> Trigger
                                            </span>
                                        )}
                                        {provider.supports_action && (
                                            <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <Zap size={10} /> Action
                                            </span>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold gap-2"
                                            onClick={() => handleDisconnect(account.id, provider.name)}
                                        >
                                            <X size={16} /> Disconnect
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {accounts.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <Link2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                <p className="text-zinc-500 font-medium text-lg">You haven't connected any services yet.</p>
                                <p className="text-zinc-400 text-sm mt-2">Browse the services below to get started.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Available Services */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-black dark:bg-white rounded-full" />
                        <h2 className="text-2xl font-bold">Discover More Services</h2>
                    </div>

                    {unconnectedProviders.length === 0 ? (
                        <div className="py-16 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 font-medium">All available services are connected! 🎉</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {unconnectedProviders.map(provider => {
                                const logoUrl = getLogoUrl(provider);
                                return (
                                    <div
                                        key={provider.id}
                                        onClick={() => handleConnectProvider(provider)}
                                        className="group relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={20} className="text-zinc-400" />
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform duration-500 overflow-hidden shadow-inner">
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={provider.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                                                            `<span class="text-2xl font-black">${provider.name[0]}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-2xl font-black">{provider.name[0]}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{provider.name}</h3>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                                            {provider.auth_types?.includes('none') ? "No Auth" : "Auth Required"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <PluginAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                provider={authModalProvider}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}
