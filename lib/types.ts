// Types pour l'application

import type { LucideProps } from "lucide-react";
import type { CardDesign } from "@/lib/schemas/card-design";

export type Language = 'fr' | 'en';

export type Gender = 'boy' | 'girl' | 'neutral';

export type TemplateId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GeneratedPoem {
    template_id: TemplateId;
    poem: string;
}

export type EventType = 'christmas' | 'newyear' | 'valentine' | 'easter' | 'birthday' | 'mothersday' | 'fathersday';

export const EVENT_LABELS: Record<EventType, string> = {
    christmas: 'Noël',
    newyear: 'Nouvel An',
    valentine: 'Saint Valentin',
    easter: 'Pâques',
    birthday: 'Anniversaire',
    mothersday: 'Fête des Mères',
    fathersday: 'Fête des Pères',
}


export interface EventConfig {
    id: EventType;
    name: {
        fr: string;
        en: string;
    };
    description: {
        fr: string;
        en: string;
    };
    icon: React.ComponentType<LucideProps>;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    available: boolean;
}

export interface CardData {
    business_name?: boolean;
    views_count?: number;
    id: string;
    name: string;
    gender: Gender;
    language: Language;
    event_type: EventType;
    design?: CardDesign;
    poem: string;
    image_url?: string;
    share_token: string;
    created_at: string;
}

export interface CardFormData {
    name: string;
    gender: Gender;
    language: Language;
    event_type: EventType;
    image?: File;
}

export interface BatchContact {
    name: string;
    gender: Gender;
    email?: string;
    phone?: string;
}

export interface BatchGenerationResult {
    shareUrl?: string;
    success: boolean;
    card?: CardData;
    error?: string;
    contact: BatchContact;

}

export interface ShareOptions {
    whatsapp: boolean;
    facebook: boolean;
    email: boolean;
    copyLink: boolean;
}

export interface CardRow {
    id: string;
    created_at?: string;           // nullable
    is_public?: boolean;           // nullable
    views_count?: number;          // nullable
    user_id?: string;              // nullable
    image_url?: string;            // nullable
    name: string;
    gender: 'boy' | 'girl' | 'neutral';
    language: 'fr' | 'en';
    share_token: string;
    event_type: EventType;
    poem: string;
    design?: CardDesign;
}

export interface CardStats {
    total: number;
    totalViews: number;
    events: Record<EventType, number>;
    date?: string;
    total_cards?: number;
    french_cards?: number;
    english_cards?: number;
    boy_cards?: number;
    girl_cards?: number;
    neutral_cards?: number;
}
export interface CardItemProps {
    card: CardData;
    index: number;
    onClick?: () => void;
}

export interface CardModalProps {
    card: CardData;
    onClose: () => void;
    onShare: () => void;
}
