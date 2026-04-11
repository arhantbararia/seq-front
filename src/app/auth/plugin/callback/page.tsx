'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { httpClient } from '@/lib/httpClient';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PluginCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        // Wait for auth initialization to complete so the Bearer token is available
        if (isAuthLoading) return;

        if (!isAuthenticated) {
            setStatus('error');
            setErrorMessage('You are not logged in. Please log in first.');
            return;
        }

        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // Look for parameters in URL, then fallback to localStorage handoff state
        let providerId = searchParams.get('provider_id');
        let isNewTab = searchParams.get('is_new_tab') === 'true';
        const dest = searchParams.get('dest') || '/dashboard';

        if (typeof window !== 'undefined') {
            if (!providerId) providerId = localStorage.getItem('oauth_provider_id') || null;
            if (!searchParams.get('is_new_tab') && localStorage.getItem('oauth_is_new_tab') === 'true') {
                isNewTab = true;
            }
        }

        if (!code || !providerId) {
            setStatus('error');
            setErrorMessage('Missing required OAuth parameters (code or provider_id).');
            return;
        }

        const finalizeAuth = async () => {
            try {
                // Clear handoff storage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('oauth_provider_id');
                    localStorage.removeItem('oauth_is_new_tab');
                }

                // Call the backend callback endpoint WITH authorization header
                await httpClient.get(`/api/v1/plugins/accounts/${providerId}/oauth/callback`, {
                    params: { code, state }
                });
                
                setStatus('success');
                
                // Notify the opener tab if this is a new window
                if (isNewTab && window.opener) {
                    window.opener.postMessage({ type: 'account-connected', providerId }, window.location.origin);
                }

                // Redirect or close after a short delay
                setTimeout(() => {
                    if (isNewTab) {
                        window.close();
                    } else {
                        router.push(dest);
                    }
                }, 2000);
            } catch (err: any) {
                console.error("Plugin auth callback failed", err);
                setStatus('error');
                setErrorMessage(err.response?.data?.detail || err.message || 'Failed to connect account.');
            }
        };

        finalizeAuth();
    }, [searchParams, router, isAuthLoading, isAuthenticated]);

    if (status === 'loading' || isAuthLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold mb-2">Connecting Account</h1>
                    <p className="text-zinc-500">Please wait while we finalize the connection with your provider...</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        const isNewTab = searchParams.get('is_new_tab') === 'true';
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={48} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold mb-2">Successfully Connected!</h1>
                    <p className="text-zinc-500">
                        {isNewTab ? "This window will close automatically." : "Redirecting you back to your workflow..."}
                    </p>
                    {isNewTab && (
                        <Button variant="outline" className="mt-6 rounded-full" onClick={() => window.close()}>
                            Close Window Now
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
                <XCircle size={48} />
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
                <p className="text-red-500 font-medium mb-8 max-w-md mx-auto">{errorMessage}</p>
                <Button onClick={() => router.push(searchParams.get('dest') || '/dashboard')} size="lg" className="rounded-full px-8">
                    Go Back
                </Button>
            </div>
        </div>
    );
}

export default function PluginCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-zinc-400" />}>
                <PluginCallbackContent />
            </Suspense>
        </div>
    );
}
