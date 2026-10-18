import { nanoid } from 'nanoid';

// Générer un token unique pour le partage
export function generateShareToken(): string {
    return nanoid(12);
}

// Formater une date
export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Générer l'URL de partage
export function generateShareUrl(token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/preview/${token}`;
}

// Générer les liens de partage
export function generateShareLinks(url: string, name: string) {
    const message = `Joyeux Noël et Bonne Année ${name}! 🎄✨`;

    return {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        email: `mailto:?subject=${encodeURIComponent('Carte de vœux pour ' + name)}&body=${encodeURIComponent(message + '\n\n' + url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
    };
}

// Valider le format d'email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Valider le format de téléphone
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s+()-]{8,}$/;
    return phoneRegex.test(phone);
}

// Parser un fichier CSV
export function parseCSV(text: string): any[] {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        data.push(obj);
    }

    return data;
}

// Télécharger un fichier
export function downloadFile(content: string, filename: string, type: string = 'text/csv') {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Copier dans le presse-papier
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

// Attendre un délai (pour éviter le rate limiting)
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}