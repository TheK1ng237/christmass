import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tableau de bord',
    description: 'Retrouvez et gérez vos cartes de vœux Make & Wish.',
    robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
