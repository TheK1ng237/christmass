import { renderSocialImage, socialImageSize } from '@/lib/social-image';

export const alt = 'Make & Wish — cartes de vœux personnalisées créées avec l’IA';
export const size = socialImageSize;
export const contentType = 'image/png';

export default function TwitterImage() {
    return renderSocialImage();
}
