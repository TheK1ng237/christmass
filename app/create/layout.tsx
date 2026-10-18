import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Créer une carte de vœux',
    description: 'Composez une carte de vœux personnalisée avec Make & Wish.',
    robots: { index: false, follow: false },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
