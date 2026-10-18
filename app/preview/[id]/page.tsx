'use client';

import React, {useEffect, useState, useRef, useMemo} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';



// Components
import Button from '@/components/ui/Button';
import ShareButtons from '@/components/ShareButtons';

// Utils & Icons
import {CardData, EVENT_LABELS} from '@/lib/types';
import { generateShareUrl } from '@/lib/utils';
import {
    ArrowLeft, Download, Share2, Info, User, Layout,
    Lightbulb, PlusCircle, Loader2, AlertCircle,
    Printer, Film, Share, Sparkles
} from 'lucide-react';
import { CardRenderer } from "@/components/cards/card-renderer";
import GiftReveal from "@/components/GiftReveal";
import { useAuth } from "@/lib/auth/AuthContext";
import { normalizeCardDesign } from "@/lib/cards/normalize-card-design";
import html2canvas from "html2canvas";
import {domToCanvas} from "modern-screenshot";
import {supabase} from "@/lib/supabaseClient";


interface PageProps {
    params: { id: string };
}

export default function PreviewPage() {
    const params = useParams();
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);
    const giftRevealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { user, loading: authLoading } = useAuth();
    const reduceMotion = useReducedMotion();

    // States
    const [card, setCard] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [giftOpened, setGiftOpened] = useState(false);

    const cardToken = params.id;

    useEffect(() => () => {
        if (giftRevealTimer.current) clearTimeout(giftRevealTimer.current);
    }, []);

    useEffect(() => {
        const recordView = async () => {
            if (!cardToken) return;

            try {
                await supabase.rpc('increment_card_views', { t_token: cardToken });
            } catch (error) {
                console.error("Erreur lors de l'incrémentation des vues:", error);
            }
        };

        recordView();
    }, [cardToken]);

    const design = useMemo(
        () => card
            ? normalizeCardDesign(card.poem, {
                name: card.name,
                eventType: card.event_type,
                language: card.language,
            })
            : null,
        [card]
    );

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await fetch(`/api/create-card?token=${params.id}`,{
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Card not found');
                const data = await res.json();


                setCard(data.card);
            } catch (err) {
                setError('Card not found');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchCard();
    }, [params.id]);

    const handleExportVideo = async () => {
        if (!cardRef.current) return;

        try {
            setIsExporting(true);
            setExportProgress(0);

            // 1. Canvas de sortie configuré pour la HD
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', {
                alpha: false, // Optimisation : pas de transparence pour gagner du temps
                willReadFrequently: true
            });

            // Scale 2 = Haute Définition (Nettoie les textes et les images)
            const scale = 2;

            // Capture du premier frame pour caler les dimensions HD
            const firstFrame = await domToCanvas(cardRef.current, { scale });
            canvas.width = firstFrame.width;
            canvas.height = firstFrame.height;

            // 2. Stream à 24 FPS (Standard cinéma, plus rapide à générer que 30 ou 60)
            const stream = canvas.captureStream(24);
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 8000000 // 8 Mbps pour une qualité HD nette
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${card?.name || 'carte'}_HD.webm`;
                a.click();
                setIsExporting(false);
            };

            recorder.start();

            // Change 15000 (15s) par 60000 si tu veux vraiment 1 minute
            const duration = 15000;
            const startTime = Date.now();

            const captureFrame = async () => {
                const elapsed = Date.now() - startTime;

                if (elapsed < duration && recorder.state === 'recording') {
                    try {
                        // domToCanvas est l'opération la plus lourde
                        const frame = await domToCanvas(cardRef.current!, {
                            scale,
                            backgroundColor: '#120A0D',
                            // On évite de recalculer les styles lourds à chaque frame
                        });

                        ctx?.drawImage(frame, 0, 0);

                        setExportProgress(Math.round((elapsed / duration) * 100));

                        // Laisser le navigateur respirer pour ne pas bloquer l'UI
                        requestAnimationFrame(captureFrame);
                    } catch (e) {
                        requestAnimationFrame(captureFrame);
                    }
                } else {
                    recorder.stop();
                }
            };

            captureFrame();

        } catch (err) {
            console.error("Erreur HD Export:", err);
            setIsExporting(false);
        }
    };

    const handleExportPNG = async () => {
        if (!cardRef.current) return;

        try {
            setIsExporting(true); // On affiche l'overlay de chargement

            // On capture l'image en haute résolution
            const canvas = await domToCanvas(cardRef.current, {
                scale: 3, // Qualité supérieure pour l'image fixe
                backgroundColor: '#120A0D'
            });

            // Conversion en lien de téléchargement
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${card?.name || 'carte'}.png`;
            link.href = dataUrl;
            link.click();

        } catch (err) {
            console.error("Erreur lors de l'export PNG:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleWhatsAppShare = () => {
        const eventName = card ? EVENT_LABELS[card.event_type] : 'vœux';

        const text = card?.language === 'fr'
            ? `Regarde la carte de ${eventName} magique que j'ai créée pour ${card.name} ! ✨`
            : `Look at the magic ${card?.event_type} card I created for ${card?.name}! ✨`;

        const url = encodeURIComponent(generateShareUrl(card?.share_token || ''));
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1A0F14] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-christmas-red animate-spin" />
                <p className="text-gray-400 animate-pulse font-medium tracking-widest uppercase text-xs">Magie en cours...</p>
            </div>
        );
    }

    if (error || !card) {
        return (
            <div className="min-h-screen bg-[#1A0F14] flex items-center justify-center p-6">
                <div className="text-center max-w-md p-10 rounded-[3rem] bg-white/5 border border-white/10">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-4 italic font-serif">Carte égarée</h1>
                    <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-2xl h-14 font-bold" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au village
                    </Button>
                </div>
            </div>
        );
    }

    const shareUrl = generateShareUrl(card.share_token);
    const cardOwnerId = (card as CardData & { user_id?: string }).user_id;
    const isCardOwner = Boolean(user && cardOwnerId === user.id);

    if (authLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A0F14]">
                <Loader2 className="h-10 w-10 animate-spin text-christmas-gold" />
            </div>
        );
    }

    if (!isCardOwner && !giftOpened && design) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#1A0F14] px-6 py-10">
                <div className="fixed inset-0 pointer-events-none" aria-hidden>
                    <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-red-600/10 blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-[120px]" />
                </div>
                <div className="relative w-full max-w-[420px]">
                    <GiftReveal
                        palette={design.palette}
                        title={card.language === 'fr' ? `Un cadeau pour ${card.name}` : `A gift for ${card.name}`}
                        hint={card.language === 'fr' ? 'Touchez le cadeau pour l’ouvrir' : 'Tap the gift to open it'}
                        onOpen={() => {
                            giftRevealTimer.current = setTimeout(
                                () => setGiftOpened(true),
                                reduceMotion ? 0 : 1250
                            );
                        }}
                    >
                        <div className="h-full w-full overflow-hidden rounded-2xl shadow-2xl">
                            <CardRenderer
                                design={design}
                                imageUrl={card.image_url || undefined}
                            />
                        </div>
                    </GiftReveal>
                </div>
            </div>
        );
    }


    return (
        <motion.div
            initial={!isCardOwner && giftOpened ? { opacity: 0, scale: 0.97, y: 24 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen bg-[#1A0F14] text-white pb-20 relative overflow-x-hidden mt-20"
        >



            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4 portrait; /* Force le format A4 */
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .print-section, .print-section * {
                        visibility: visible;
                    }
                    .print-section {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 210mm !important;
                        height: 297mm !important;
                        display: flex !important;
                        align-items: center;
                        justify-content: center;
                        background: white !important;
                        z-index: 9999;
                    }
                    /* On force la carte à prendre 95% de la largeur A4 */
                    .print-section > div {
                        width: 200mm !important;
                        height: auto !important;
                        border: none !important;
                        box-shadow: none !important;
                        transform: none !important;
                    }
                }
            `}</style>


            {/* Background Glows */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px]" />
            </div>

            {/* Modal d'exportation GIF */}
            <AnimatePresence>
                {isExporting && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <div className="relative mb-8">
                            <div className="w-24 h-24 border-4 border-christmas-gold/20 rounded-full flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-christmas-gold animate-spin" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 text-white animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 tracking-tighter">Capture du PNG...</h2>
                        <p className="text-gray-400 font-mono tracking-widest uppercase text-xs">{exportProgress}% terminé</p>
                        <div className="w-64 h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
                            <motion.div
                                className="h-full bg-christmas-gold"
                                initial={{ width: 0 }}
                                animate={{ width: `${exportProgress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-6 pt-12">
                {/* Header Navigation */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-xs font-bold uppercase tracking-[0.3em] mb-4">
                            <ArrowLeft size={14} /> Recommencer
                        </button>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic font-serif leading-none">
                            {card.language === 'fr' ? 'Prêt à offrir !' : 'Gift Ready!'}
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md"
                            onClick={() => window.print()}
                        >
                            <Printer className="w-4 h-4 mr-2" /> {card.language === 'fr' ? 'Imprimer' : 'Print'}
                        </Button>
                        <Button
                            className="rounded-2xl  text-black hover:bg-gray-200 shadow-xl shadow-white/5 font-bold"
                            onClick={handleExportVideo}
                            disabled={isExporting}
                        >
                            <Film className="w-4 h-4 mr-2" />
                            {card.language === 'fr' ? 'Sauver en WebM' : 'Save as WebM'}
                        </Button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Card Preview */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7">
                        <div className="sticky top-28 mx-auto w-full max-w-[460px]">
                            {design && (
                                <GiftReveal
                                    palette={design.palette}
                                    defaultOpen={isCardOwner || giftOpened}
                                    title={card.language === 'fr' ? `Un cadeau pour ${card.name}` : `A gift for ${card.name}`}
                                    hint={card.language === 'fr' ? 'Touchez le cadeau pour l’ouvrir' : 'Tap the gift to open it'}
                                >
                                    <div ref={cardRef} className="print-section">
                                        <CardRenderer
                                            design={design}
                                            imageUrl={card.image_url || undefined}
                                        />
                                    </div>
                                </GiftReveal>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: Actions Side Panel */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 space-y-6">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-10 space-y-10 shadow-3xl">
                            {/* Share Section */}
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-3 mb-8 tracking-tighter italic">
                                    <Share2 size={24} className="text-christmas-gold" />
                                    {card.language === 'fr' ? 'Partager l\'émotion' : 'Share the love'}
                                </h2>

                                <div className="space-y-4">
                                    <ShareButtons url={shareUrl} name={card.name} language={card.language} />

                                    <Button
                                        className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold flex items-center justify-center gap-3 shadow-lg transition-all"
                                        onClick={handleExportPNG}
                                        disabled={isExporting}
                                    >
                                        <Download className="w-5 h-5" />
                                        {card.language === 'fr' ? 'Enregistrer en PNG' : 'Save as PNG'}
                                    </Button>
                                </div>
                            </div>

                            {/* Details Table */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Modèle</p>
                                        <p className="font-serif italic text-christmas-gold">{design?.concept}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Destinataire</p>
                                        <p className="font-bold truncate">{card.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tip */}
                            <div className="bg-gradient-to-br from-christmas-gold/10 to-transparent rounded-[2rem] p-6 border border-christmas-gold/20 relative group overflow-hidden">
                                <Lightbulb className="absolute -right-4 -bottom-4 w-24 h-24 text-christmas-gold/5 group-hover:rotate-12 transition-transform duration-500" />
                                <h3 className="font-black text-christmas-gold text-sm mb-2 flex items-center gap-2">
                                    Secret de fabrication
                                </h3>
                                <p className="text-gray-400 text-xs leading-relaxed relative z-10">
                                    {card.language === 'fr'
                                        ? "Saviez-vous que vous pouvez aussi imprimer cette carte ? Elle est parfaitement formatée pour un cadre photo standard !"
                                        : "Did you know you can also print this card? It's perfectly formatted for a standard photo frame!"}
                                </p>
                            </div>

                            {/* Action Button */}
                            <Button
                                onClick={() => router.push('/create')}
                                className="w-full h-16 rounded-[1.5rem] text-white text-black font-black text-lg hover:bg-christmas-gold hover:text-black transition-all flex items-center justify-center gap-2 group"
                            >
                                <PlusCircle className="group-hover:rotate-90 transition-transform" />
                                {card.language === 'fr' ? 'Créer une autre carte' : 'Create another card'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}