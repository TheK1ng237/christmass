'use client';

import React, { useState } from 'react';
import { generateShareLinks, copyToClipboard } from '@/lib/utils';
import { Share2, Copy, Check, MessageCircle, Mail } from 'lucide-react';

interface ShareButtonsProps {
    url: string;
    name: string;
    language: 'fr' | 'en';
}

export default function ShareButtons({ url, name, language }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const links = generateShareLinks(url, name);

    const handleCopy = async () => {
        const success = await copyToClipboard(url);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const texts = {
        fr: {
            title: 'Partager la carte',
            copy: 'Copier le lien',
            copied: 'Copié !',
            whatsapp: 'WhatsApp',
            facebook: 'Facebook',
            email: 'Email',
        },
        en: {
            title: 'Share the card',
            copy: 'Copy link',
            copied: 'Copied!',
            whatsapp: 'WhatsApp',
            facebook: 'Facebook',
            email: 'Email',
        },
    };

    const t = texts[language];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                {t.title}
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <a
                    href={links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                    <MessageCircle className="w-5 h-5" />
                    {t.whatsapp}
                </a>

                {/* Facebook */}
                <a
                    href={links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    {t.facebook}
                </a>

                {/* Email */}
                <a
                    href={links.email}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                    <Mail className="w-5 h-5" />
                    {t.email}
                </a>

                {/* Copy Link */}
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-christmas-red hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                    {copied ? (
                        <>
                            <Check className="w-5 h-5" />
                            {t.copied}
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5" />
                            {t.copy}
                        </>
                    )}
                </button>
            </div>

            {/* URL Display */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 break-all">{url}</p>
            </div>
        </div>
    );
}