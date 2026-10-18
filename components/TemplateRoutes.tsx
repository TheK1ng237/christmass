// components/TemplateRouter.tsx
import { EventType, TemplateId } from '@/lib/types';




type TemplateComponent = React.ComponentType<{
    name: string;
    poem: string;
    imageUrl?: string;
    language: 'fr' | 'en';
    isBusiness?: boolean;
}>;



/**
 * Fonction pour récupérer le bon composant template
 * @param eventType - Type d'événement (christmas, newyear, etc.)
 * @param templateId - ID du template (1, 2, 3, 4)
 * @returns Le composant React correspondant
 */
export function getTemplateComponent(
    eventType: EventType,
    templateId: TemplateId
): TemplateComponent {
    const eventTemplates = TEMPLATE_MAP[eventType];

    if (!eventTemplates) {
        console.error(`L'événement "${eventType}" n'existe pas dans TEMPLATE_MAP`);
        return TEMPLATE_MAP.christmas[1];
    }

    const Component = eventTemplates[templateId];

    if (!Component) {
        console.error(`Le template ID "${templateId}" n'existe pas pour ${eventType}`);
        return eventTemplates[1];
    }

    return Component;
}

/**
 * Hook personnalisé pour obtenir tous les templates d'un événement
 * @param eventType - Type d'événement
 * @returns Array de templates avec leurs métadonnées
 */
export function useEventTemplates(eventType: EventType, language: 'fr' | 'en') {
    const labels = {
        fr: {
            1: 'Classique',      // Style standard
            2: 'Moderne',        // Ton premier template émeraude
            3: 'Enfantin',       // Style Playful / Fun
            4: 'Élégant',        // Version Vogue (Editorial)
            5: 'Néo-Brutaliste', // Ton code original (Impactant)
            6: 'Astral',         // Version Glassmorphism (Futuriste)
            7: 'Luxe',           // Version Gold (L'Orfèvre)
            8: 'Cinématique',    // Version Director's Cut (Storytelling)
            9: 'Douceur',        // Version Sunset (Aura/Romantique)
            10: 'Prestige',      // Version Midnight (Architect/Dark)
        },
        en: {
            1: 'Classic',
            2: 'Modern',
            3: 'Playful',
            4: 'Elegant',
            5: 'Neo-Brutalist',
            6: 'Astral',
            7: 'Luxury',
            8: 'Cinematic',
            9: 'Softness',
            10: 'Prestige',
        }
    };

    return Array.from({ length: 10 }, (_, i) => {
        const id = (i + 1) as TemplateId;
        return {
            id,
            Component: getTemplateComponent(eventType, id),
            label: labels[language][id],
        };
    });
}