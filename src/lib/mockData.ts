
export interface Plugin {
    id: string;
    name: string;
    type: 'trigger' | 'action';
    description: string;
    icon: string;
    color: string;
    image?: string;
    configFields?: ConfigField[];
}

export interface ConfigField {
    name: string;
    label: string;
    type: 'text' | 'select';
    required?: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
}

const COLORS: Record<string, string> = {
    'Threads': 'bg-black',
    'Webhooks': 'bg-blue-500',
    'Google Sheets': 'bg-green-600',
    'Android Device': 'bg-green-500',
    'WhatsApp': 'bg-green-500',
    'Telegram': 'bg-blue-400',
    'Email': 'bg-orange-400',
    'Gmail': 'bg-red-500',
    'YouTube': 'bg-red-600',
    'ClickSend': 'bg-blue-600',
    'Notifications': 'bg-gray-800',
    'LinkedIn': 'bg-blue-700',
    'Google Calendar': 'bg-blue-500',
    'Android SMS': 'bg-green-600',
    'GitHub': 'bg-gray-900',
    'X.com': 'bg-black',
    'Blogger': 'bg-orange-500',
    'Facebook': 'bg-blue-600',
    'Spotify': 'bg-green-500',
    'Reddit': 'bg-orange-600',
    'RSS Feed': 'bg-orange-400',
    'SoundCloud': 'bg-orange-500',
    'Fitbit': 'bg-teal-500',
    'Google Drive': 'bg-yellow-500',
    'Instagram': 'bg-pink-600',
    'Date & Time': 'bg-gray-700'
};

const ICONS: Record<string, string> = {
    'Threads': 'twitter', // Fallback
    'Webhooks': 'webhook',
    'Google Sheets': 'file-text', // Fallback
    'Android Device': 'smartphone', // Fallback
    'WhatsApp': 'message-circle', // Fallback
    'Telegram': 'send', // Fallback
    'Email': 'mail',
    'Gmail': 'mail',
    'YouTube': 'youtube', // Fallback needs mapping or custom component, using generic for now
    'ClickSend': 'message-square', // Fallback
    'Notifications': 'bell', // Fallback
    'LinkedIn': 'linkedin', // Fallback
    'Google Calendar': 'calendar',
    'Android SMS': 'message-square',
    'GitHub': 'github',
    'X.com': 'twitter',
    'Blogger': 'file-text',
    'Facebook': 'facebook', // Fallback
    'Spotify': 'music', // Fallback
    'Reddit': 'message-circle', // Fallback
    'RSS Feed': 'rss',
    'SoundCloud': 'music',
    'Fitbit': 'activity', // Fallback
    'Google Drive': 'hard-drive', // Fallback
    'Instagram': 'camera', // Fallback
    'Date & Time': 'clock'
};

