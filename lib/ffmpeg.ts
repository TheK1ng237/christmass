'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export async function getFFmpeg() {
    if (ffmpeg) return ffmpeg;
    if (loadPromise) return loadPromise; // Si on est déjà en train de charger, on attend

    loadPromise = (async () => {
        const instance = new FFmpeg();
        await instance.load({
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', // Note le dossier /umd/ plus stable
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        });
        ffmpeg = instance;
        return ffmpeg;
    })();

    return loadPromise;
}

export async function imagesToGif(
    images: string[],
    width: number,
    height: number,
    fps = 6
): Promise<Blob> {
    const ffmpeg = await getFFmpeg();

    for (let i = 0; i < images.length; i++) {
        await ffmpeg.writeFile(`frame_${i}.png`, await fetchFile(images[i]));
    }

    await ffmpeg.exec([
        '-framerate', String(fps),
        '-i', 'frame_%d.png',
        '-vf', `scale=${width}:${height}`,
        '-loop', '0',
        'out.gif',
    ]);

    const data = await ffmpeg.readFile('out.gif') as Uint8Array;
    const buffer = new Uint8Array(data).slice().buffer;

    return new Blob([buffer], { type: 'image/gif' });
}

