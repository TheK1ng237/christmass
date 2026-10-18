import type { Metadata } from 'next';
import HomePageContent from './home-page';
import { publicSiteUrl } from '@/lib/seo';

const title = 'Cartes de vœux personnalisées créées avec l’IA';
const description =
    'Créez une carte de vœux personnalisée pour chaque occasion : message adapté, univers graphique unique, puis téléchargement, impression ou partage.';

export const metadata: Metadata = {
    title,
    description,
    alternates: publicSiteUrl ? { canonical: '/' } : undefined,
    openGraph: {
        type: 'website',
        title,
        description,
        ...(publicSiteUrl ? { url: publicSiteUrl.href } : {}),
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
    },
};

const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Make & Wish',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr',
    description,
    ...(publicSiteUrl ? { url: publicSiteUrl.href } : {}),
};

export default function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(softwareApplicationJsonLd).replace(/</g, '\\u003c'),
                }}
            />
            <HomePageContent />
        </>
    );
}
