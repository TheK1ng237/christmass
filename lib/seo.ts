const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const publicSiteUrl = (() => {
    if (!configuredSiteUrl) return undefined;

    try {
        const url = new URL(configuredSiteUrl);
        const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);

        if (isLocalhost || url.protocol !== 'https:' || url.username || url.password) {
            return undefined;
        }

        return new URL(url.origin);
    } catch {
        return undefined;
    }
})();
