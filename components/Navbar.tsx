'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Layers, X, Shield, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { EVENTS, getAvailableEvents } from '@/lib/events';
import { EventType } from '@/lib/types';
import { useEvent } from '@/app/context/EventContext';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { eventId, setEventId } = useEvent();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isOccasionOpen, setIsOccasionOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const occasionRef = useRef<HTMLDivElement>(null);
    const availableEvents = getAvailableEvents();
    const currentEvent = EVENTS[eventId];
    const EventIcon = currentEvent.icon;
    const isAdmin = user?.user_metadata?.role === 'admin';

    // Close occasion dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (occasionRef.current && !occasionRef.current.contains(e.target as Node)) {
                setIsOccasionOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
        setIsOccasionOpen(false);
    }, [pathname]);

    const navigateTo = (path: string) => {
        router.push(path);
        setIsMobileOpen(false);
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        setIsMobileOpen(false);
    };

    const selectEvent = (id: EventType) => {
        setEventId(id);
        setIsOccasionOpen(false);
        setIsMobileOpen(false);
    };

    return (
        <div className="fixed top-0 left-0 w-full flex justify-center z-[60] pt-4 px-4">
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`
                    w-full max-w-5xl flex justify-between items-center px-3 py-2
                    rounded-full border transition-all duration-500
                    ${scrolled
                        ? 'bg-[#1A0F14]/92 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                        : 'bg-[#1A0F14]/50 backdrop-blur-xl border-white/[0.08]'
                    }
                `}
            >
                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2.5 group relative z-[70]">
                    <motion.div
                        key={`logo-${eventId}`}
                        initial={{ scale: 0.8, rotate: -8 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', bounce: 0.45 }}
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                        style={{
                            backgroundColor: currentEvent.colors.primary,
                            boxShadow: `0 4px 14px ${currentEvent.colors.primary}50`
                        }}
                    >
                        <EventIcon size={18} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                    <span className="font-serif text-[17px] font-semibold text-white leading-none">
                        Make<span style={{ color: currentEvent.colors.accent }} className="italic transition-colors duration-500"> &amp; Wish</span>
                    </span>
                </Link>

                {/* ── Desktop nav ── */}
                <div className="hidden md:flex items-center gap-1">

                    {/* Occasion picker */}
                    <div className="relative" ref={occasionRef}>
                        <button
                            onClick={() => setIsOccasionOpen(v => !v)}
                            className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full text-[12px] font-medium transition-all"
                            style={{
                                background: isOccasionOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isOccasionOpen ? currentEvent.colors.primary + '50' : 'rgba(255,255,255,0.08)'}`,
                                color: '#fff',
                            }}
                        >
                            <EventIcon size={13} style={{ color: currentEvent.colors.primary }} strokeWidth={2.5} />
                            <span>{currentEvent.name.fr}</span>
                            <motion.div
                                animate={{ rotate: isOccasionOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={13} className="text-white/40" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isOccasionOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                    transition={{ duration: 0.16 }}
                                    className="absolute top-full mt-2 left-0 min-w-[200px] rounded-2xl p-1.5 shadow-2xl z-[80]"
                                    style={{
                                        background: 'rgba(28,16,21,0.98)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(24px)',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    {/* Section header */}
                                    <p className="px-3 pt-1 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                                        Occasion
                                    </p>
                                    {availableEvents.map((ev) => {
                                        const Icon = ev.icon;
                                        const isActive = eventId === ev.id;
                                        return (
                                            <button
                                                key={ev.id}
                                                onClick={() => selectEvent(ev.id as EventType)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group"
                                                style={{
                                                    background: isActive ? `${ev.colors.primary}15` : 'transparent',
                                                }}
                                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{
                                                        backgroundColor: isActive ? `${ev.colors.primary}25` : 'rgba(255,255,255,0.06)',
                                                    }}
                                                >
                                                    <Icon size={14} style={{ color: isActive ? ev.colors.primary : 'rgba(255,255,255,0.4)' }} strokeWidth={2} />
                                                </div>
                                                <span className="text-[13px] font-medium flex-1" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.55)' }}>
                                                    {ev.name.fr}
                                                </span>
                                                {isActive && (
                                                    <Check size={13} style={{ color: ev.colors.primary }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Modèles link */}
                    <NavPill
                        onClick={() => navigateTo('/templates')}
                        active={pathname === '/templates'}
                        accentColor={currentEvent.colors.primary}
                    >
                        Modèles
                    </NavPill>

                    {/* Auth / user section */}
                    {!user ? (
                        <button
                            onClick={() => navigateTo('/auth')}
                            style={{ backgroundColor: currentEvent.colors.primary }}
                            className="ml-1 flex items-center gap-2 px-5 py-2 rounded-full text-white text-[12px] font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.97] shadow-md"
                        >
                            <UserIcon size={13} />
                            Connexion
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 ml-1">
                            {isAdmin && (
                                <button
                                    onClick={() => navigateTo('/admin')}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-medium hover:bg-violet-500/15 transition-all"
                                    title="Panneau Admin"
                                >
                                    <Shield size={12} />
                                    Admin
                                </button>
                            )}
                            <button
                                onClick={() => navigateTo('/dashboard')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.09] text-white text-[12px] font-medium hover:bg-white/[0.11] transition-all"
                            >
                                <Layers size={13} style={{ color: currentEvent.colors.accent }} />
                                Mon espace
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="p-2 ml-0.5 text-white/25 hover:text-red-400 transition-colors rounded-full hover:bg-white/5"
                                title="Déconnexion"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Mobile burger ── */}
                <button
                    className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white relative z-[70]"
                    onClick={() => setIsMobileOpen(v => !v)}
                    aria-label="Menu"
                >
                    <AnimatePresence mode="wait">
                        {isMobileOpen ? (
                            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                <X size={16} />
                            </motion.div>
                        ) : (
                            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-[5px] items-center">
                                <span className="w-[15px] h-[1.5px] bg-white block" />
                                <span className="w-[11px] h-[1.5px] bg-white/50 block" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </motion.nav>

            {/* ── Mobile Dropdown ── */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="fixed top-[72px] left-4 right-4 rounded-2xl p-3 md:hidden shadow-2xl z-[65]"
                        style={{
                            background: 'rgba(30,19,24,0.98)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(32px)',
                        }}
                    >
                        {/* Occasion section in mobile */}
                        <div className="mb-1">
                            <p className="px-3 pt-1 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                                Occasion
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                                {availableEvents.map((ev) => {
                                    const Icon = ev.icon;
                                    const isActive = eventId === ev.id;
                                    return (
                                        <button
                                            key={ev.id}
                                            onClick={() => selectEvent(ev.id as EventType)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-[13px] font-medium"
                                            style={{
                                                background: isActive ? `${ev.colors.primary}18` : 'rgba(255,255,255,0.03)',
                                                border: isActive ? `1px solid ${ev.colors.primary}35` : '1px solid rgba(255,255,255,0.06)',
                                                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                                            }}
                                        >
                                            <Icon size={14} style={{ color: isActive ? ev.colors.primary : 'rgba(255,255,255,0.35)' }} strokeWidth={2} />
                                            {ev.name.fr}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-white/[0.06] my-2" />

                        {/* Nav links */}
                        <button
                            onClick={() => navigateTo('/templates')}
                            className="w-full text-left px-4 py-3 rounded-xl text-white text-[14px] font-medium hover:bg-white/5 transition-colors"
                        >
                            Modèles
                        </button>

                        <div className="border-t border-white/[0.06] my-2" />

                        {/* User section */}
                        {!user ? (
                            <button
                                onClick={() => navigateTo('/auth')}
                                style={{ backgroundColor: currentEvent.colors.primary }}
                                className="w-full px-4 py-3 rounded-xl text-white text-[14px] font-semibold text-center transition-all hover:opacity-90"
                            >
                                Se connecter
                            </button>
                        ) : (
                            <>
                                {isAdmin && (
                                    <button
                                        onClick={() => navigateTo('/admin')}
                                        className="w-full text-left px-4 py-3 rounded-xl text-violet-400 text-[14px] font-medium hover:bg-violet-500/[0.08] transition-colors flex items-center gap-3"
                                    >
                                        <Shield size={15} />
                                        Admin Panel
                                    </button>
                                )}
                                <button
                                    onClick={() => navigateTo('/dashboard')}
                                    className="w-full text-left px-4 py-3 rounded-xl text-white text-[14px] font-medium hover:bg-white/5 transition-colors flex items-center gap-3"
                                >
                                    <Layers size={15} style={{ color: currentEvent.colors.accent }} />
                                    Mon espace
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-3 rounded-xl text-red-400 text-[14px] font-medium hover:bg-red-500/[0.08] transition-colors flex items-center gap-3"
                                >
                                    <LogOut size={15} />
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NavPill({ children, onClick, active, accentColor }: {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    accentColor?: string;
}) {
    return (
        <button
            onClick={onClick}
            className="relative px-4 py-2 rounded-full text-[12px] font-medium transition-colors duration-150"
            style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
        >
            {children}
            {active && accentColor && (
                <motion.span
                    layoutId="nav-active-dot"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
            )}
        </button>
    );
}
