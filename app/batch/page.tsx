
'use client';

import React, {useState,Suspense} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, Users,
    FileImage, Zap,
    Briefcase, CheckCircle2, Send, Eye,
     Download, X, Plus, Check, Loader2
} from 'lucide-react';

import {BatchContact, BatchGenerationResult, EventType, Language} from "@/lib/types";
import {batchGenerateCards} from "@/lib/Services/batchService";
import { EVENTS } from '@/lib/events';
import { useSearchParams } from 'next/navigation';
import {useAuth} from "@/lib/auth/AuthContext";
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { CardRenderer } from '@/components/cards/card-renderer';
import type { CardDesign } from '@/lib/schemas/card-design';
import { normalizeCardDesign } from '@/lib/cards/normalize-card-design';

function BatchContent() {


    const searchParams = useSearchParams();

    const eventId = (searchParams.get('event') as EventType) || 'newyear';
    const currentEvent = EVENTS[eventId] || EVENTS.newyear;
    const primaryColor = currentEvent.colors.primary;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSharingAll, setIsSharingAll] = useState(false);
    const [layout, setLayout] = useState<CardDesign['layout']>('luxury-stationery');
    const [contacts, setContacts] = useState<BatchContact[]>([]);
    const language: Language = 'fr';

    const eventType = eventId;
    const { user } = useAuth();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
    const [results, setResults] = useState<BatchGenerationResult[]>([]);
    const [businessName, setBusinessName] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const previewDesign: CardDesign = {
        id: layout === 'editorial-poster' ? 'design-b' : 'design-a',
        concept: businessName || (language === 'fr' ? 'Votre entreprise' : 'Your business'),
        layout,
        palette: {
            background: layout === 'editorial-poster' ? '#2D1C21' : '#F7F3EE',
            primary: currentEvent.colors.primary,
            accent: currentEvent.colors.accent,
            text: layout === 'editorial-poster' ? '#F8FAFC' : '#1F2937',
        },
        typography: {
            headingStyle: layout === 'editorial-poster' ? 'display' : 'serif',
            bodyStyle: layout === 'editorial-poster' ? 'sans' : 'serif',
        },
        decorations: [{ type: layout === 'editorial-poster' ? 'stars' : 'frame', position: 'corners' }],
        content: {
            title: contacts[0]?.name || (language === 'fr' ? 'Nom du client' : 'Client name'),
            message: language === 'fr'
                ? 'Un message chaleureux et personnalisé pour chacun de vos contacts.'
                : 'A warm, personalized greeting for each of your contacts.',
            signature: businessName || (language === 'fr' ? 'Avec nos meilleurs vœux' : 'Best wishes'),
        },
    };

    const handleFileUpload = (file: File | null): void => {
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            console.error('Unsupported file type');
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text = reader.result as string;
                const lines = text.split(/\r?\n/).filter(Boolean);

                if (lines.length < 2) {
                    throw new Error('CSV is empty');
                }

                const headers = lines[0].split(',').map(h => h.trim());


                const nameIndex = headers.indexOf('name');
                const genderIndex = headers.indexOf('gender');
                const emailIndex = headers.indexOf('email');
                const phoneIndex = headers.indexOf('phone');

                if (nameIndex === -1 || genderIndex === -1) {
                    throw new Error('Missing required columns');
                }

                const contacts: BatchContact[] = lines
                    .slice(1)
                    .map((line): BatchContact | null => {
                        const cols = line.split(',').map(c => c.trim());

                        const name = cols[nameIndex];
                        const rawGender = cols[genderIndex]?.toLowerCase().trim();

                        const genderMap: Record<string, BatchContact['gender']> = {
                            boy: 'boy',
                            male: 'boy',
                            homme: 'boy',

                            girl: 'girl',
                            female: 'girl',
                            femme: 'girl',

                            neutral: 'neutral',
                            autre: 'neutral',
                        };

                        const gender = genderMap[rawGender];

                        if (!name || !gender) {
                            return null;
                        }

                        return {
                            name,
                            gender,
                            email: emailIndex !== -1 ? cols[emailIndex] : undefined,
                            phone: phoneIndex !== -1 ? cols[phoneIndex] : undefined,
                        };
                    })
                    .filter((c): c is BatchContact => c !== null);


                if (contacts.length === 0) {
                    throw new Error('No valid contacts found');
                }

                setContacts(contacts);
                setStep(2);

            } catch (error) {
                console.error('File parsing error:', error);
            }
        };

        reader.onerror = () => {
            console.error('File reading failed');
        };

        reader.readAsText(file);
    };


    const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleGenerate = async (): Promise<void> => {
        if (!contacts.length) return;

        setLoading(true);

        try {
            const results = await batchGenerateCards({
                contacts,
                language,
                layout,
                eventType,
                logoUrl: logoUrl ?? undefined,
                businessName: businessName,
                userId: user?.id,
            });

            setResults(results);
            setStep(3);

        } catch (error) {
            console.error('Generation error:', error);

            setResults(
                contacts.map(contact => ({
                    contact,
                    success: false,
                    error: 'Generation failed',
                }))
            );
        } finally {
            setLoading(false);
        }
    };



    const toggleSelectAll = () => {
        if (selectedContacts.size === results.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(results.map((_, i) => i)));
        }
    };

    const toggleContact = (index: number): void => {
        setSelectedContacts(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleDownloadCard = async (result: BatchGenerationResult, index: number) => {
        const element = document.getElementById(`card-capture-${index}`);
        if (!element || !result.success) return;

        try {
            const dataUrl = await toPng(element, { pixelRatio: 2, cacheBust: true });
            const link = document.createElement('a');
            link.download = `carte-${result.contact.name.replace(/\s+/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Erreur capture PNG:", err);
        }
    };

    const handleDownloadAll = async () => {
        const toDownload = selectedContacts.size > 0
            ? results.filter((_, i) => selectedContacts.has(i) && _.success)
            : results.filter(r => r.success);

        if (toDownload.length === 0) return;

        setIsExporting(true);
        setExportProgress(0);
        const zip = new JSZip();

        try {
            for (let i = 0; i < toDownload.length; i++) {
                const res = toDownload[i];
                // On retrouve l'index original pour cibler le bon ID de capture
                const originalIdx = results.findIndex(r => r === res);
                const element = document.getElementById(`card-capture-${originalIdx}`);

                if (element) {
                    const dataUrl = await toPng(element, { pixelRatio: 1.5 });
                    const base64Data = dataUrl.split(',')[1];
                    zip.file(`${res.contact.name.replace(/\s+/g, '_')}.png`, base64Data, { base64: true });
                }
                setExportProgress(Math.round(((i + 1) / toDownload.length) * 100));
            }

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cartes-batch-${new Date().getTime()}.zip`;
            link.click();
        } catch (err) {
            console.error("Erreur ZIP:", err);
        } finally {
            setIsExporting(false);
        }
    };

// 3. Partage Batch WhatsApp
    const handleShareAll = async () => {
        setIsSharingAll(true);
        const toShare = selectedContacts.size > 0
            ? results.filter((_, i) => selectedContacts.has(i) && _.success)
            : results.filter(r => r.success);

        for (const res of toShare) {
            const phone = res.contact.phone ? res.contact.phone.replace(/\D/g, '') : '';
            const url = `${window.location.origin}/preview/${res.card?.share_token}`;
            const message = encodeURIComponent(
                `✨ Bonjour ${res.contact.name} !\nVoici une petite attention pour vous : ${url}`
            );

            if (phone) {
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        setIsSharingAll(false);
        setShowSuccessModal(true);
    };


    return (
        <div className="min-h-screen bg-[#1A0F14] text-white pt-24 pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header avec progression */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter italic mb-2">
                                BATCH <span style={{ color: primaryColor }}>PRO</span>
                            </h1>
                            {/*<p className="text-gray-500 text-sm font-medium">*/}
                            {/*    Générez et partagez vos cartes en masse - {currentEvent.name}*/}
                            {/*</p>*/}
                        </div>

                        {contacts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="hidden md:flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10"
                            >
                                <Users size={20} style={{ color: primaryColor }} />
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Contacts</p>
                                    <p className="text-2xl font-black">{contacts.length}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Stepper */}
                    <div className="relative flex items-center justify-between max-w-2xl">
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
                            <motion.div
                                className="h-full"
                                style={{ backgroundColor: primaryColor }}
                                initial={{ width: '0%' }}
                                animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {[
                            { num: 1, label: 'Import', icon: UploadCloud },
                            { num: 2, label: 'Configuration', icon: Zap },
                            { num: 3, label: 'Résultats', icon: CheckCircle2 }
                        ].map((s) => (
                            <div key={s.num} className="relative flex flex-col items-center gap-2 z-10">
                                <motion.div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                                        step >= s.num
                                            ? 'text-white shadow-lg shadow-purple-500/50'
                                            : 'bg-white/5 text-gray-500 border border-white/10'
                                    }`}
                                    style={step >= s.num ? { backgroundColor: primaryColor } : {}}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {step > s.num ? <Check size={18} /> : <s.icon size={18} />}
                                </motion.div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-white' : 'text-gray-600'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: UPLOAD */}
                    {step === 1 && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div
                                className={`relative group flex flex-col items-center justify-center w-full h-[450px] bg-white/[0.02] border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all duration-300 ${
                                    dragActive
                                        ? 'border-white/40 bg-white/[0.05] scale-[1.02]'
                                        : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />

                                <motion.div
                                    animate={{ y: dragActive ? -10 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center"
                                >
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
                                        style={{ backgroundColor: dragActive ? primaryColor : 'rgba(255,255,255,0.05)' }}
                                    >
                                        <UploadCloud size={40} className={dragActive ? 'text-white' : 'text-gray-400'} />
                                    </div>

                                    <h3 className="text-2xl font-black italic mb-3">
                                        {dragActive ? 'Déposez votre fichier' : 'Importez vos contacts'}
                                    </h3>
                                    <p className="text-gray-500 font-medium mb-6 text-center max-w-md">
                                        Glissez-déposez votre fichier CSV ou cliquez pour parcourir
                                    </p>

                                    <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                                        <FileImage size={18} className="text-gray-500" />
                                        <span className="text-sm font-bold text-gray-400">Format accepté: .CSV</span>
                                    </div>
                                </motion.div>

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                                    <p className="text-xs text-gray-500 font-bold">
                                        Colonnes requises: <span className="text-white">name, gender, email, phone</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PREVIEW - 🔥 AVEC VRAIES MINIATURES */}
                    {step === 2 && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid lg:grid-cols-5 gap-8"
                        >
                            {/* Configuration sidebar */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <h3 className="text-xl font-black italic mb-6 flex items-center gap-3">
                                        <Zap size={24} style={{ color: primaryColor }} />
                                        Configuration
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">
                                                Style de carte
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {([
                                                    { id: 'luxury-stationery', label: 'Papeterie de luxe' },
                                                    { id: 'editorial-poster', label: 'Affiche éditoriale' },
                                                ] as const).map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => setLayout(option.id)}
                                                        className={`rounded-xl border-2 p-3 text-sm font-bold transition-all ${
                                                            layout === option.id
                                                                ? 'border-white/40 bg-white/10 shadow-lg'
                                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                        }`}
                                                    >
                                                        {option.label}
                                                        {layout === option.id && (
                                                            <Check className="mx-auto mt-2" size={16} style={{ color: primaryColor }} />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>


                                        {/* Champ Nom de l'Entreprise */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                                <Briefcase size={14} style={{ color: primaryColor }} />
                                                Nom de votre entreprise
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Ma Super Entreprise"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none transition-all font-bold text-sm"
                                            />
                                        </div>

                                        {/* Logo upload */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">
                                                Logo entreprise
                                            </label>
                                            {!logoUrl ? (
                                                <label className="flex items-center justify-center p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all group">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setLogoUrl(URL.createObjectURL(file));
                                                        }}
                                                    />
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Plus size={24} className="text-gray-500 group-hover:text-white transition-colors" />
                                                        <span className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                                                            Ajouter un logo
                                                        </span>
                                                    </div>
                                                </label>
                                            ) : (
                                                <div className="relative p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <img src={logoUrl} alt="Logo" className="w-full h-24 object-contain rounded-lg" />
                                                    <button
                                                        onClick={() => setLogoUrl(null)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Contact list preview */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">
                                                Destinataires ({contacts.length})
                                            </label>
                                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {contacts.slice(0, 5).map((contact, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                                                            {contact.name[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate">{contact.name}</p>
                                                            <p className="text-[10px] text-gray-500 truncate font-bold uppercase tracking-tighter">
                                                                {contact.email || contact.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full h-14 mt-8 rounded-xl font-black uppercase italic text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                        style={{
                                            backgroundColor: primaryColor,
                                            boxShadow: `0 10px 30px ${primaryColor}30`
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                Génération en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} />
                                                Générer {contacts.length} cartes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Preview area GRAND FORMAT */}
                            <div className="lg:col-span-3 flex flex-col items-center justify-start pt-10">
                                <div className="mb-8 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                                    <Eye size={16} style={{ color: primaryColor }} />
                                    Rendu Final Instantané
                                </div>

                                <motion.div
                                    key={`${eventType}-${layout}-${logoUrl}`}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="relative"
                                >
                                    <div
                                        className="absolute -inset-10 blur-[100px] rounded-full opacity-20 transition-colors duration-500"
                                        style={{ backgroundColor: primaryColor }}
                                    />

                                    <div className="relative shadow-[0_50px_100px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden scale-[0.65] sm:scale-[0.75] lg:scale-[0.85] xl:scale-95 origin-top border border-white/10">
                                        <CardRenderer design={previewDesign} imageUrl={logoUrl || undefined} />
                                    </div>

                                    <p className="mt-8 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-50">
                                        Exemple de rendu pour : {contacts[0]?.name || "votre client"}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                    {/* STEP 3: RESULTS */}
                    {step === 3 && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Modale de Progression Export (ZIP/PNG) */}
                            <AnimatePresence>
                                {isExporting && (
                                    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                                            <div className="relative w-24 h-24 mx-auto mb-6">
                                                <Loader2 className="w-24 h-24 text-white/20 animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Download className="text-white animate-bounce" />
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-black italic mb-2">PRÉPARATION DU ZIP</h2>
                                            <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">{exportProgress}% TERMINÉ</p>
                                            <div className="w-64 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-white"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${exportProgress}%` }}
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Action bar */}
                            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic mb-1">
                                                {results.filter(r => r.success).length} cartes générées
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {selectedContacts.size > 0
                                                    ? `${selectedContacts.size} sélectionnée(s)`
                                                    : 'Toutes les cartes sont prêtes à être partagées'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                                        <button
                                            onClick={handleDownloadAll}
                                            disabled={isExporting}
                                            className="flex-1 lg:flex-none h-12 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                            ZIP (PNG) {selectedContacts.size > 0 ? 'Sélection' : 'Tout'}
                                        </button>

                                        <button
                                            onClick={handleShareAll}
                                            disabled={isSharingAll}
                                            className="flex-1 lg:flex-none h-12 px-8 rounded-xl font-black uppercase italic text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 shadow-xl"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {isSharingAll ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Send size={18} /> WhatsApp Batch</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tableau des résultats */}
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="border-b border-white/10 bg-white/[0.02]">
                                        <th className="p-4 text-left w-12">
                                            <button onClick={toggleSelectAll} className="w-5 h-5 rounded border border-white/20 flex items-center justify-center">
                                                {selectedContacts.size === results.length && <Check size={12} />}
                                            </button>
                                        </th>
                                        <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Destinataire</th>
                                        <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Statut</th>
                                        <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {results.map((result, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleContact(idx)}
                                                    className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                                                        selectedContacts.has(idx) ? 'bg-purple-500 border-purple-500' : 'border-white/20'
                                                    }`}
                                                >
                                                    {selectedContacts.has(idx) && <Check size={12} />}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                                                        {result.contact.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{result.contact.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold">{result.contact.phone || result.contact.email}</p>
                                                    </div>
                                                </div>


                                                <div className="fixed -left-[2000px] top-0 pointer-events-none">
                                                    <div id={`card-capture-${idx}`} style={{ width: '600px', height: '800px' }}>
                                                        <CardRenderer
                                                            design={normalizeCardDesign(result.card?.poem, {
                                                                name: result.contact.name,
                                                                eventType,
                                                                language,
                                                            })}
                                                            imageUrl={logoUrl || undefined}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {result.success ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase">
                                        <CheckCircle2 size={12} /> Prêt
                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-red-500 uppercase">Erreur</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => result.card?.share_token && window.open(`/preview/${result.card.share_token}`, '_blank')}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                                        title="Voir la page"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadCard(result, idx)}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                                        title="Télécharger PNG"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> Créer un nouveau batch
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showSuccessModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#2D1C21] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl"
                            >
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={40} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-black italic mb-2">OPÉRATION RÉUSSIE !</h3>
                                <p className="text-gray-400 font-medium mb-8">
                                    Toutes les fenêtres WhatsApp ont été préparées pour vos contacts.
                                </p>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Génial, merci !
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isExporting && (
                        <motion.div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                            <h2 className="text-xl font-bold">Génération du pack ZIP...</h2>
                            <p className="text-gray-500">{exportProgress}%</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
            `}</style>
        </div>
    );
}

export default function BatchPage() {
    return (

        <Suspense fallback={
            <div className="min-h-screen bg-[#1A0F14] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
                chargement...
            </div>
        }>
            <BatchContent />
        </Suspense>
    );
}