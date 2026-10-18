// Layout isolé pour /admin — exclut la Navbar globale
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Administration',
    description: 'Interface d’administration Make & Wish.',
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
