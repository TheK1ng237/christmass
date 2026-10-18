'use client';

import React from 'react';
import { Language } from '@/lib/types';

interface LanguageSelectorProps {
    selected: Language;
    onChange: (language: Language) => void;
}

export default function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
    const languages = [
        { value: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
        { value: 'en' as Language, label: 'English', flag: '🇬🇧' },
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Langue / Language
            </label>
            <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                    <button
                        key={lang.value}
                        type="button"
                        onClick={() => onChange(lang.value)}
                        className={`
              relative flex items-center justify-center gap-3 p-5 rounded-xl
              border-2 transition-all duration-200 font-medium
              ${selected === lang.value
                            ? 'border-christmas-red bg-red-50 text-christmas-red shadow-md'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
            `}
                    >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-lg">{lang.label}</span>
                        {selected === lang.value && (
                            <div className="absolute top-0 right-0">
                                <svg
                                    className="w-5 h-5 text-christmas-red"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}