// services/batchGenerationService.ts
import {
    BatchContact,
    BatchGenerationResult,
    Language,
    EventType,
} from '@/lib/types';
import type { CardDesign } from '@/lib/schemas/card-design';

interface BatchGenerateParams {
    contacts: BatchContact[];
    language: Language;
    layout: CardDesign['layout'];
    eventType: EventType;
    logoUrl?: string;
    businessName?: string;
    userId?: string;
}

interface BatchGenerateResponse {
    results: BatchGenerationResult[];
}

export async function batchGenerateCards(
    params: BatchGenerateParams
): Promise<BatchGenerationResult[]> {


    const response = await fetch('/api/batch-generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SERVICE] Erreur API:', errorData);
        throw new Error(errorData?.error || 'Batch generation failed');
    }

    const data: BatchGenerateResponse = await response.json();
    console.log('✅ [SERVICE] Données reçues:', data);
    return data.results;
}