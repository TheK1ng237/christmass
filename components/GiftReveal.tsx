'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { darken, lighten, luminance, seeded } from '@/lib/cards/color';
import type { CardPalette } from '@/lib/schemas/card-design';

interface GiftRevealProps {
    /** La carte (le contenu qui sort du paquet). */
    children: ReactNode;
    /** Palette de la carte : le paquet reprend ses couleurs. */
    palette: CardPalette;
    /** Titre au-dessus du paquet, ex. "Un cadeau pour Marie". */
    title?: string;
    /** Indication sous le paquet, ex. "Touchez pour ouvrir". */
    hint?: string;
    /** true : la carte s'affiche directement (ex. pour son créateur). */
    defaultOpen?: boolean;
    onOpen?: () => void;
}

export default function GiftReveal({
    children,
    palette,
    title,
    hint = 'Touchez le cadeau pour l’ouvrir',
    defaultOpen = false,
    onOpen,
}: GiftRevealProps) {
    const id = useId().replace(/:/g, '');
    const reduce = useReducedMotion();
    const [shaking, setShaking] = useState(false);
    const [opened, setOpened] = useState(defaultOpen);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const box = luminance(palette.primary) > 0.6 ? palette.accent : palette.primary;
    const ribbon = luminance(box) < 0.3 ? lighten(palette.accent, 0.25) : darken(box, 0.42);
    const skip = defaultOpen;

    const handleOpen = () => {
        if (opened || shaking) return;
        if (reduce) {
            setOpened(true);
            onOpen?.();
            return;
        }
        setShaking(true);
        timer.current = setTimeout(() => {
            setShaking(false);
            setOpened(true);
            onOpen?.();
        }, 450);
    };

    const confetti = useMemo(() => {
        const rnd = seeded(`gift-${palette.primary}-${palette.accent}`);
        const colors = [palette.accent, palette.primary, lighten(palette.accent, 0.5), '#ffffff'];
        return Array.from({ length: 20 }, (_, i) => ({
            x: (rnd() - 0.5) * 340,
            y: -90 - rnd() * 190,
            r: (rnd() - 0.5) * 540,
            s: 6 + rnd() * 7,
            c: colors[i % colors.length],
            round: i % 3 === 0,
            d: rnd() * 0.15,
        }));
    }, [palette]);

    const ease = [0.22, 1, 0.36, 1] as const;
    const t = (duration: number, delay = 0) => ({ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease });
    const initial = skip ? false : 'closed';
    const state = opened ? 'open' : 'closed';

    return (
        <div className="w-full">
            {title && !opened && (
                <p className="mb-5 text-center font-serif text-2xl font-semibold text-[#F6EFE4]">{title}</p>
            )}

            <div style={{ position: 'relative', width: '100%', aspectRatio: '5 / 7' }}>
                {/* La carte : cachée dans le paquet, puis elle en sort */}
                <motion.div
                    style={{ position: 'absolute', inset: 0, zIndex: 10, transformOrigin: '50% 100%' }}
                    initial={initial}
                    animate={state}
                    variants={{
                        closed: { y: '24%', scale: 0.6, opacity: 0 },
                        open: { y: 0, scale: 1, opacity: 1 },
                    }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 15, delay: 0.35 }}
                    aria-hidden={!opened}
                >
                    {children}
                </motion.div>

                {/* Le paquet cadeau */}
                <motion.div
                    style={{ position: 'absolute', left: '10%', width: '80%', bottom: '4%', aspectRatio: '1 / 1', zIndex: 20, pointerEvents: opened ? 'none' : 'auto' }}
                    initial={initial}
                    animate={opened ? 'open' : shaking ? 'shake' : 'closed'}
                    variants={{
                        closed: { rotate: 0, y: 0, opacity: 1 },
                        shake: { rotate: [0, -3.5, 3.5, -2.5, 2.5, 0], transition: { duration: 0.45 } },
                        open: { rotate: 0, y: 36, opacity: 0, transition: t(0.55, 0.6) },
                    }}
                >
                    <button
                        type="button"
                        onClick={handleOpen}
                        disabled={opened}
                        aria-label="Ouvrir le cadeau"
                        style={{ position: 'absolute', inset: 0, zIndex: 30, cursor: 'pointer', background: 'transparent', border: 0 }}
                        className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A15B]"
                    />

                    {/* corps */}
                    <svg viewBox="0 0 300 220" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'visible' }} aria-hidden>
                        <defs>
                            <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stopColor={darken(box, 0.18)} />
                                <stop offset="0.5" stopColor={box} />
                                <stop offset="1" stopColor={darken(box, 0.3)} />
                            </linearGradient>
                            <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stopColor={darken(ribbon, 0.2)} />
                                <stop offset="0.5" stopColor={lighten(ribbon, 0.2)} />
                                <stop offset="1" stopColor={darken(ribbon, 0.2)} />
                            </linearGradient>
                        </defs>
                        <ellipse cx="150" cy="214" rx="124" ry="9" fill="#000" opacity="0.28" />
                        <rect x="30" y="40" width="240" height="170" rx="6" fill={`url(#${id}-b)`} />
                        <rect x="138" y="40" width="24" height="170" fill={`url(#${id}-r)`} />
                        {Array.from({ length: 8 }, (_, i) => (
                            <path key={i} d={`M${46 + i * 12} 150 l6 -7 l6 7`} stroke={ribbon} strokeWidth="2" fill="none" opacity="0.5" />
                        ))}
                    </svg>

                    {/* couvercle : se détache et s'envole */}
                    <motion.svg
                        viewBox="0 0 300 150"
                        style={{ position: 'absolute', left: 0, width: '100%', top: '1.33%', height: '50%', overflow: 'visible', transformOrigin: '50% 80%' }}
                        initial={initial}
                        animate={state}
                        variants={{
                            closed: { y: 0, x: 0, rotate: 0, opacity: 1 },
                            open: { y: '-120%', x: '36%', rotate: 26, opacity: 0, transition: t(0.85) },
                        }}
                        aria-hidden
                    >
                        <defs>
                            <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stopColor={darken(box, 0.08)} />
                                <stop offset="0.5" stopColor={lighten(box, 0.1)} />
                                <stop offset="1" stopColor={darken(box, 0.24)} />
                            </linearGradient>
                            <linearGradient id={`${id}-k`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor={lighten(ribbon, 0.35)} />
                                <stop offset="0.5" stopColor={ribbon} />
                                <stop offset="1" stopColor={darken(ribbon, 0.28)} />
                            </linearGradient>
                        </defs>
                        <rect x="16" y="72" width="268" height="46" rx="6" fill={`url(#${id}-l)`} />
                        <rect x="16" y="72" width="268" height="8" rx="4" fill="#fff" opacity="0.18" />
                        <rect x="138" y="72" width="24" height="46" fill={`url(#${id}-k)`} />
                        <path d="M150 72 C 110 14, 56 22, 74 54 C 86 76, 134 74, 150 72 Z" fill={`url(#${id}-k)`} />
                        <path d="M150 72 C 190 14, 244 22, 226 54 C 214 76, 166 74, 150 72 Z" fill={`url(#${id}-k)`} />
                        <path d="M84 40 C 102 32, 124 44, 142 64" stroke={lighten(ribbon, 0.5)} strokeWidth="2.5" fill="none" opacity="0.7" />
                        <rect x="138" y="62" width="24" height="22" rx="7" fill={darken(ribbon, 0.06)} />
                    </motion.svg>

                    {/* confettis au moment de l'ouverture */}
                    {opened && !skip && !reduce && (
                        <div style={{ position: 'absolute', left: '50%', top: '30%', pointerEvents: 'none' }} aria-hidden>
                            {confetti.map((p, i) => (
                                <motion.span
                                    key={i}
                                    style={{ position: 'absolute', display: 'block', width: p.s, height: p.round ? p.s : p.s * 0.5, background: p.c, borderRadius: p.round ? '50%' : 1 }}
                                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                                    animate={{ x: p.x, y: [0, p.y, p.y + 150], opacity: [1, 1, 0], rotate: p.r }}
                                    transition={{ duration: 1.4, delay: p.d, ease: 'easeOut' }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {!opened && (
                <motion.p
                    className="mt-6 text-center text-sm text-[#F6EFE4]/60"
                    animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                >
                    {hint}
                </motion.p>
            )}
        </div>
    );
}
