import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Aperçu d’une carte partagée',
    description: 'Consultez l’aperçu d’une carte de vœux créée avec Make & Wish.',
    robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
    return children;
}