export const TRIGGERS: Plugin[] = [
    // Blogger
    { id: 'blogger-any-new-post', name: 'Blogger', type: 'trigger', description: 'Any new post', icon: 'file-text', color: COLORS['Blogger'], configFields: [{ name: 'blog_url_or_id', label: 'Blog URL or ID', type: 'text', required: true }] },
    { id: 'blogger-new-post-labeled', name: 'Blogger', type: 'trigger', description: 'New post labeled', icon: 'file-text', color: COLORS['Blogger'], configFields: [{ name: 'blog_url_or_id', label: 'Blog URL or ID', type: 'text', required: true }, { name: 'label', label: 'Label', type: 'text', required: true }] },
    // Facebook
    { id: 'facebook-new-post-area', name: 'Facebook', type: 'trigger', description: 'Any new post by you in area', icon: 'facebook', color: COLORS['Facebook'], configFields: [{ name: 'location', label: 'Location', type: 'text', required: true }] },
    { id: 'facebook-new-status', name: 'Facebook', type: 'trigger', description: 'New status message by you', icon: 'facebook', color: COLORS['Facebook'], configFields: [] },
    { id: 'facebook-new-status-hashtag', name: 'Facebook', type: 'trigger', description: 'New status message by you with hashtag', icon: 'facebook', color: COLORS['Facebook'], configFields: [{ name: 'hashtag', label: 'Hashtag', type: 'text', required: true }] },
    { id: 'facebook-new-link', name: 'Facebook', type: 'trigger', description: 'New link post by you', icon: 'facebook', color: COLORS['Facebook'], configFields: [] },
    { id: 'facebook-new-link-hashtag', name: 'Facebook', type: 'trigger', description: 'New link post by you with hashtag', icon: 'facebook', color: COLORS['Facebook'], configFields: [{ name: 'hashtag', label: 'Hashtag', type: 'text', required: true }] },
    { id: 'facebook-new-photo', name: 'Facebook', type: 'trigger', description: 'New photo post by you', icon: 'facebook', color: COLORS['Facebook'], configFields: [] },
    { id: 'facebook-new-photo-hashtag', name: 'Facebook', type: 'trigger', description: 'New photo post by you with hashtag', icon: 'facebook', color: COLORS['Facebook'], configFields: [{ name: 'hashtag', label: 'Hashtag', type: 'text', required: true }] },
    { id: 'facebook-new-photo-area', name: 'Facebook', type: 'trigger', description: 'New photo post by you in area', icon: 'facebook', color: COLORS['Facebook'], configFields: [{ name: 'location', label: 'Location', type: 'text', required: true }] },
    { id: 'facebook-tagged', name: 'Facebook', type: 'trigger', description: 'You are tagged in a photo', icon: 'facebook', color: COLORS['Facebook'], configFields: [] },
    { id: 'facebook-profile-changes', name: 'Facebook', type: 'trigger', description: 'Your profile changes', icon: 'facebook', color: COLORS['Facebook'], configFields: [] },
    // Spotify
    { id: 'spotify-new-followed-show', name: 'Spotify', type: 'trigger', description: 'New followed show', icon: 'music', color: COLORS['Spotify'], configFields: [] },
    { id: 'spotify-new-saved-episode', name: 'Spotify', type: 'trigger', description: 'New saved episode', icon: 'music', color: COLORS['Spotify'], configFields: [] },
    { id: 'spotify-new-saved-track', name: 'Spotify', type: 'trigger', description: 'New saved track', icon: 'music', color: COLORS['Spotify'], configFields: [] },
    { id: 'spotify-new-show-search', name: 'Spotify', type: 'trigger', description: 'New show from search', icon: 'music', color: COLORS['Spotify'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'spotify-recently-played', name: 'Spotify', type: 'trigger', description: 'New recently played track', icon: 'music', color: COLORS['Spotify'], configFields: [] },
    { id: 'spotify-new-saved-album', name: 'Spotify', type: 'trigger', description: 'New saved album', icon: 'music', color: COLORS['Spotify'], configFields: [] },
    { id: 'spotify-new-episode-followed', name: 'Spotify', type: 'trigger', description: 'New episode from followed show', icon: 'music', color: COLORS['Spotify'], configFields: [] },
    { id: 'spotify-new-episode-search', name: 'Spotify', type: 'trigger', description: 'New episode from search', icon: 'music', color: COLORS['Spotify'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'spotify-new-track-playlist', name: 'Spotify', type: 'trigger', description: 'New track added to a playlist', icon: 'music', color: COLORS['Spotify'], configFields: [{ name: 'playlist_id', label: 'Playlist name or ID', type: 'text', required: true }] },
    // WhatsApp
    { id: 'whatsapp-msg-specific', name: 'WhatsApp', type: 'trigger', description: 'Specific message to InOut', icon: 'message-circle', color: COLORS['WhatsApp'], configFields: [{ name: 'message', label: 'Specific message or key phrase', type: 'text', required: true }] },
    { id: 'whatsapp-msg-any', name: 'WhatsApp', type: 'trigger', description: 'Any message to InOut', icon: 'message-circle', color: COLORS['WhatsApp'], configFields: [] },
    // YouTube
    { id: 'youtube-new-video-search', name: 'YouTube', type: 'trigger', description: 'New video from search', icon: 'youtube', color: COLORS['YouTube'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'youtube-new-liked-video', name: 'YouTube', type: 'trigger', description: 'New liked video', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-subscribe-channel', name: 'YouTube', type: 'trigger', description: 'You subscribe to a channel', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-new-video-channel', name: 'YouTube', type: 'trigger', description: 'New video by channel', icon: 'youtube', color: COLORS['YouTube'], configFields: [{ name: 'channel_id', label: 'Channel name or ID', type: 'text', required: true }] },
    { id: 'youtube-new-playlist', name: 'YouTube', type: 'trigger', description: 'New playlist', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-new-public-video', name: 'YouTube', type: 'trigger', description: 'New public video uploaded by you', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-new-video-sub', name: 'YouTube', type: 'trigger', description: 'New public video from subscriptions', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-super-chat', name: 'YouTube', type: 'trigger', description: 'New Super Chat message', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-membership', name: 'YouTube', type: 'trigger', description: 'New channel membership', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    { id: 'youtube-super-sticker', name: 'YouTube', type: 'trigger', description: 'New Super Sticker', icon: 'youtube', color: COLORS['YouTube'], configFields: [] },
    // Telegram
    { id: 'telegram-msg-phrase', name: 'Telegram', type: 'trigger', description: 'New message with key phrase to @IFTTT', icon: 'send', color: COLORS['Telegram'], configFields: [{ name: 'phrase', label: 'Key phrase', type: 'text', required: true }] },
    { id: 'telegram-photo', name: 'Telegram', type: 'trigger', description: 'New photo to @IFTTT', icon: 'send', color: COLORS['Telegram'], configFields: [] },
    { id: 'telegram-msg-phrase-group', name: 'Telegram', type: 'trigger', description: 'New message with key phrase in a group', icon: 'send', color: COLORS['Telegram'], configFields: [{ name: 'phrase', label: 'Key phrase', type: 'text', required: true }] },
    { id: 'telegram-msg-group', name: 'Telegram', type: 'trigger', description: 'New message in a group', icon: 'send', color: COLORS['Telegram'], configFields: [] },
    { id: 'telegram-post-channel', name: 'Telegram', type: 'trigger', description: 'New post in your channel', icon: 'send', color: COLORS['Telegram'], configFields: [] },
    { id: 'telegram-photo-channel', name: 'Telegram', type: 'trigger', description: 'New photo in your channel', icon: 'send', color: COLORS['Telegram'], configFields: [] },
    // Reddit
    { id: 'reddit-new-post-sub', name: 'Reddit', type: 'trigger', description: 'Any new post in subreddit', icon: 'message-circle', color: COLORS['Reddit'], configFields: [{ name: 'subreddit', label: 'Subreddit name', type: 'text', required: true }] },
    { id: 'reddit-hot-post-sub', name: 'Reddit', type: 'trigger', description: 'New hot post in subreddit', icon: 'message-circle', color: COLORS['Reddit'], configFields: [{ name: 'subreddit', label: 'Subreddit name', type: 'text', required: true }] },
    { id: 'reddit-top-post-sub', name: 'Reddit', type: 'trigger', description: 'New top post in subreddit', icon: 'message-circle', color: COLORS['Reddit'], configFields: [{ name: 'subreddit', label: 'Subreddit name', type: 'text', required: true }] },
    { id: 'reddit-new-post-search', name: 'Reddit', type: 'trigger', description: 'New post from search', icon: 'message-circle', color: COLORS['Reddit'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'reddit-new-post-you', name: 'Reddit', type: 'trigger', description: 'New post by you', icon: 'message-circle', color: COLORS['Reddit'], configFields: [] },
    { id: 'reddit-new-comment-you', name: 'Reddit', type: 'trigger', description: 'New comment by you', icon: 'message-circle', color: COLORS['Reddit'], configFields: [] },
    { id: 'reddit-upvoted-you', name: 'Reddit', type: 'trigger', description: 'New upvoted post by you', icon: 'message-circle', color: COLORS['Reddit'], configFields: [] },
    { id: 'reddit-downvoted-you', name: 'Reddit', type: 'trigger', description: 'New downvoted post by you', icon: 'message-circle', color: COLORS['Reddit'], configFields: [] },
    { id: 'reddit-saved-you', name: 'Reddit', type: 'trigger', description: 'New post saved by you', icon: 'message-circle', color: COLORS['Reddit'], configFields: [] },
    // X.com
    { id: 'x-new-tweet', name: 'X.com', type: 'trigger', description: 'New tweet by you', icon: 'twitter', color: COLORS['X.com'], configFields: [] },
    { id: 'x-new-tweet-hashtag', name: 'X.com', type: 'trigger', description: 'New tweet by you with hashtag', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'hashtag', label: 'Hashtag', type: 'text', required: true }] },
    { id: 'x-new-tweet-area', name: 'X.com', type: 'trigger', description: 'New tweet by you in area', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'area', label: 'Area/location', type: 'text', required: true }] },
    { id: 'x-mention', name: 'X.com', type: 'trigger', description: 'New mention of you', icon: 'twitter', color: COLORS['X.com'], configFields: [] },
    { id: 'x-new-link', name: 'X.com', type: 'trigger', description: 'New link by you', icon: 'twitter', color: COLORS['X.com'], configFields: [] },
    { id: 'x-new-follower', name: 'X.com', type: 'trigger', description: 'New follower', icon: 'twitter', color: COLORS['X.com'], configFields: [] },
    { id: 'x-liked-tweet', name: 'X.com', type: 'trigger', description: 'New liked tweet by you', icon: 'twitter', color: COLORS['X.com'], configFields: [] },
    { id: 'x-tweet-user', name: 'X.com', type: 'trigger', description: 'New tweet by a specific user', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'username', label: 'Username', type: 'text', required: true }] },
    { id: 'x-tweet-search', name: 'X.com', type: 'trigger', description: 'New tweet from search', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'x-tweet-area-any', name: 'X.com', type: 'trigger', description: 'New tweet by anyone in area', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'area', label: 'Area/location', type: 'text', required: true }] },
    // GitHub
    { id: 'github-notification-repo', name: 'GitHub', type: 'trigger', description: 'Any new notification from a repository', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }] },
    { id: 'github-repo-event', name: 'GitHub', type: 'trigger', description: 'Any new repository event', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }] },
    { id: 'github-release', name: 'GitHub', type: 'trigger', description: 'Any new release', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }] },
    { id: 'github-commit', name: 'GitHub', type: 'trigger', description: 'Any new commit', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }] },
    { id: 'github-notification-any', name: 'GitHub', type: 'trigger', description: 'Any new notification', icon: 'github', color: COLORS['GitHub'], configFields: [] },
    { id: 'github-gist', name: 'GitHub', type: 'trigger', description: 'Any new Gist', icon: 'github', color: COLORS['GitHub'], configFields: [] },
    { id: 'github-issue', name: 'GitHub', type: 'trigger', description: 'Any new issue', icon: 'github', color: COLORS['GitHub'], configFields: [] },
    { id: 'github-closed-issue', name: 'GitHub', type: 'trigger', description: 'Any new closed issue', icon: 'github', color: COLORS['GitHub'], configFields: [] },
    { id: 'github-issue-assigned', name: 'GitHub', type: 'trigger', description: 'New issue assigned to you', icon: 'github', color: COLORS['GitHub'], configFields: [] },
    { id: 'github-repo-user', name: 'GitHub', type: 'trigger', description: 'New repository by user/org', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'username', label: 'Username or organization', type: 'text', required: true }] },
    { id: 'github-pr', name: 'GitHub', type: 'trigger', description: 'New pull request', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }] },
    // Date & Time (using timer_trigger ID for consistency if desired, but updating to match requested list)
    { id: 'datetime-every-day', name: 'Date & Time', type: 'trigger', description: 'Every day at', icon: 'clock', color: COLORS['Date & Time'], configFields: [{ name: 'time', label: 'Specific time', type: 'text', required: true }] },
    { id: 'datetime-every-hour', name: 'Date & Time', type: 'trigger', description: 'Every hour at', icon: 'clock', color: COLORS['Date & Time'], configFields: [{ name: 'time', label: 'Specific time', type: 'text', required: true }] },
    { id: 'datetime-every-week', name: 'Date & Time', type: 'trigger', description: 'Every day of the week at', icon: 'clock', color: COLORS['Date & Time'], configFields: [{ name: 'day', label: 'Day of week', type: 'text', required: true }, { name: 'time', label: 'Time', type: 'text', required: true }] },
    { id: 'datetime-every-month', name: 'Date & Time', type: 'trigger', description: 'Every month on the', icon: 'clock', color: COLORS['Date & Time'], configFields: [{ name: 'day', label: 'Day of month', type: 'text', required: true }, { name: 'time', label: 'Time', type: 'text', required: true }] },
    { id: 'datetime-every-year', name: 'Date & Time', type: 'trigger', description: 'Every year on', icon: 'clock', color: COLORS['Date & Time'], configFields: [{ name: 'date', label: 'Date', type: 'text', required: true }, { name: 'time', label: 'Time', type: 'text', required: true }] },
    // SoundCloud
    { id: 'soundcloud-new-track', name: 'SoundCloud', type: 'trigger', description: 'Any new public track', icon: 'music', color: COLORS['SoundCloud'], configFields: [] },
    { id: 'soundcloud-new-like', name: 'SoundCloud', type: 'trigger', description: 'New public like', icon: 'music', color: COLORS['SoundCloud'], configFields: [] },
    { id: 'soundcloud-new-track-following', name: 'SoundCloud', type: 'trigger', description: 'New public track by anyone you follow', icon: 'music', color: COLORS['SoundCloud'], configFields: [] },
    { id: 'soundcloud-new-track-search', name: 'SoundCloud', type: 'trigger', description: 'New track from search', icon: 'music', color: COLORS['SoundCloud'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'soundcloud-new-follower', name: 'SoundCloud', type: 'trigger', description: 'Any new follower', icon: 'music', color: COLORS['SoundCloud'], configFields: [] },
    { id: 'soundcloud-new-playlist', name: 'SoundCloud', type: 'trigger', description: 'New playlist created', icon: 'music', color: COLORS['SoundCloud'], configFields: [] },
    { id: 'soundcloud-new-track-playlist', name: 'SoundCloud', type: 'trigger', description: 'New track in a playlist', icon: 'music', color: COLORS['SoundCloud'], configFields: [{ name: 'playlist', label: 'Playlist', type: 'text', required: true }] },
    // Email
    { id: 'email-send-ifttt', name: 'Email', type: 'trigger', description: 'Send IFTTT any email', icon: 'mail', color: COLORS['Email'], configFields: [] },
    { id: 'email-send-ifttt-tagged', name: 'Email', type: 'trigger', description: 'Send IFTTT an email tagged', icon: 'mail', color: COLORS['Email'], configFields: [{ name: 'tag', label: 'Hashtag in subject', type: 'text', required: true }] },
    // Fitbit
    { id: 'fitbit-daily-summary', name: 'Fitbit', type: 'trigger', description: 'Daily activity summary', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-daily-steps', name: 'Fitbit', type: 'trigger', description: 'Daily step goal achieved', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-daily-distance', name: 'Fitbit', type: 'trigger', description: 'Daily distance goal achieved', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-daily-floors', name: 'Fitbit', type: 'trigger', description: 'Daily floors climbed goal achieved', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-daily-calories', name: 'Fitbit', type: 'trigger', description: 'Daily calorie burn goal achieved', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-daily-active-minutes', name: 'Fitbit', type: 'trigger', description: 'Daily very active minutes goal achieved', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-daily-goal-missed', name: 'Fitbit', type: 'trigger', description: 'Daily goal not achieved by', icon: 'activity', color: COLORS['Fitbit'], configFields: [{ name: 'time', label: 'Time', type: 'text', required: true }] },
    { id: 'fitbit-new-weight', name: 'Fitbit', type: 'trigger', description: 'New weight logged', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-new-sleep', name: 'Fitbit', type: 'trigger', description: 'New sleep logged', icon: 'activity', color: COLORS['Fitbit'], configFields: [] },
    { id: 'fitbit-sleep-above', name: 'Fitbit', type: 'trigger', description: 'Sleep duration above', icon: 'activity', color: COLORS['Fitbit'], configFields: [{ name: 'hours', label: 'Target hours', type: 'text', required: true }] },
    { id: 'fitbit-sleep-below', name: 'Fitbit', type: 'trigger', description: 'Sleep duration below', icon: 'activity', color: COLORS['Fitbit'], configFields: [{ name: 'hours', label: 'Target hours', type: 'text', required: true }] },
    // Google Drive
    { id: 'drive-new-file', name: 'Google Drive', type: 'trigger', description: 'New file in your folder', icon: 'hard-drive', color: COLORS['Google Drive'], configFields: [{ name: 'folder', label: 'Folder path', type: 'text', required: true }] },
    { id: 'drive-new-file-search', name: 'Google Drive', type: 'trigger', description: 'New file from search in your folder', icon: 'hard-drive', color: COLORS['Google Drive'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }, { name: 'folder', label: 'Folder path', type: 'text', required: true }] },
    { id: 'drive-new-photo', name: 'Google Drive', type: 'trigger', description: 'New photo in your folder', icon: 'hard-drive', color: COLORS['Google Drive'], configFields: [{ name: 'folder', label: 'Folder path', type: 'text', required: true }] },
    { id: 'drive-new-video', name: 'Google Drive', type: 'trigger', description: 'New video in your folder', icon: 'hard-drive', color: COLORS['Google Drive'], configFields: [{ name: 'folder', label: 'Folder path', type: 'text', required: true }] },
    { id: 'drive-new-starred', name: 'Google Drive', type: 'trigger', description: 'New starred file in folder', icon: 'hard-drive', color: COLORS['Google Drive'], configFields: [{ name: 'folder', label: 'Folder path', type: 'text', required: true }] },
    // Google Sheets
    { id: 'sheets-new-sheet', name: 'Google Sheets', type: 'trigger', description: 'New spreadsheet added to folder', icon: 'file-text', color: COLORS['Google Sheets'], configFields: [{ name: 'folder', label: 'Folder path', type: 'text', required: true }] },
    { id: 'sheets-new-worksheet', name: 'Google Sheets', type: 'trigger', description: 'New worksheet in spreadsheet', icon: 'file-text', color: COLORS['Google Sheets'], configFields: [{ name: 'spreadsheet', label: 'Spreadsheet ID', type: 'text', required: true }] },
    { id: 'sheets-new-row', name: 'Google Sheets', type: 'trigger', description: 'New row added to spreadsheet', icon: 'file-text', color: COLORS['Google Sheets'], configFields: [{ name: 'spreadsheet', label: 'Spreadsheet ID', type: 'text', required: true }] },
    { id: 'sheets-cell-updated', name: 'Google Sheets', type: 'trigger', description: 'Cell updated in spreadsheet', icon: 'file-text', color: COLORS['Google Sheets'], configFields: [{ name: 'spreadsheet', label: 'Spreadsheet ID', type: 'text', required: true }] },
    // Threads
    { id: 'threads-new-post', name: 'Threads', type: 'trigger', description: 'Any new post by you', icon: 'twitter', color: COLORS['Threads'], configFields: [] },
    { id: 'threads-new-text', name: 'Threads', type: 'trigger', description: 'New text post by you', icon: 'twitter', color: COLORS['Threads'], configFields: [] },
    { id: 'threads-new-image', name: 'Threads', type: 'trigger', description: 'New image post by you', icon: 'twitter', color: COLORS['Threads'], configFields: [] },
    { id: 'threads-new-video', name: 'Threads', type: 'trigger', description: 'New video post by you', icon: 'twitter', color: COLORS['Threads'], configFields: [] },
    { id: 'threads-new-carousel', name: 'Threads', type: 'trigger', description: 'New carousel post by you', icon: 'twitter', color: COLORS['Threads'], configFields: [] },
    // RSS Feed
    { id: 'rss-new-item', name: 'RSS Feed', type: 'trigger', description: 'New feed item', icon: 'rss', color: COLORS['RSS Feed'], configFields: [{ name: 'url', label: 'Feed URL', type: 'text', required: true }] },
    { id: 'rss-new-item-matches', name: 'RSS Feed', type: 'trigger', description: 'New feed item matches', icon: 'rss', color: COLORS['RSS Feed'], configFields: [{ name: 'url', label: 'Feed URL', type: 'text', required: true }, { name: 'keyword', label: 'Keyword or phrase', type: 'text', required: true }] },
    // Google Calendar
    { id: 'calendar-new-event', name: 'Google Calendar', type: 'trigger', description: 'New event added', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [] },
    { id: 'calendar-new-event-search', name: 'Google Calendar', type: 'trigger', description: 'New event from search added', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'calendar-event-starts', name: 'Google Calendar', type: 'trigger', description: 'Any event starts', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [] },
    { id: 'calendar-event-search-starts', name: 'Google Calendar', type: 'trigger', description: 'Event from search starts', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'calendar-event-ends', name: 'Google Calendar', type: 'trigger', description: 'Any event ends', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [] },
    { id: 'calendar-event-search-ends', name: 'Google Calendar', type: 'trigger', description: 'Event from search ends', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [{ name: 'query', label: 'Search query', type: 'text', required: true }] },
    { id: 'calendar-respond-event', name: 'Google Calendar', type: 'trigger', description: 'You respond to an event invite', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [] },
    // Webhooks
    { id: 'webhook-json', name: 'Webhooks', type: 'trigger', description: 'Receive a web request with a JSON payload', icon: 'webhook', color: COLORS['Webhooks'], configFields: [] },
    { id: 'webhook-request', name: 'Webhooks', type: 'trigger', description: 'Receive a web request', icon: 'webhook', color: COLORS['Webhooks'], configFields: [] },
    // Instagram
    { id: 'instagram-new-photo', name: 'Instagram', type: 'trigger', description: 'Any new photo by you', icon: 'camera', color: COLORS['Instagram'], configFields: [] },
    { id: 'instagram-new-photo-tag', name: 'Instagram', type: 'trigger', description: 'New photo by you with specific hashtag', icon: 'camera', color: COLORS['Instagram'], configFields: [{ name: 'hashtag', label: 'Hashtag', type: 'text', required: true }] },
    { id: 'instagram-new-video', name: 'Instagram', type: 'trigger', description: 'Any new video by you', icon: 'camera', color: COLORS['Instagram'], configFields: [] },
    { id: 'instagram-new-video-tag', name: 'Instagram', type: 'trigger', description: 'New video by you with specific hashtag', icon: 'camera', color: COLORS['Instagram'], configFields: [{ name: 'hashtag', label: 'Hashtag', type: 'text', required: true }] },
];

