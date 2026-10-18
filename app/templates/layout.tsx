import type { Metadata } from 'next';
import { publicSiteUrl } from '@/lib/seo';

const title = 'Galerie de modèles de cartes de vœux';
const description =
    'Découvrez les univers graphiques de Make & Wish pour Noël, les anniversaires et les autres occasions, puis créez une carte personnalisée.';

export const metadata: Metadata = {
    title,
    description,
    alternates: publicSiteUrl ? { canonical: '/templates' } : undefined,
    openGraph: {
        type: 'website',
        title,
        description,
        ...(publicSiteUrl ? { url: new URL('/templates', publicSiteUrl).href } : {}),
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
    },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
