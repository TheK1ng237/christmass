import type { Metadata } from 'next';
import {
    Bebas_Neue,
    Cormorant_Garamond,
    DM_Sans,
    Fraunces,
    Great_Vibes,
    Playfair_Display,
} from 'next/font/google';
import './globals.css';
import Navbar from "@/components/Navbar";
import {EventProvider} from "@/app/context/EventContext";
import GlobalParticles from "@/components/EventVisuals";
import {AuthProvider} from "@/lib/auth/AuthContext";

// Interface : Fraunces (titres) + DM Sans (texte)
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

// Cartes : chaque mise en page a sa propre voix typographique
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    style: ['normal', 'italic'],
    variable: '--font-cormorant',
    display: 'swap',
});
const script = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' });
const poster = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-poster', display: 'swap' });

export const metadata: Metadata = {
    title: 'Make & Wish | Cartes de vœux créées avec l’IA',
    description: 'Décrivez l’occasion et la personne : Make & Wish compose une vraie carte, avec son message, son univers graphique, ses décors et son papier. Personnalisez, téléchargez, partagez.',
    keywords: 'carte de vœux, IA, Noël, anniversaire, fête des mères, carte personnalisée, Make & Wish',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const fonts = [dmSans, fraunces, playfair, cormorant, script, poster].map((f) => f.variable).join(' ');

    return (
        <html lang="fr">
        <body className={`${fonts} font-sans bg-[#1A0F14] min-h-screen antialiased`}>
        <AuthProvider>
        <EventProvider>
        <Navbar />
            <GlobalParticles />
        {children}
        </EventProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
