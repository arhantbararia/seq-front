'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { httpClient } from '@/lib/httpClient';
import { getProviderLogoUrl, getProviderColor } from '@/lib/providerBrands';

interface PluginAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: {
        id: string;
        name: string;
        logo_url?: string;
        icon?: string;
        auth_types?: string[];
    } | null;
    onSuccess: () => void;
}

// Derive the primary auth type from the provider's auth_types list
function getPrimaryAuthType(authTypes: string[]): string {
    const priority = ['oauth2', 'bot_token', 'api_key', 'webhook_secret', 'basic_auth'];
    return priority.find(t => authTypes.includes(t)) ?? 'api_key';
}

interface FieldConfig {
    id: string;
    label: string;
    placeholder: string;
    type: 'password' | 'text';
}

function getFieldConfigs(authType: string): FieldConfig[] {
    switch (authType) {
        case 'bot_token':
            return [{ id: 'bot_token', label: 'Bot Token', placeholder: 'Enter your bot token...', type: 'password' }];
        case 'webhook_secret':
            return [{ id: 'webhook_secret', label: 'Webhook Secret', placeholder: 'Enter your webhook secret...', type: 'password' }];
        case 'basic_auth':
            return [
                { id: 'username', label: 'Username / API Key', placeholder: 'Enter username or API key...', type: 'text' },
                { id: 'password', label: 'Password / Secret', placeholder: 'Enter password or secret...', type: 'password' },
            ];
        case 'api_key':
        default:
            return [{ id: 'api_key', label: 'API Key', placeholder: 'Enter your API key...', type: 'password' }];
    }
}

function getAuthTypeLabel(authType: string): string {
    const labels: Record<string, string> = {
        api_key: 'API Key',
        bot_token: 'Bot Token',
        webhook_secret: 'Webhook Secret',
        basic_auth: 'Basic Auth (Username + Password)',
    };
    return labels[authType] ?? 'API Credential';
}

export function PluginAuthModal({ isOpen, onClose, provider, onSuccess }: PluginAuthModalProps) {
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [showFields, setShowFields] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    if (!provider) return null;

    const authTypes = provider.auth_types || ['api_key'];
    const primaryAuthType = getPrimaryAuthType(authTypes);
    const fields = getFieldConfigs(primaryAuthType);

    const handleFieldChange = (fieldId: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const toggleShow = (fieldId: string) => {
        setShowFields(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
    };

    const isFormValid = fields.every(f => (fieldValues[f.id] || '').trim().length > 0);

    const handleClose = () => {
        // Reset on close
        setFieldValues({});
        setShowFields({});
        setStatus('idle');
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Build the payload — the backend /api/v1/plugins/accounts/api-key endpoint
            // accepts { plugin_provider_id, api_key } and stores the credential regardless
            // of whether it's actually an api_key, bot_token, or webhook_secret.
            // For basic_auth we combine username + password into api_key as "user:pass".
            let apiKey: string;
            if (primaryAuthType === 'basic_auth') {
                const username = fieldValues['username'] || '';
                const password = fieldValues['password'] || '';
                apiKey = `${username}:${password}`;
            } else {
                // Single-field auth types: api_key, bot_token, webhook_secret
                apiKey = fieldValues[fields[0].id] || '';
            }

            await httpClient.post('/api/v1/plugins/accounts/api-key', {
                plugin_provider_id: provider.id,
                api_key: apiKey,
            });

            setStatus('success');
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error("Failed to save plugin auth", err);
            setStatus('error');
            setError(err.response?.data?.detail || err.message || 'Failed to connect account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const logoUrl = getProviderLogoUrl(provider.icon || '', provider.logo_url);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Header */}
                        <div className="p-8 pb-0 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border shadow-inner" style={{ backgroundColor: getProviderColor(provider.name), borderColor: 'rgba(255,255,255,0.1)' }}>
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl}
                                            alt={provider.name}
                                            className="w-9 h-9 object-contain"
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
                                    <h2 className="text-2xl font-black tracking-tight">Connect {provider.name}</h2>
                                    <p className="text-zinc-500 text-sm">
                                        {getAuthTypeLabel(primaryAuthType)} required
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Account Connected!</h3>
                                        <p className="text-zinc-500">Refreshing connections...</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {fields.map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor={field.id} className="text-sm font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                                    {field.label}
                                                </Label>
                                                <div className="flex items-center gap-1 text-[10px] bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full font-bold text-zinc-400">
                                                    <Lock size={10} /> SECURE
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    id={field.id}
                                                    type={field.type === 'password' && !showFields[field.id] ? 'password' : 'text'}
                                                    placeholder={field.placeholder}
                                                    value={fieldValues[field.id] || ''}
                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                    className="h-14 px-6 pr-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-base font-medium"
                                                    autoFocus={field.id === fields[0].id}
                                                />
                                                {field.type === 'password' && (
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => toggleShow(field.id)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                                    >
                                                        {showFields[field.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <p className="text-xs text-zinc-400 ml-1">
                                        Your credentials are encrypted and never shared with third parties.
                                    </p>

                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm"
                                        >
                                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                            <p>{error}</p>
                                        </motion.div>
                                    )}

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !isFormValid}
                                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                "Connect Account"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 text-center border-t border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                                Powered by Sequels Secure Auth
                                <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
