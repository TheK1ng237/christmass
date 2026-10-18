import type { MetadataRoute } from 'next';
import { publicSiteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
    if (!publicSiteUrl) return [];

    return [
        { url: publicSiteUrl.href },
        { url: new URL('/templates', publicSiteUrl).href },
    ];
}
