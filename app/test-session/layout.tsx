import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Test de session',
    description: 'Page de test interne Make & Wish.',
    robots: { index: false, follow: false },
};

export default function TestSessionLayout({ children }: { children: React.ReactNode }) {
    return children;
}