export const ACTIONS: Plugin[] = [
    // Threads
    { id: 'threads-text', name: 'Threads', type: 'action', description: 'Create a text post', icon: 'twitter', color: COLORS['Threads'], configFields: [{ name: 'text', label: 'Text content', type: 'text', required: true }] },
    { id: 'threads-link', name: 'Threads', type: 'action', description: 'Create a link post', icon: 'twitter', color: COLORS['Threads'], configFields: [{ name: 'url', label: 'Link URL', type: 'text', required: true }] },
    { id: 'threads-image', name: 'Threads', type: 'action', description: 'Create an image post', icon: 'twitter', color: COLORS['Threads'], configFields: [{ name: 'image', label: 'Image (URL or file)', type: 'text', required: true }] },
    { id: 'threads-video', name: 'Threads', type: 'action', description: 'Create a video post', icon: 'twitter', color: COLORS['Threads'], configFields: [{ name: 'video', label: 'Video (URL or file)', type: 'text', required: true }] },
    { id: 'threads-carousel', name: 'Threads', type: 'action', description: 'Create a carousel (multiple media) post', icon: 'twitter', color: COLORS['Threads'], configFields: [{ name: 'media', label: 'Multiple media (URLs or files)', type: 'text', required: true }] },
    // Webhooks
    { id: 'webhook-request-action', name: 'Webhooks', type: 'action', description: 'Make a web request', icon: 'webhook', color: COLORS['Webhooks'], configFields: [{ name: 'url', label: 'URL', type: 'text', required: true }, { name: 'method', label: 'Method', type: 'select', required: true, options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }] }, { name: 'payload', label: 'Payload (optional)', type: 'text' }] },
    // Google Sheets
    { id: 'sheets-update-cell', name: 'Google Sheets', type: 'action', description: 'Update cell in spreadsheet', icon: 'file-text', color: COLORS['Google Sheets'], configFields: [{ name: 'spreadsheet', label: 'Spreadsheet ID', type: 'text', required: true }, { name: 'worksheet', label: 'Worksheet', type: 'text', required: true }, { name: 'cell', label: 'Cell coordinates', type: 'text', required: true }, { name: 'value', label: 'Value', type: 'text', required: true }] },
    { id: 'sheets-add-row', name: 'Google Sheets', type: 'action', description: 'Add row to spreadsheet', icon: 'file-text', color: COLORS['Google Sheets'], configFields: [{ name: 'spreadsheet', label: 'Spreadsheet ID', type: 'text', required: true }, { name: 'worksheet', label: 'Worksheet', type: 'text', required: true }, { name: 'values', label: 'Row values', type: 'text', required: true }] },
    // Android Device
    { id: 'android-wallpaper', name: 'Android Device', type: 'action', description: 'Update device wallpaper', icon: 'smartphone', color: COLORS['Android Device'], configFields: [{ name: 'image_url', label: 'Image URL', type: 'text', required: true }] },
    { id: 'android-play-song', name: 'Android Device', type: 'action', description: 'Play a specific song', icon: 'smartphone', color: COLORS['Android Device'], configFields: [{ name: 'song', label: 'Song name or identifier', type: 'text', required: true }] },
    { id: 'android-play-music', name: 'Android Device', type: 'action', description: 'Play music', icon: 'smartphone', color: COLORS['Android Device'], configFields: [{ name: 'selection', label: 'Music selection', type: 'text', required: true }] },
    { id: 'android-nav', name: 'Android Device', type: 'action', description: 'Launch Google Maps Navigation', icon: 'smartphone', color: COLORS['Android Device'], configFields: [{ name: 'address', label: 'Destination address', type: 'text', required: true }] },
    { id: 'android-mute', name: 'Android Device', type: 'action', description: 'Mute ringtone', icon: 'smartphone', color: COLORS['Android Device'], configFields: [] },
    { id: 'android-volume', name: 'Android Device', type: 'action', description: 'Set ringtone volume', icon: 'smartphone', color: COLORS['Android Device'], configFields: [{ name: 'volume', label: 'Volume level', type: 'text', required: true }] },
    { id: 'android-dnd-on', name: 'Android Device', type: 'action', description: 'Turn on Do Not Disturb mode', icon: 'smartphone', color: COLORS['Android Device'], configFields: [] },
    { id: 'android-dnd-off', name: 'Android Device', type: 'action', description: 'Turn off Do Not Disturb mode', icon: 'smartphone', color: COLORS['Android Device'], configFields: [] },
    // WhatsApp
    { id: 'whatsapp-send', name: 'WhatsApp', type: 'action', description: 'Send a message', icon: 'message-circle', color: COLORS['WhatsApp'], configFields: [{ name: 'message', label: 'Text message', type: 'text', required: true }] },
    // Telegram
    { id: 'telegram-send', name: 'Telegram', type: 'action', description: 'Send message', icon: 'send', color: COLORS['Telegram'], configFields: [{ name: 'message', label: 'Text message', type: 'text', required: true }] },
    { id: 'telegram-photo', name: 'Telegram', type: 'action', description: 'Send photo', icon: 'send', color: COLORS['Telegram'], configFields: [{ name: 'photo', label: 'Photo (file or URL)', type: 'text', required: true }] },
    { id: 'telegram-video', name: 'Telegram', type: 'action', description: 'Send video', icon: 'send', color: COLORS['Telegram'], configFields: [{ name: 'video', label: 'Video (file or URL)', type: 'text', required: true }] },
    { id: 'telegram-mp3', name: 'Telegram', type: 'action', description: 'Send mp3', icon: 'send', color: COLORS['Telegram'], configFields: [{ name: 'mp3', label: 'MP3 file or URL', type: 'text', required: true }] },
    // Email
    { id: 'email-send-me', name: 'Email', type: 'action', description: 'Send me an email', icon: 'mail', color: COLORS['Email'], configFields: [{ name: 'content', label: 'HTML content', type: 'text', required: true }] },
    // Gmail
    { id: 'gmail-send', name: 'Gmail', type: 'action', description: 'Send an email', icon: 'mail', color: COLORS['Gmail'], configFields: [{ name: 'recipients', label: 'Recipients', type: 'text', required: true }, { name: 'content', label: 'Content', type: 'text', required: true }] },
    { id: 'gmail-send-self', name: 'Gmail', type: 'action', description: 'Send yourself an email', icon: 'mail', color: COLORS['Gmail'], configFields: [{ name: 'content', label: 'Content', type: 'text', required: true }] },
    // YouTube
    { id: 'youtube-upload', name: 'YouTube', type: 'action', description: 'Upload video from URL', icon: 'youtube', color: COLORS['YouTube'], configFields: [{ name: 'url', label: 'Video URL', type: 'text', required: true }] },
    // ClickSend
    { id: 'clicksend-sms', name: 'ClickSend', type: 'action', description: 'Send SMS', icon: 'message-square', color: COLORS['ClickSend'], configFields: [{ name: 'phone', label: 'Phone number', type: 'text', required: true }, { name: 'message', label: 'Message', type: 'text', required: true }] },
    // Notifications
    { id: 'notify-send', name: 'Notifications', type: 'action', description: 'Send a notification', icon: 'bell', color: COLORS['Notifications'], configFields: [{ name: 'message', label: 'Message', type: 'text', required: true }] },
    { id: 'notify-rich', name: 'Notifications', type: 'action', description: 'Send a rich notification', icon: 'bell', color: COLORS['Notifications'], configFields: [{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'message', label: 'Message', type: 'text', required: true }, { name: 'image', label: 'Image', type: 'text' }, { name: 'link', label: 'Link', type: 'text' }] },
    { id: 'notify-ifttt', name: 'Notifications', type: 'action', description: 'Send a rich notification to IFTTT widget', icon: 'bell', color: COLORS['Notifications'], configFields: [{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'message', label: 'Message', type: 'text', required: true }] },
    // LinkedIn
    { id: 'linkedin-update', name: 'LinkedIn', type: 'action', description: 'Share an update', icon: 'linkedin', color: COLORS['LinkedIn'], configFields: [{ name: 'text', label: 'Text update', type: 'text', required: true }] },
    { id: 'linkedin-link', name: 'LinkedIn', type: 'action', description: 'Share a link', icon: 'linkedin', color: COLORS['LinkedIn'], configFields: [{ name: 'url', label: 'Link URL', type: 'text', required: true }] },
    { id: 'linkedin-image', name: 'LinkedIn', type: 'action', description: 'Share an update with image', icon: 'linkedin', color: COLORS['LinkedIn'], configFields: [{ name: 'text', label: 'Text', type: 'text', required: true }, { name: 'image', label: 'Image', type: 'text', required: true }] },
    { id: 'linkedin-video', name: 'LinkedIn', type: 'action', description: 'Share an update with video', icon: 'linkedin', color: COLORS['LinkedIn'], configFields: [{ name: 'text', label: 'Text', type: 'text', required: true }, { name: 'video', label: 'Video', type: 'text', required: true }] },
    // Google Calendar
    { id: 'calendar-quick', name: 'Google Calendar', type: 'action', description: 'Quick add event', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [{ name: 'description', label: 'Event description', type: 'text', required: true }] },
    { id: 'calendar-detailed', name: 'Google Calendar', type: 'action', description: 'Create a detailed event', icon: 'calendar', color: COLORS['Google Calendar'], configFields: [{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'time', label: 'Time', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'text' }, { name: 'location', label: 'Location', type: 'text' }] },
    // Android SMS
    { id: 'android-sms-send', name: 'Android SMS', type: 'action', description: 'Send an SMS', icon: 'message-square', color: COLORS['Android SMS'], configFields: [{ name: 'phone', label: 'Phone number', type: 'text', required: true }, { name: 'message', label: 'Message', type: 'text', required: true }] },
    // GitHub
    { id: 'github-gist', name: 'GitHub', type: 'action', description: 'Create new Gist', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'content', label: 'Gist content/files', type: 'text', required: true }] },
    { id: 'github-comment', name: 'GitHub', type: 'action', description: 'Create an issue/pull request comment', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }, { name: 'number', label: 'Issue/PR number', type: 'text', required: true }, { name: 'comment', label: 'Comment text', type: 'text', required: true }] },
    { id: 'github-issue', name: 'GitHub', type: 'action', description: 'Create an issue', icon: 'github', color: COLORS['GitHub'], configFields: [{ name: 'repo', label: 'Repository', type: 'text', required: true }, { name: 'title', label: 'Title', type: 'text', required: true }, { name: 'body', label: 'Body', type: 'text', required: true }] },
    // X.com
    { id: 'x-tweet', name: 'X.com', type: 'action', description: 'Post a tweet', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'text', label: 'Tweet text', type: 'text', required: true }] },
    { id: 'x-tweet-image', name: 'X.com', type: 'action', description: 'Post a tweet with image', icon: 'twitter', color: COLORS['X.com'], configFields: [{ name: 'text', label: 'Tweet text', type: 'text', required: true }, { name: 'image', label: 'Image', type: 'text', required: true }] },
];

export const ALL_PLUGINS = [...TRIGGERS, ...ACTIONS];
