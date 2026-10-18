import type { MetadataRoute } from 'next';
import { publicSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        ...(publicSiteUrl ? { sitemap: new URL('/sitemap.xml', publicSiteUrl).href } : {}),
    };
}
