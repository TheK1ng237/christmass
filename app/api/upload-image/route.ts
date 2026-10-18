import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
<<<<<<< HEAD
import {uploadImage} from "@/lib/supabaseClient";
=======
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const bucketName = 'card-images';
const allowedImageTypes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
>>>>>>> fd7cb0c0fb3b09b8d0a8f66a15d9e7e3534c46ff

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
<<<<<<< HEAD
        const file = formData.get('file') as File;

        if (!file) {
=======
        const file = formData.get('file');

        if (!(file instanceof File)) {
>>>>>>> fd7cb0c0fb3b09b8d0a8f66a15d9e7e3534c46ff
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

<<<<<<< HEAD

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
=======
        const extension = allowedImageTypes[file.type];
        if (!extension) {
>>>>>>> fd7cb0c0fb3b09b8d0a8f66a15d9e7e3534c46ff
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

<<<<<<< HEAD
        // Générer un nom de fichier unique
        const fileExtension = file.name.split('.').pop();
        const fileName = `${nanoid()}.${fileExtension}`;

        // Upload vers Supabase
        const imageUrl = await uploadImage(file, fileName);

        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
=======
        const fileName = `${nanoid()}.${extension}`;

        const { data, error } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, Buffer.from(await file.arrayBuffer()), {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Supabase image upload failed:', error);
            return NextResponse.json(
                { error: `Supabase upload failed: ${error.message}` },
                { status: 502 }
            );
        }

        const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(data.path);

        return NextResponse.json({ imageUrl: publicUrlData.publicUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            {
                error: error instanceof Error
                    ? `Failed to upload image: ${error.message}`
                    : 'Failed to upload image due to an unknown error',
            },
>>>>>>> fd7cb0c0fb3b09b8d0a8f66a15d9e7e3534c46ff
            { status: 500 }
        );
    }
}