import {
    TreePine,
    PartyPopper,
    Heart,
    Egg,
    Cake,
    Flower2,
    UserRound,
    LucideIcon
} from 'lucide-react';
import { EventConfig, EventType } from './types';

export const EVENTS: Record<EventType, EventConfig> = {
    christmas: {
        id: 'christmas',
        name: {
            fr: 'Noël',
            en: 'Christmas',
        },
        description: {
            fr: 'Cartes de vœux pour Noël',
            en: 'Christmas greeting cards',
        },
        icon: TreePine,
        colors: {
            primary: '#B3202F',
            secondary: '#1D3B2F',
            accent: '#C9A15B',
        },
        available: true,
    },
    newyear: {
        id: 'newyear',
        name: {
            fr: 'Nouvel An',
            en: 'New Year',
        },
        description: {
            fr: 'Cartes de vœux pour le Nouvel An',
            en: 'New Year greeting cards',
        },
        icon: PartyPopper, // Icône Lucide
        colors: {
            primary: '#C9A15B',
            secondary: '#101528',
            accent: '#E0687A',
        },
        available: true,
    },
    valentine: {
        id: 'valentine',
        name: {
            fr: 'Saint-Valentin',
            en: "Valentine's Day",
        },
        description: {
            fr: "Cartes d'amour pour la Saint-Valentin",
            en: "Love cards for Valentine's Day",
        },
        icon: Heart, // Icône Lucide
        colors: {
            primary: '#C2254B',
            secondary: '#F7D5DB',
            accent: '#E5566D',
        },
        available: true,
    },
    easter: {
        id: 'easter',
        name: {
            fr: 'Pâques',
            en: 'Easter',
        },
        description: {
            fr: 'Cartes de vœux pour Pâques',
            en: 'Easter greeting cards',
        },
        icon: Egg, // Icône Lucide
        colors: {
            primary: '#8A6BB0',
            secondary: '#A8C686',
            accent: '#E7B93E',
        },
        available: true,
    },
    birthday: {
        id: 'birthday',
        name: {
            fr: 'Anniversaire',
            en: 'Birthday',
        },
        description: {
            fr: 'Cartes pour souhaiter un joyeux anniversaire',
            en: 'Cards to wish happy birthday',
        },
        icon: Cake, // Icône Lucide
        colors: {
            primary: '#E0687A',
            secondary: '#4B2E4E',
            accent: '#F3A712',
        },
        available: true,
    },
    mothersday: {
        id: 'mothersday',
        name: {
            fr: 'Fête des Mères',
            en: "Mother's Day",
        },
        description: {
            fr: 'Cartes pour célébrer les mamans',
            en: 'Cards to celebrate mothers',
        },
        icon: Flower2, // Icône Lucide
        colors: {
            primary: '#E58AA0',
            secondary: '#F2B8C0',
            accent: '#9DB38A',
        },
        available: true,
    },
    fathersday: {
        id: 'fathersday',
        name: {
            fr: 'Fête des Pères',
            en: "Father's Day",
        },
        description: {
            fr: 'Cartes pour célébrer les papas',
            en: 'Cards to celebrate fathers',
        },
        icon: UserRound, // Icône Lucide
        colors: {
            primary: '#C49A4A',
            secondary: '#14233B',
            accent: '#6F93A8',
        },
        available: true,
    },
};


export const getEventConfig = (eventType: EventType): EventConfig => {

    return EVENTS[eventType] || EVENTS.christmas;
};

export const getAvailableEvents = (): EventConfig[] => {
    return Object.values(EVENTS).filter(event => event.available);
};