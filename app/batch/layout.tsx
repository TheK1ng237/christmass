import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Création de cartes en série',
    description: 'Préparez une génération groupée de cartes de vœux Make & Wish.',
    robots: { index: false, follow: false },
};

export default function BatchLayout({ children }: { children: React.ReactNode }) {
    return children;
}
