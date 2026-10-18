import { Language, Gender, EventType } from '@/lib/types';
import type { CardDesign, GenerateRequest } from '@/lib/schemas/card-design';

export class CardCreationError extends Error {
    constructor(
        message: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = 'CardCreationError';
    }
}

export const eventService = {
    /**
     * Upload d'une image vers le serveur
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const data = await res.json();
        return data.imageUrl;
    },

    /**
     * Génération des poèmes via l'IA
     */
    async generateCardDesigns(params: GenerateRequest): Promise<CardDesign[]> {
        const res = await fetch('/api/generate-cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Gemini error');
        }

        const data = await res.json();
        if (!Array.isArray(data.designs) || data.designs.length !== 4) {
            throw new Error('La génération doit retourner exactement quatre designs.');
        }

        return data.designs;
    },

    /**
     * Création finale de la carte de partage
     */
    async createCard(params: {
        name: string,
        gender: Gender,
        language: Language,
        eventType: EventType,
        design: CardDesign,
        imageUrl: string | null;
    }) {

        const res = await fetch('/api/create-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: params.name,
                gender: params.gender,
                language: params.language,
                event_type: params.eventType,
                design: params.design,
                image_url: params.imageUrl,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new CardCreationError(errorData.error || 'Erreur de création', errorData.code);
        }

        return await res.json();
    }
};
