'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#1A0F14] text-white flex items-center justify-center p-6 relative overflow-hidden">

            {/* Ambient orbs */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 500, height: 500,
                    top: '-15%', left: '-10%',
                    background: 'radial-gradient(circle, #C41E3A35 0%, transparent 70%)',
                }}
                animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 350, height: 350,
                    bottom: '0%', right: '-5%',
                    background: 'radial-gradient(circle, #8E1B2E30 0%, transparent 70%)',
                }}
                animate={{ y: [0, 20, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />

            {/* Subtle dot grid */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                }}
            />

            <div className="relative z-10 max-w-sm w-full text-center">

               

                {/* 404 visual */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative mb-6"
                >
                    <div
                        className="relative mx-auto w-48 h-48 rounded-[2.5rem] flex items-center justify-center overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <div
                            className="absolute inset-0 rounded-[2.5rem]"
                            style={{ background: 'radial-gradient(circle at 50% 30%, #C41E3A18, transparent 70%)' }}
                        />
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Wand2 size={64} style={{ color: '#C41E3A' }} strokeWidth={1.5} />
                        </motion.div>
                    </div>

                    <div
                        className="text-[7rem] font-black leading-none tracking-tighter select-none mt-4"
                        style={{ color: 'rgba(255,255,255,0.06)' }}
                    >
                        404
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-black italic tracking-tight text-white mb-3 uppercase">
                        Page <span style={{ color: '#C41E3A' }}>Égarée</span>
                    </h1>
                    <p className="text-white/35 text-sm leading-relaxed">
                        La carte ou le chemin que vous cherchez n&apos;existe plus ou a été déplacé ailleurs dans l&apos;univers.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-3"
                >
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-transform hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #C41E3A, #C41E3Acc)', boxShadow: '0 8px 32px #C41E3A30' }}
                    >
                        <Home size={16} />
                        Retour à l&apos;accueil
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm text-white/40 hover:text-white/70 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <ArrowLeft size={16} />
                        Page précédente
                    </button>
                </motion.div>

               
            </div>

            {/* Floating micro-dots */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 3, height: 3,
                        background: i % 2 === 0 ? '#C41E3A60' : 'rgba(255,255,255,0.15)',
                        top: `${(i * 17 + 11) % 100}%`,
                        left: `${(i * 37 + 7) % 100}%`,
                    }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }}
                />
            ))}
        </div>
    );
}
