
export interface Plugin {
    id: string;
    name: string;
    type: 'trigger' | 'action';
    description: string;
    icon: string;
    color: string;
}

export const TRIGGERS: Plugin[] = [
    {
        id: 'webhook_trigger',
        name: 'Webhooks',
        type: 'trigger',
        description: 'Receive a web request',
        icon: 'webhook',
        color: 'bg-blue-500',
    },
    {
        id: 'timer_trigger',
        name: 'Date & Time',
        type: 'trigger',
        description: 'Every day at...',
        icon: 'clock',
        color: 'bg-zinc-800',
    },
    {
        id: 'rss_trigger',
        name: 'RSS Feed',
        type: 'trigger',
        description: 'New feed item',
        icon: 'rss',
        color: 'bg-orange-500',
    },
];

export const ACTIONS: Plugin[] = [
    {
        id: 'email_action',
        name: 'Email',
        type: 'action',
        description: 'Send me an email',
        icon: 'mail',
        color: 'bg-red-500',
    },
    {
        id: 'webhook_action',
        name: 'Make a web request',
        type: 'action',
        description: 'GET/POST to a URL',
        icon: 'globe',
        color: 'bg-blue-600',
    },
    {
        id: 'twitter_action',
        name: 'X (Twitter)',
        type: 'action',
        description: 'Post a tweet',
        icon: 'twitter',
        color: 'bg-black',
    },
];

export const ALL_PLUGINS = [...TRIGGERS, ...ACTIONS];
