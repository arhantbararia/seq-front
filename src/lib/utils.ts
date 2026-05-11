import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AUTH_TOKEN_KEY = 'auth_token';

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export function renderTextWithLinks(text: string | null | undefined) {
    if (!text) return null;
    
    const linkRegex = /(\[[^\]]+\]\(https?:\/\/[^\)]+\)|https?:\/\/[^\s]+)/g;
    const parts = text.split(linkRegex);
    
    return parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('[')) {
            const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
            if (match) {
                return React.createElement('a', {
                    key: index,
                    href: match[2],
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-indigo-500 dark:text-indigo-400 hover:underline',
                    onClick: (e: any) => e.stopPropagation()
                }, match[1]);
            }
        } else if (part.startsWith('http')) {
            return React.createElement('a', {
                key: index,
                href: part,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'text-indigo-500 dark:text-indigo-400 hover:underline break-all',
                onClick: (e: any) => e.stopPropagation()
            }, part);
        }
        return part;
    });
}
