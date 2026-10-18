import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Connexion et inscription',
    description: 'Connectez-vous ou créez un compte Make & Wish pour concevoir vos cartes de vœux.',
    robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children;
}
