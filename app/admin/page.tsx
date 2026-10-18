'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileText, Eye, TrendingUp, Trash2, Search,
    RefreshCw, Shield, X, Check,
    Globe, Calendar, AlertTriangle, BarChart3, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { EVENTS } from '@/lib/events';
import { EventType, EVENT_LABELS } from '@/lib/types';

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminStats {
    totalCards: number;
    totalUsers: number;
    totalViews: number;
    eventStats: Record<string, number>;
    langStats: { fr: number; en: number };
    recentCards: AdminCard[];
    topViewedCards: AdminCard[];
}

interface AdminCard {
    id: string;
    name: string;
    event_type: string;
    created_at: string;
    views_count: number;
    share_token: string;
    user_id?: string;
    language?: string;
}

interface AdminUser {
    id: string;
    email: string;
    name: string;
    created_at: string;
    last_sign_in: string;
    is_admin: boolean;
    card_count: number;
    provider: string;
}

// ── Composants utilitaires ─────────────────────────────────────────────────

function KpiCard({
    icon, label, value, sub, color
}: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none" style={{ backgroundColor: color + '18' }} />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="text-3xl font-serif font-semibold mb-1">{value}</div>
                    <div className="text-[12px] text-white/40 font-medium">{label}</div>
                    {sub && <div className="text-[11px] text-white/20 mt-1">{sub}</div>}
                </div>
                <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: color + '18', color }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border ${
                active
                    ? 'bg-white text-black border-transparent'
                    : 'bg-white/[0.04] text-white/40 border-white/[0.07] hover:text-white/70 hover:border-white/15'
            }`}
        >
            {children}
        </button>
    );
}

// ── Page principale ────────────────────────────────────────────────────────

export default function AdminPage() {
    const { user } = useAuth();

    const [tab, setTab] = useState<'overview' | 'users' | 'cards'>('overview');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [cards, setCards] = useState<AdminCard[]>([]);
    const [totalCards, setTotalCards] = useState(0);
    const [page, setPage] = useState(1);
    const [userSearch, setUserSearch] = useState('');
    const [eventFilter, setEventFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'card'; id: string; label: string } | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    // Chargement stats globales
    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Accès refusé');
            const data = await res.json();
            setStats(data);
        } catch {
            showToast('Impossible de charger les stats', false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Chargement utilisateurs
    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data.users || []);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // Chargement cartes
    const loadCards = useCallback(async () => {
        setCardsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (eventFilter) params.set('event', eventFilter);
            const res = await fetch(`/api/admin/cards?${params}`);
            const data = await res.json();
            setCards(data.cards || []);
            setTotalCards(data.total || 0);
        } finally {
            setCardsLoading(false);
        }
    }, [page, eventFilter]);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);
    useEffect(() => { if (tab === 'cards') loadCards(); }, [tab, loadCards]);

    // Supprimer utilisateur
    const deleteUser = async (userId: string) => {
        const res = await fetch('/api/admin/delete-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        if (res.ok) {
            showToast('Utilisateur supprimé');
            loadUsers();
            loadStats();
        } else {
            const d = await res.json();
            showToast(d.error || 'Erreur', false);
        }
    };

    // Supprimer carte
    const deleteCard = async (cardId: string) => {
        const res = await fetch('/api/admin/cards', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [cardId] }),
        });
        if (res.ok) {
            showToast('Carte supprimée');
            loadCards();
            loadStats();
        } else {
            showToast('Erreur lors de la suppression', false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0E090C] text-white">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-1/2 h-1/2 blur-[250px] opacity-[0.06] bg-violet-500" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 blur-[200px] opacity-[0.05] bg-rose-500" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 pb-6 sm:pb-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-500/20 shrink-0">
                            <Shield size={18} className="text-violet-400" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-serif text-xl sm:text-2xl font-semibold truncate">Admin Panel</h1>
                            <p className="text-[11px] text-white/30 truncate hidden sm:block">Make &amp; Wish — {user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={loadStats}
                            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white transition-all"
                            title="Rafraîchir"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="overflow-x-auto pb-1 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-full w-fit">
                        {([
                            { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 size={13} /> },
                            { id: 'users', label: 'Utilisateurs', icon: <Users size={13} /> },
                            { id: 'cards', label: 'Cartes', icon: <FileText size={13} /> },
                        ] as const).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
                                    tab === t.id
                                        ? 'bg-white text-black'
                                        : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab : Vue d'ensemble ── */}
                {tab === 'overview' && (
                    <div>
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />)}
                            </div>
                        ) : stats ? (
                            <>
                                {/* KPIs */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <KpiCard icon={<FileText size={16} />} label="Cartes créées" value={stats.totalCards} color="#A78BFA" />
                                    <KpiCard icon={<Users size={16} />} label="Utilisateurs" value={stats.totalUsers} color="#60A5FA" />
                                    <KpiCard icon={<Eye size={16} />} label="Vues totales" value={stats.totalViews} color="#34D399" />
                                    <KpiCard
                                        icon={<Globe size={16} />}
                                        label="Langues"
                                        value={`${stats.langStats.fr} FR / ${stats.langStats.en} EN`}
                                        color="#F59E0B"
                                    />
                                </div>

                                <div className="grid lg:grid-cols-[1fr_1fr] gap-5 mb-8">
                                    {/* Stats par événement */}
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                        <h2 className="font-serif text-[15px] font-semibold mb-5 text-white/70">Cartes par occasion</h2>
                                        <div className="space-y-3">
                                            {Object.entries(stats.eventStats)
                                                .sort(([,a],[,b]) => b - a)
                                                .map(([event, count]) => {
                                                    const ev = EVENTS[event as EventType];
                                                    const pct = stats.totalCards > 0 ? Math.round((count / stats.totalCards) * 100) : 0;
                                                    return (
                                                        <div key={event}>
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="text-[12px] text-white/50">{ev?.name?.fr || event}</span>
                                                                <span className="text-[12px] font-medium text-white/70">{count} <span className="text-white/25">({pct}%)</span></span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-700"
                                                                    style={{ width: `${pct}%`, backgroundColor: ev?.colors?.primary || '#A78BFA' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Top cartes vues */}
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                        <h2 className="font-serif text-[15px] font-semibold mb-5 text-white/70">Top cartes vues</h2>
                                        <div className="space-y-3">
                                            {stats.topViewedCards.length === 0 && (
                                                <p className="text-[12px] text-white/25">Aucune vue pour l&apos;instant</p>
                                            )}
                                            {stats.topViewedCards.map((card, i) => (
                                                <div key={card.id} className="flex items-center gap-3 group">
                                                    <span className="text-[11px] font-mono text-white/20 w-4">{i + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-medium text-white/60 truncate">{card.name}</p>
                                                        <p className="text-[10px] text-white/25">{EVENT_LABELS[card.event_type as EventType] || card.event_type}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1 text-[11px] text-white/35">
                                                            <Eye size={10} />
                                                            {card.views_count}
                                                        </span>
                                                        <a
                                                            href={`/preview/${card.share_token}`}
                                                            target="_blank"
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
                                                        >
                                                            <ExternalLink size={11} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cartes récentes */}
                                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                    <h2 className="font-serif text-[15px] font-semibold mb-5 text-white/70">Activité récente</h2>
                                    <div className="space-y-2">
                                        {stats.recentCards.map(card => (
                                            <div key={card.id} className="flex items-center gap-4 py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                                                <div
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: EVENTS[card.event_type as EventType]?.colors?.primary || '#fff' }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[12px] font-medium text-white/60 truncate">{card.name}</span>
                                                </div>
                                                <span className="text-[10px] text-white/25 hidden sm:block">
                                                    {EVENT_LABELS[card.event_type as EventType] || card.event_type}
                                                </span>
                                                <span className="text-[10px] text-white/20">
                                                    {new Date(card.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <a
                                                    href={`/preview/${card.share_token}`}
                                                    target="_blank"
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
                                                >
                                                    <ExternalLink size={11} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}

                {/* ── Tab : Utilisateurs ── */}
                {tab === 'users' && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={14} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un utilisateur..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] focus:border-white/20 outline-none text-[13px] text-white placeholder:text-white/25 transition-all"
                                />
                            </div>
                            <span className="text-[12px] text-white/30">{filteredUsers.length} utilisateurs</span>
                        </div>

                        {usersLoading ? (
                            <div className="space-y-3">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredUsers.map(u => (
                                    <div key={u.id} className="group flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:border-white/10 transition-all">
                                        {/* Avatar initiale */}
                                        <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[13px] font-semibold text-white/60 shrink-0">
                                            {u.name?.[0]?.toUpperCase() || '?'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-medium text-white/75 truncate">{u.email}</span>
                                                {u.is_admin && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                                                        ADMIN
                                                    </span>
                                                )}
                                                {u.provider === 'google' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/15">
                                                        Google
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[11px] text-white/25">{u.card_count} carte{u.card_count > 1 ? 's' : ''}</span>
                                                <span className="text-[10px] text-white/15">
                                                    Inscrit {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        {!u.is_admin && (
                                            <button
                                                onClick={() => setConfirmDelete({ type: 'user', id: u.id, label: u.email })}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/[0.08] text-red-400 hover:bg-red-500/15 transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div className="py-20 text-center text-[13px] text-white/25">Aucun utilisateur trouvé</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab : Cartes ── */}
                {tab === 'cards' && (
                    <div>
                        {/* Filtres événement */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <Pill active={!eventFilter} onClick={() => { setEventFilter(null); setPage(1); }}>Toutes</Pill>
                            {Object.keys(EVENTS).map(ev => (
                                <Pill key={ev} active={eventFilter === ev} onClick={() => { setEventFilter(ev); setPage(1); }}>
                                    {EVENTS[ev as EventType].name.fr}
                                </Pill>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[12px] text-white/30">{totalCards} cartes au total</span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[12px] text-white/40 hover:text-white disabled:opacity-30 transition-all"
                                >
                                    ←
                                </button>
                                <span className="text-[12px] text-white/35 px-2">Page {page} / {Math.ceil(totalCards / 20) || 1}</span>
                                <button
                                    disabled={page >= Math.ceil(totalCards / 20)}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[12px] text-white/40 hover:text-white disabled:opacity-30 transition-all"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        {cardsLoading ? (
                            <div className="space-y-2">
                                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {cards.map(card => {
                                    const ev = EVENTS[card.event_type as EventType];
                                    return (
                                        <div key={card.id} className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.035] transition-all">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev?.colors?.primary || '#888' }} />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[13px] font-medium text-white/65 truncate block">{card.name}</span>
                                            </div>
                                            <span className="hidden sm:block text-[11px] text-white/25 shrink-0">{ev?.name?.fr || card.event_type}</span>
                                            <span className="flex items-center gap-1 text-[11px] text-white/25 shrink-0">
                                                <Eye size={10} />
                                                {card.views_count || 0}
                                            </span>
                                            <span className="hidden md:block text-[10px] text-white/20 shrink-0">
                                                {new Date(card.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                <a
                                                    href={`/preview/${card.share_token}`}
                                                    target="_blank"
                                                    className="p-1.5 rounded-lg bg-white/[0.06] text-white/40 hover:text-white transition-all"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                                <button
                                                    onClick={() => setConfirmDelete({ type: 'card', id: card.id, label: card.name })}
                                                    className="p-1.5 rounded-lg bg-red-500/[0.08] text-red-400 hover:bg-red-500/15 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {cards.length === 0 && (
                                    <div className="py-20 text-center text-[13px] text-white/25">Aucune carte pour ce filtre</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modale de confirmation de suppression ── */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1A1018] rounded-2xl border border-red-500/15 p-7 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-start gap-4 mb-5">
                                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 shrink-0 mt-0.5">
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-[16px] font-semibold mb-1">Confirmer la suppression</h3>
                                    <p className="text-[12px] text-white/40 leading-relaxed">
                                        {confirmDelete.type === 'user'
                                            ? `Supprimer l'utilisateur "${confirmDelete.label}" et toutes ses cartes ?`
                                            : `Supprimer la carte "${confirmDelete.label}" ?`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (confirmDelete.type === 'user') await deleteUser(confirmDelete.id);
                                        else await deleteCard(confirmDelete.id);
                                        setConfirmDelete(null);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors"
                                >
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/[0.04] text-white/50 text-[13px] hover:bg-white/[0.07] transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Toast notifications ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: 16, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 16, opacity: 0, scale: 0.95 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
                        style={{ backgroundColor: toast.ok ? '#18181b' : '#3f1215', border: `1px solid ${toast.ok ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)'}` }}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${toast.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
                            {toast.ok ? <Check size={12} strokeWidth={3} className="text-white" /> : <X size={12} strokeWidth={3} className="text-white" />}
                        </div>
                        <span className="text-[13px] font-medium text-white/80">{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
