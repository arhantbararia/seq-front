import axios from 'axios';

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const httpClient = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/api\/v1\/?$/, ''),
    headers: {
        'Content-Type': 'application/json'
    }
});

httpClient.interceptors.request.use(config => {
    if (inMemoryAccessToken) {
        config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
});

// Flag to prevent multiple concurrent refresh requests
let isRefreshing = false;
let refreshSubscribers: ((targetItem: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
            if (!refreshToken) {
                if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-logout'));
                return Promise.reject(error);
            }

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const res = await fetch(`${httpClient.defaults.baseURL || ''}/api/v1/auth/token/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });

                    if (!res.ok) {
                        throw new Error('Refresh failed');
                    }

                    const data = await res.json();
                    // Assuming response provides access_token and refresh_token
                    const newAccessToken = data.access_token;
                    const newRefreshToken = data.refresh_token || refreshToken;

                    setAccessToken(newAccessToken);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('refresh_token', newRefreshToken);
                    }

                    isRefreshing = false;
                    onRefreshed(newAccessToken);
                } catch (err) {
                    isRefreshing = false;
                    setAccessToken(null);
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('refresh_token');
                        window.dispatchEvent(new Event('auth-logout'));
                    }
                    return Promise.reject(error);
                }
            }

            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(httpClient(originalRequest));
                });
            });
        }
        return Promise.reject(error);
    }
);
