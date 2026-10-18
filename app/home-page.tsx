'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, Zap, Database,
    ShieldCheck, Mail, Briefcase, CheckCircle2
} from 'lucide-react';

import { EVENTS } from '@/lib/events';
import { CardRenderer } from '@/components/cards/card-renderer';
import { buildSampleDesigns } from '@/lib/cards/occasion-profile';
import { luminance } from '@/lib/cards/color';
import { useEvent } from "@/app/context/EventContext";
import { useAuth } from "@/lib/auth/AuthContext";

interface AdaptiveButtonProps {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    primaryColor: string;
    variant?: string;
    className?: string;
    size?: string;
}

const AdaptiveButton = ({
    children,
    onClick,
    primaryColor,
    variant = 'primary',
    className = "",
    size = "md"
}: AdaptiveButtonProps) => {
    const isPrimary = variant === 'primary';

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            style={{
                backgroundColor: isPrimary ? primaryColor : 'transparent',
                borderColor: isPrimary ? 'transparent' : `${primaryColor}35`,
                color: isPrimary ? (luminance(primaryColor) > 0.4 ? '#1A0F14' : '#fff') : '#F6EFE4'
            }}
            className={`
                flex items-center justify-center gap-2.5 font-semibold transition-all
                ${size === 'lg' ? 'px-8 py-4 rounded-2xl text-[15px]' : 'px-5 py-3 rounded-xl text-[13px]'}
                ${!isPrimary ? 'border backdrop-blur-md hover:bg-white/[0.04]' : ''}
                ${className}
            `}
        >
            {children}
        </motion.button>
    );
};

