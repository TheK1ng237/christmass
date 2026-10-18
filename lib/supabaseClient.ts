import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload une image dans le storage Supabase
 */
export async function uploadImage(file: File, fileName: string) {
    try {
        const { data, error } = await supabase.storage
            .from('card-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('card-images')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Supprime une image du storage
 */
export async function deleteImage(filePath: string) {
    try {
        const { error } = await supabase.storage
            .from('card-images')
            .remove([filePath]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}