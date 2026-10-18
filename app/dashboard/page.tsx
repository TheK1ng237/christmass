'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, List, Plus, Search, Trash2, Send, Eye,
    ExternalLink, Check, Calendar, Zap, ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { EVENTS } from "@/lib/events";
import { useSearchParams } from "next/navigation";
import {
    CardRow,
    CardStats,
    EVENT_LABELS,
    EventType,
    CardData
} from "@/lib/types";

import { CardRenderer } from '@/components/cards/card-renderer';
import { normalizeCardDesign } from '@/lib/cards/normalize-card-design';
import { supabase } from "@/lib/supabaseClient";
import { useEvent } from "@/app/context/EventContext";

const eventLabels = EVENT_LABELS;

function DashboardContent() {
    const searchParams = useSearchParams();
    const { eventId, setEventId } = useEvent();
    const currentEvent = useMemo(() => EVENTS[eventId], [eventId]);
    const [cards, setCards] = useState<CardRow[]>([]);
    const [filteredCards, setFilteredCards] = useState<CardRow[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);

    const [stats, setStats] = useState<CardStats>({
        total: 0,
        totalViews: 0,
        events: {} as Record<EventType, number>,
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        updateScrollButtons();
        window.addEventListener('resize', updateScrollButtons);
        return () => window.removeEventListener('resize', updateScrollButtons);
    }, []);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -250 : 250,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => { loadUserCards(); }, []);
    useEffect(() => { filterCards(); }, [searchQuery, selectedEvent, cards]);

    const loadUserCards = async () => {
        setIsLoading(true);
        try {
            const claimResponse = await fetch('/api/cards/claim-guest', { method: 'POST' });
            if (!claimResponse.ok) {
                const claimError = await claimResponse.json();
                throw new Error(claimError.error || 'Impossible de récupérer vos cartes invité.');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const cardsData = data || [];
            setCards(cardsData);

            const totalViews = cardsData.reduce((sum, card) => sum + (card.views_count || 0), 0);
            const eventCounts = cardsData.reduce((acc, card) => {
                acc[card.event_type as EventType] = (acc[card.event_type as EventType] || 0) + 1;
                return acc;
            }, {} as Record<EventType, number>);

            setStats({ total: cardsData.length, totalViews, events: eventCounts });
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterCards = () => {
        let filtered = [...cards];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(card =>
                card.name.toLowerCase().includes(query) ||
                card.poem.toLowerCase().includes(query)
            );
        }
        if (selectedEvent) {
            filtered = filtered.filter(card => card.event_type === selectedEvent);
        }
        setFilteredCards(filtered);
    };

    const validCards: CardData[] = useMemo(
        () => filteredCards.map(c => ({
            ...c,
            event_type: c.event_type as EventType,
            created_at: c.created_at || new Date().toISOString(),
            views_count: c.views_count || 0,
        })),
        [filteredCards]
    );

    const handleShare = async (card: CardData) => {
        const shareUrl = `${window.location.origin}/preview/${card.share_token}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: `Carte ${eventLabels[card.event_type]}`, url: shareUrl });
            } catch { copyToClipboard(shareUrl); }
        } else { copyToClipboard(shareUrl); }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setShowCopyModal(true);
        setTimeout(() => setShowCopyModal(false), 2000);
    };

    const handleDelete = async (cardIds: string[]) => {
        try {
            const { error } = await supabase.from('cards').delete().in('id', cardIds);
            if (error) throw error;
            loadUserCards();
            setSelectedCards(new Set());
            setShowDeleteModal(false);
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const toggleCardSelection = (cardId: string) => {
        const newSelection = new Set(selectedCards);
        newSelection.has(cardId) ? newSelection.delete(cardId) : newSelection.add(cardId);
        setSelectedCards(newSelection);
    };

    return (
        <div className="min-h-screen bg-[#1A0F14] text-white pt-24">

            {/* Subtle ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-1/2 h-1/2 blur-[200px] opacity-[0.07]"
                    style={{ backgroundColor: currentEvent.colors.primary }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-[11px] font-medium text-white/30 tracking-widest uppercase mb-2">Mon espace</p>
                        <h1 className="font-serif text-4xl sm:text-5xl font-semibold">
                            Mes <em className="italic not-italic" style={{ color: currentEvent.colors.accent }}>créations</em>
                        </h1>
                    </div>
                    <a
                        href="/create"
                        style={{ backgroundColor: currentEvent.colors.primary }}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-[13px] font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg"
                    >
                        <Plus size={16} />
                        Nouvelle création
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <StatCard icon={<Zap size={16} />} label="Cartes créées" value={stats.total} color={currentEvent.colors.primary} />
                    <StatCard icon={<Eye size={16} />} label="Vues totales" value={stats.totalViews} color="#60A5FA" />
                    <StatCard icon={<Calendar size={16} />} label="Occasions" value={Object.keys(stats.events).length} color="#34D399" />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} />
                        <input
                            type="text"
                            placeholder="Rechercher un destinataire..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] focus:border-white/20 outline-none transition-all text-[13px] text-white placeholder:text-white/25"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedCards.size > 0 && (
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/[0.08] text-red-400 text-[12px] font-medium border border-red-500/[0.15] hover:bg-red-500/[0.14] transition-all"
                            >
                                <Trash2 size={14} />
                                Supprimer ({selectedCards.size})
                            </button>
                        )}
                        <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/25 hover:text-white/50'}`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/25 hover:text-white/50'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Event filter chips */}
                <div className="relative mb-8">
                    <button
                        onClick={() => handleScroll('left')}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[#1A0F14] border border-white/[0.07] rounded-full transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <ChevronLeft size={16} className="text-white/50" />
                    </button>

                    <div
                        ref={scrollRef}
                        onScroll={updateScrollButtons}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-1"
                    >
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-medium transition-all border ${
                                !selectedEvent
                                    ? 'bg-white text-black border-transparent'
                                    : 'bg-white/[0.04] text-white/40 border-white/[0.07] hover:text-white/70'
                            }`}
                        >
                            Tous
                        </button>

                        {(Object.keys(EVENTS) as Array<EventType>).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedEvent(type)}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition-all border whitespace-nowrap ${
                                    selectedEvent === type
                                        ? 'bg-white text-black border-transparent'
                                        : 'bg-white/[0.04] text-white/40 border-white/[0.07] hover:text-white/70'
                                }`}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: EVENTS[type].colors.primary }}
                                />
                                {EVENTS[type].name.fr}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handleScroll('right')}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[#1A0F14] border border-white/[0.07] rounded-full transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <ChevronRight size={16} className="text-white/50" />
                    </button>
                </div>

                {/* Cards grid/list */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[3/4] rounded-2xl bg-white/[0.03] animate-pulse" />
                        ))}
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="py-40 text-center border border-dashed border-white/[0.07] rounded-2xl">
                        <div className="text-4xl mb-5">✨</div>
                        <h3 className="font-serif text-2xl font-semibold mb-2">Aucune carte trouvée</h3>
                        <p className="text-white/35 text-[14px] mb-8">Il est temps de créer votre premier chef-d&apos;œuvre.</p>
                        <a
                            href="/create"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[13px] font-semibold"
                            style={{ backgroundColor: currentEvent.colors.primary }}
                        >
                            <Plus size={15} />
                            Créer une carte
                        </a>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {validCards.map(card => (
                            <CardGridItem
                                key={card.id}
                                card={card}
                                isSelected={selectedCards.has(card.id)}
                                onSelect={() => toggleCardSelection(card.id)}
                                onShare={() => handleShare(card)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {validCards.map(card => (
                            <CardListItem
                                key={card.id}
                                card={card}
                                isSelected={selectedCards.has(card.id)}
                                onSelect={() => toggleCardSelection(card.id)}
                                onShare={() => handleShare(card)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showDeleteModal && (
                    <DeleteModal
                        count={selectedCards.size}
                        onConfirm={() => handleDelete(Array.from(selectedCards))}
                        onCancel={() => setShowDeleteModal(false)}
                    />
                )}
                {showCopyModal && (
                    <CopySuccessModal onClose={() => setShowCopyModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Sub-components ---

function StatCard({ icon, label, value, color }: { icon: ReactNode, label: string, value: number, color: string }) {
    return (
        <div className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-white/[0.10] transition-all">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" style={{ backgroundColor: color + '15' }} />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="text-3xl font-serif font-semibold mb-1">{value}</div>
                    <div className="text-[11px] text-white/35 font-medium">{label}</div>
                </div>
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: color + '15', color: color }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function CardGridItem({ card, isSelected, onSelect, onShare }: { card: CardData, isSelected: boolean, onSelect: () => void, onShare: () => void }) {
    const event = EVENTS[card.event_type] || EVENTS.christmas;
    const design = normalizeCardDesign(card.poem, {
        name: card.name,
        eventType: card.event_type,
        language: card.language,
    });

    return (
        <motion.div layout className="group flex flex-col gap-3">
            {/* Card container */}
            <div className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                isSelected
                    ? 'border-white/30 shadow-[0_0_0_2px_rgba(255,255,255,0.12)]'
                    : 'border-white/[0.07] hover:border-white/15'
            }`}>

                {/* Checkbox */}
                <button
                    onClick={onSelect}
                    aria-label={isSelected ? `Désélectionner la carte de ${card.name}` : `Sélectionner la carte de ${card.name}`}
                    aria-pressed={isSelected}
                    className={`absolute top-3 left-3 z-30 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center backdrop-blur-sm ${
                        isSelected
                            ? 'border-white bg-white text-black opacity-100'
                            : 'border-white/30 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100'
                    }`}
                >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                </button>

                {/* Badge */}
                <div
                    className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                    style={{ backgroundColor: event.colors.primary + 'D0', backdropFilter: 'blur(6px)' }}
                >
                    {event.name.fr}
                </div>

                {/* La carte — rendue directement, pas de scale hacky */}
                <div className="w-full aspect-[3/4] overflow-hidden">
                    <CardRenderer design={design} imageUrl={card.image_url} />
                </div>

                {/* Actions — barre glissante depuis le bas */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-3 flex gap-2 bg-gradient-to-t from-black/80 via-black/45 to-transparent translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-200 ease-out">
                    <a
                        href={`/preview/${card.share_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ouvrir l’aperçu de la carte de ${card.name}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-white/90 transition-colors"
                    >
                        <ExternalLink size={13} />
                        Ouvrir
                    </a>
                    <button
                        onClick={onShare}
                        aria-label={`Partager la carte de ${card.name}`}
                        className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md"
                        title="Partager"
                    >
                        <Send size={13} />
                    </button>
                </div>
            </div>

            {/* Infos */}
            <div className="flex items-center justify-between px-0.5">
                <span className="text-[12px] font-medium text-white/55 truncate pr-2">{card.name}</span>
                <div className="flex items-center gap-2 shrink-0 text-white/25">
                    <span className="flex items-center gap-1 text-[11px]">
                        <Eye size={11} />
                        {card.views_count || 0}
                    </span>
                    <span className="text-[10px]">
                        {new Date(card.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}


function CardListItem({ card, isSelected, onSelect, onShare }: { card: CardData, isSelected: boolean, onSelect: () => void, onShare: () => void }) {
    const event = EVENTS[card.event_type] || EVENTS.christmas;
    return (
        <motion.div
            layout
            className={`flex items-center gap-5 p-4 rounded-xl border transition-all ${
                isSelected ? 'bg-white/[0.06] border-white/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'
            }`}
        >
            <button
                onClick={onSelect}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected ? 'bg-white border-white text-black' : 'border-white/10 hover:border-white/25'
                }`}
            >
                {isSelected && <Check size={14} />}
            </button>

            <div className="flex-1 min-w-0">
                <h3 className="font-serif text-[14px] font-semibold truncate">{card.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: event.colors.primary }}
                    />
                    <span className="text-[11px] text-white/35">{event.name.fr}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <a
                    href={`/preview/${card.share_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ouvrir l’aperçu de la carte de ${card.name}`}
                    className="p-2.5 rounded-lg bg-white/[0.04] text-white/35 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                    <ExternalLink size={15} />
                </a>
                <button
                    onClick={onShare}
                    aria-label={`Partager la carte de ${card.name}`}
                    className="p-2.5 rounded-lg bg-white/[0.04] text-white/35 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                    <Send size={15} />
                </button>
            </div>
        </motion.div>
    );
}

function DeleteModal({ count, onConfirm, onCancel }: { count: number, onConfirm: () => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-[#0E090C]/85 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1E1318] rounded-2xl border border-red-500/15 p-8 max-w-sm w-full text-center shadow-2xl"
            >
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 mx-auto border border-red-500/15 text-red-400">
                    <Trash2 size={24} />
                </div>
                <h2 className="font-serif text-2xl font-semibold mb-3">
                    Supprimer <span className="text-red-400">{count}</span> {count > 1 ? 'cartes' : 'carte'} ?
                </h2>
                <p className="text-white/35 text-[13px] leading-relaxed mb-8">
                    Cette action est irréversible. Les liens de partage ne fonctionneront plus.
                </p>
                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={onConfirm}
                        className="w-full py-3.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold"
                    >
                        Confirmer la suppression
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-3.5 rounded-xl bg-white/[0.04] text-white/50 text-[13px]"
                    >
                        Annuler
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function CopySuccessModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <motion.div
                initial={{ y: 12, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 12, opacity: 0, scale: 0.95 }}
                className="bg-white text-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto"
            >
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check size={13} strokeWidth={3} />
                </div>
                <span className="text-[13px] font-semibold">Lien copié dans le presse-papier</span>
                <button onClick={onClose} className="ml-2 p-1 hover:bg-black/5 rounded-lg">
                    <X size={13} className="text-black/40" />
                </button>
            </motion.div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#1A0F14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border border-white/10 border-t-white/60 rounded-full animate-spin" />
                    <p className="text-[11px] text-white/30">Chargement...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