export default function HomePageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { eventId } = useEvent();
    const currentEvent = useMemo(() => EVENTS[eventId], [eventId]);

    const handleProtectedAction = (path: string) => {
        if (!user) {
            router.push('/auth');
        } else {
            router.push(path);
        }
    };

    const sampleDesigns = buildSampleDesigns(eventId, 'fr');

    const businessFeatures = [
        { icon: <Database size={15} />, label: "Import Excel / CSV" },
        { icon: <Zap size={15} />, label: "Génération par lots" },
        { icon: <Mail size={15} />, label: "Envoi direct par email" },
        { icon: <ShieldCheck size={15} />, label: "Logo d'entreprise inclus" },
    ];

    return (
        <div className="min-h-screen bg-[#1A0F14] text-white selection:bg-white selection:text-black overflow-x-hidden pt-28">

            {/* Ambient light background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    key={`glow-a-${eventId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    style={{ backgroundColor: `${currentEvent.colors.primary}12` }}
                    className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[200px]"
                />
                <motion.div
                    key={`glow-b-${eventId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    style={{ backgroundColor: `${currentEvent.colors.secondary}0C` }}
                    className="absolute bottom-0 right-0 w-2/3 h-2/3 rounded-full blur-[180px]"
                />
            </div>

            <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">

                {/* Hero — Asymmetric editorial layout */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={eventId}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center mb-28"
                    >
                        {/* Text column */}
                        <div className="flex flex-col">
                           

                            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] font-semibold leading-[1.0] tracking-[-0.02em] mb-6">
                                La carte juste
                                <br />
                                pour{' '}
                                <em
                                    style={{ color: currentEvent.colors.accent }}
                                    className="not-italic font-serif italic transition-colors duration-500"
                                >
                                    {currentEvent.name.fr.toLowerCase()}
                                </em>
                            </h1>

                            <p className="text-white/50 text-[15px] leading-[1.7] max-w-[440px] mb-10">
                                Dites pour qui et pour quelle occasion. Make &amp; Wish compose une vraie carte — des mots justes, un univers graphique, des décors qui vont ensemble.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <AdaptiveButton
                                    size="lg"
                                    primaryColor={currentEvent.colors.primary}
                                    onClick={() => handleProtectedAction(`/create?event=${eventId}`)}
                                >
                                    {user ? "Ouvrir le Studio" : "Commencer gratuitement"}
                                    <ArrowRight size={16} />
                                </AdaptiveButton>

                                
                            </div>

                            
                        </div>

                        {/* Cards column */}
                        <div className="relative h-[380px] lg:h-[480px] flex items-center justify-center">
                            {sampleDesigns.slice(0, 2).map((design, index) => (
                                <motion.div
                                    key={`${eventId}-${design.id}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{
                                        opacity: 1,
                                        y: index === 0 ? -20 : 20,
                                        rotate: index === 0 ? -5 : 3,
                                        x: index === 0 ? -30 : 30,
                                    }}
                                    transition={{ type: 'spring', bounce: 0.3, delay: 0.1 + index * 0.15 }}
                                    className="absolute w-[190px] sm:w-[210px]"
                                    style={{ zIndex: index === 0 ? 1 : 2 }}
                                >
                                    <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                                        <CardRenderer design={design} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Features — Editorial numbered grid */}
                

                {/* How it works */}
                <div className="mb-28">
                    <div className="flex items-center gap-8 mb-10">
                        <h2 className="font-serif text-2xl font-semibold text-white/80 whitespace-nowrap">Comment ça marche</h2>
                        <div className="hidden sm:block h-px flex-1 bg-white/[0.06]" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                number: '01',
                                title: 'Choisissez l’occasion',
                                text: 'Sélectionnez le type d’événement, le style visuel et le destinataire.',
                            },
                            {
                                number: '02',
                                title: 'L’IA crée la carte',
                                text: 'Le message, les décors et les couleurs sont générés en fonction de votre contexte.',
                            },
                            {
                                number: '03',
                                title: 'Partagez ou imprimez',
                                text: 'Téléchargez en haute résolution, envoyez par email ou partagez en WhatsApp.',
                            },
                        ].map((step) => (
                            <div
                                key={step.number}
                                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-7"
                            >
                                <span
                                    className="block text-[11px] font-mono mb-5"
                                    style={{ color: currentEvent.colors.accent + '80' }}
                                >
                                    {step.number}
                                </span>
                                <h3 className="font-serif text-[22px] font-semibold text-white mb-3">{step.title}</h3>
                                <p className="text-[13px] leading-relaxed text-white/45">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offers — Editorial, not generic comparison */}
                <div className="mb-28">
                    <div className="grid md:grid-cols-[3fr_2fr] gap-5">

                        {/* Solo — Main wide card */}
                        <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.025] p-8 sm:p-10 flex flex-col justify-between min-h-[320px]">
                            <div
                                className="absolute top-0 left-0 w-2/3 h-2/3 blur-[120px] opacity-20 pointer-events-none"
                                style={{ backgroundColor: currentEvent.colors.primary }}
                            />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="block text-white/30 text-[11px] tracking-widest uppercase mb-1">Pour particuliers</span>
                                        <h3 className="font-serif text-3xl font-semibold text-white">Pack Solo</h3>
                                    </div>
                                    <div
                                        className="px-3 py-1 rounded-full text-[11px] font-medium"
                                        style={{ backgroundColor: `${currentEvent.colors.primary}20`, color: currentEvent.colors.primary }}
                                    >
                                        Accès libre
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {[
                                        "Messages rédigés par l'IA",
                                        "Export HD et impression",
                                        "Univers graphiques par occasion",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[13px] text-white/55">
                                            <CheckCircle2 size={15} style={{ color: currentEvent.colors.primary + 'CC' }} className="shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative z-10">
                                <AdaptiveButton
                                    onClick={() => handleProtectedAction(`/create?event=${eventId}`)}
                                    primaryColor={currentEvent.colors.primary}
                                    className="w-full sm:w-auto"
                                    size="lg"
                                >
                                    Créer maintenant
                                    <ArrowRight size={15} />
                                </AdaptiveButton>
                            </div>
                        </div>

                        {/* Business — Compact card */}
                        <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.015] p-8 flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <span className="block text-white/30 text-[11px] tracking-widest uppercase mb-1">Pour entreprises</span>
                                        <h3 className="font-serif text-2xl font-semibold text-white">Pack Business</h3>
                                    </div>
                                    <div className="p-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04]">
                                        <Briefcase size={18} style={{ color: currentEvent.colors.primary }} />
                                    </div>
                                </div>

                                <p className="text-white/40 text-[13px] leading-relaxed mb-6">
                                    Personnalisation de masse intelligente pour vos relations clients.
                                </p>

                                <div className="space-y-2.5">
                                    {businessFeatures.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/40">
                                            <span style={{ color: currentEvent.colors.primary + '80' }}>{f.icon}</span>
                                            {f.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 mt-6">
                                <AdaptiveButton
                                    onClick={() => handleProtectedAction(`/batch?event=${eventId}`)}
                                    primaryColor={currentEvent.colors.primary}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Zap size={15} />
                                    Lancer un batch
                                </AdaptiveButton>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.04] py-10">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="font-serif text-[15px] text-white/30">
                        Make <em className="italic" style={{ color: currentEvent.colors.accent + '60' }}>&amp; Wish</em>
                    </span>
                    <div className="flex items-center gap-6 text-[11px] text-white/20">
                        <button className="hover:text-white/50 transition-colors">Confidentialité</button>
                        <span className="w-px h-3 bg-white/10" />
                        <button className="hover:text-white/50 transition-colors">Mentions légales</button>
                        <span className="w-px h-3 bg-white/10" />
                        <span>© 2026</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
