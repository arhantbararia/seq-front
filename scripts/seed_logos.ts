import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || '';

const providers = [
    { name: 'Spotify', domain: 'spotify.com', icon: 'music' },
    { name: 'Threads', domain: 'threads.net', icon: 'message-circle' },
    { name: 'Google Sheets', domain: 'sheets.google.com', icon: 'file-text' },
    { name: 'WhatsApp', domain: 'whatsapp.com', icon: 'message-square' },
    { name: 'Telegram', domain: 'telegram.org', icon: 'send' },
    { name: 'Gmail', domain: 'gmail.com', icon: 'mail' },
    { name: 'YouTube', domain: 'youtube.com', icon: 'youtube' },
    { name: 'ClickSend', domain: 'clicksend.com', icon: 'smartphone' },
    { name: 'LinkedIn', domain: 'linkedin.com', icon: 'linkedin' },
    { name: 'Google Calendar', domain: 'calendar.google.com', icon: 'calendar' },
    { name: 'GitHub', domain: 'github.com', icon: 'github' },
    { name: 'X.com', domain: 'x.com', icon: 'twitter' },
    { name: 'Blogger', domain: 'blogger.com', icon: 'rss' },
    { name: 'Reddit', domain: 'reddit.com', icon: 'globe' },
    { name: 'SoundCloud', domain: 'soundcloud.com', icon: 'music' },
    { name: 'Fitbit', domain: 'fitbit.com', icon: 'activity' },
    { name: 'Webhooks', icon: 'webhook', generic: true },
    { name: 'Email', icon: 'mail', generic: true },
    { name: 'Notifications', icon: 'bell', generic: true },
    { name: 'Date & Time', icon: 'clock', generic: true },
    { name: 'Android Device', icon: 'smartphone', generic: true },
    { name: 'Android SMS', icon: 'message-square', generic: true },
];

async function seedProviders() {
    console.log(`Starting provider seed to ${BACKEND_URL}...`);
    
    for (const p of providers) {
        let logoUrl = null;
        if (!p.generic && p.domain) {
            logoUrl = `https://img.logo.dev/${p.domain}?token=${LOGO_DEV_TOKEN}`;
        }

        const payload = {
            name: p.name,
            icon: p.icon,
            logo_url: logoUrl,
            supports_trigger: true, // Simplified for seeding
            supports_action: true,
            auth_types: ['oauth2'] // Simplified
        };

        try {
            console.log(`Seeding ${p.name}...`);
            await axios.post(`${BACKEND_URL}/api/v1/plugins/providers`, payload);
            console.log(`Successfully seeded ${p.name}`);
        } catch (err: any) {
            console.error(`Failed to seed ${p.name}: ${err.response?.data?.detail || err.message}`);
        }
    }
    
    console.log("Seeding complete.");
}

seedProviders();
