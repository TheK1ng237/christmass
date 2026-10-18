'use client';

import { useMemo, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight,
    ArrowUpRight, MailCheck, Star, Gift, Heart, Wand2
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { EVENTS } from '@/lib/events';
import { EventType } from '@/lib/types';


/* ─── Google Icon SVG ─── */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

/* ─── Floating Orb ─── */
const FloatingOrb = ({ color, style }: { color: string; style: React.CSSProperties }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`, ...style }}
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
);

/* ─── Input Field ─── */
const InputField = ({
    type, placeholder, value, onChange, icon: Icon, rightElement, required
}: {
    type: string; placeholder: string; value: string;
    onChange: (v: string) => void; icon: React.ElementType;
    rightElement?: React.ReactNode; required?: boolean;
}) => (
    <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors duration-200">
            <Icon size={16} />
        </div>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full pl-12 pr-12 py-4 text-white text-sm font-medium rounded-2xl outline-none transition-all duration-200 placeholder:text-white/25"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
        />
        {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
    </div>
);

/* ─── Features list shown on left panel ─── */
const features = [
    { icon: Wand2, label: 'Cartes générées par IA' },
    { icon: Gift, label: 'Pour chaque occasion' },
    { icon: Heart, label: 'Personnalisées avec amour' },
    { icon: Star, label: 'Design premium & unique' },
];

/* ──────────────────────────────────────────────────────────────
   Main Auth Content
────────────────────────────────────────────────────────────── */
function AuthContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const eventId = (searchParams.get('event')?.toLowerCase() as EventType) || 'christmas';
    const currentEvent = useMemo(() => EVENTS[eventId] || EVENTS.newyear, [eventId]);
    const accent = currentEvent.colors.primary;

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuth();

    const getEmailProviderLink = (email: string) => {
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain?.includes('gmail')) return 'https://mail.google.com';
        if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) return 'https://outlook.live.com';
        if (domain?.includes('yahoo')) return 'https://mail.yahoo.com';
        return `https://${domain}`;
    };

    const handleGoogleSignIn = async () => {
        const origin = window.location.origin;
        const nextPath = searchParams.get('next') || '/dashboard';
        const fullRedirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
        try { await signInWithGoogle(fullRedirectUrl); } catch (err) { console.error('Erreur Google Auth:', err); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'signup') {
                const res = await signUp(email, password, name);
                if (res.error) throw res.error;
                setShowSuccessModal(true);
            } else {
                const result = await signIn(email, password);
                if (result.error) { setError(result.error.message); setLoading(false); return; }
                const session = (result as any).data?.session;
                if (session) { router.push(searchParams.get('next') || '/dashboard'); return; }
                setError('Impossible de récupérer la session. Vérifiez vos identifiants.');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A0F14] flex items-center justify-center pt-20 pb-8 px-4 relative overflow-hidden">

            {/* ── Background ambiance ── */}
            <FloatingOrb color={accent} style={{ width: 500, height: 500, top: '-10%', left: '-10%' }} />
            <FloatingOrb color={accent} style={{ width: 300, height: 300, bottom: '5%', right: '-5%' }} />
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="relative z-10 w-full max-w-5xl">

               

                {/* ── Main card (two-panel layout) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >

                    {/* ══ LEFT PANEL — hero ══ */}
                    <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${accent}18 0%, #1A0F14 50%, #241519 100%)` }}>

                        {/* Glowing border-right */}
                        <div className="absolute right-0 top-0 w-px h-full"
                            style={{ background: `linear-gradient(to bottom, transparent, ${accent}40, transparent)` }} />

                        {/* Decorative circle */}
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl"
                            style={{ background: `${accent}20` }} />

                        <div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-10"
                                style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                                <Sparkles size={24} style={{ color: accent }} />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h1 className="text-5xl font-black italic tracking-tight leading-none mb-4 text-white uppercase">
                                        {mode === 'signin' ? (
                                            <>Bon<br /><span style={{ color: accent }}>Retour</span></>
                                        ) : (
                                            <>Nouvel<br /><span style={{ color: accent }}>Espace</span></>
                                        )}
                                    </h1>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        {mode === 'signin'
                                            ? 'Vos cartes vous attendent. Reconnectez-vous et continuez à créer des moments inoubliables.'
                                            : "Rejoignez des milliers de créateurs et donnez vie à vos messages avec l'intelligence artificielle."}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                            {features.map(({ icon: Icon, label }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
                                        <Icon size={14} style={{ color: accent }} />
                                    </div>
                                    <span className="text-white/50 text-sm font-medium">{label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ══ RIGHT PANEL — form ══ */}
                    <div className="relative flex flex-col justify-center p-8 sm:p-12"
                        style={{ background: 'rgba(28, 16, 21, 0.95)', backdropFilter: 'blur(40px)' }}>

                        {/* Loading bar */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    className="absolute top-0 left-0 h-[2px] z-20"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '90%' }}
                                    exit={{ width: '100%', opacity: 0 }}
                                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                                    style={{ background: `linear-gradient(to right, ${accent}, ${accent}80)` }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Mode toggle tabs */}
                        <div className="flex rounded-2xl p-1 mb-10"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {(['signin', 'signup'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => { setMode(m); setError(''); }}
                                    className="relative flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-colors duration-200"
                                    style={{ color: mode === m ? '#fff' : 'rgba(255,255,255,0.3)' }}
                                >
                                    {mode === m && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute inset-0 rounded-xl"
                                            style={{ background: accent + '25', border: `1px solid ${accent}40` }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">
                                        {m === 'signin' ? 'Connexion' : 'Inscription'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <AnimatePresence>
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <InputField
                                            type="text"
                                            placeholder="Nom complet"
                                            value={name}
                                            onChange={setName}
                                            icon={User}
                                            required
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <InputField
                                type="email"
                                placeholder="Adresse e-mail"
                                value={email}
                                onChange={setEmail}
                                icon={Mail}
                                required
                            />

                            <InputField
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mot de passe"
                                value={password}
                                onChange={setPassword}
                                icon={Lock}
                                required
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="text-white/30 hover:text-white/70 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="px-4 py-3 rounded-xl text-xs font-bold text-red-400 uppercase tracking-wide"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 mt-2 rounded-2xl font-black uppercase text-sm tracking-widest text-white flex items-center justify-center gap-3 relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                    boxShadow: `0 8px 32px ${accent}30`,
                                }}
                            >
                                <span className="relative z-10">
                                    {loading ? 'Chargement…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
                                </span>
                                {!loading && <ArrowRight size={16} className="relative z-10" />}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">ou</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        </div>

                        {/* Google */}
                        <motion.button
                            onClick={handleGoogleSignIn}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-3 transition-colors"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        >
                            <GoogleIcon />
                            Continuer avec Google
                        </motion.button>

                        {/* Switch mode helper */}
                        <p className="mt-6 text-center text-xs text-white/25">
                            {mode === 'signin' ? 'Pas encore de compte ?' : 'Déjà membre ?'}{' '}
                            <button
                                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                                className="font-bold underline underline-offset-2 transition-colors"
                                style={{ color: accent + 'cc' }}
                                onMouseEnter={e => (e.currentTarget.style.color = accent)}
                                onMouseLeave={e => (e.currentTarget.style.color = accent + 'cc')}
                            >
                                {mode === 'signin' ? 'Créer un compte' : 'Se connecter'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ══ SUCCESS MODAL ══ */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                        style={{ background: 'rgba(26,15,20,0.96)', backdropFilter: 'blur(20px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="relative max-w-md w-full p-10 rounded-[3rem] text-center overflow-hidden"
                            style={{
                                background: 'rgba(36,21,25,0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                            }}
                        >
                            {/* Glow */}
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl"
                                style={{ background: `${accent}30` }} />

                            {/* Icon */}
                            <div className="relative w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6"
                                style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
                                <MailCheck size={36} style={{ color: accent }} />
                            </div>

                            <h2 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white leading-none">
                                Lien <span style={{ color: accent }}>Envoyé !</span>
                            </h2>
                            <p className="text-white/40 text-sm mb-8 leading-relaxed">
                                Un email de confirmation a été envoyé à<br />
                                <span className="text-white font-semibold">{email}</span>
                            </p>

                            <div className="flex flex-col gap-3">
                                <a
                                    href={getEmailProviderLink(email)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                                >
                                    Ouvrir ma boîte mail <ArrowUpRight size={16} />
                                </a>
                                <button
                                    onClick={() => { setShowSuccessModal(false); setMode('signin'); }}
                                    className="w-full py-3 rounded-2xl text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    Retour à la connexion
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Wrapper obligatoire pour useSearchParams
export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#1A0F14]" />}>
            <AuthContent />
        </Suspense>
    );
}
