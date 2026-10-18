'use client';

import React from 'react';
import { Gender, Language } from '@/lib/types';

interface GenderSelectorProps {
    selected: Gender;
    onChange: (gender: Gender) => void;
    language: Language;
}

export default function GenderSelector({ selected, onChange, language }: GenderSelectorProps) {
    const genders = [
        {
            value: 'boy' as Gender,
            label: language === 'fr' ? 'Garçon' : 'Boy',
            icon: '👦',
            color: 'blue',
        },
        {
            value: 'girl' as Gender,
            label: language === 'fr' ? 'Fille' : 'Girl',
            icon: '👧',
            color: 'pink',
        },
        {
            value: 'neutral' as Gender,
            label: language === 'fr' ? 'Neutre' : 'Neutral',
            icon: '🎁',
            color: 'purple',
        },
    ];

    const getColorClasses = (color: string, isSelected: boolean) => {
        if (isSelected) {
            switch (color) {
                case 'blue':
                    return 'border-blue-500 bg-blue-50 text-blue-700';
                case 'pink':
                    return 'border-pink-500 bg-pink-50 text-pink-700';
                case 'purple':
                    return 'border-purple-500 bg-purple-50 text-purple-700';
                default:
                    return 'border-gray-500 bg-gray-50 text-gray-700';
            }
        }
        return 'border-gray-300 bg-white text-gray-700 hover:border-gray-400';
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {language === 'fr' ? 'Genre' : 'Gender'}
            </label>
            <div className="grid grid-cols-3 gap-3">
                {genders.map((gender) => (
                    <button
                        key={gender.value}
                        type="button"
                        onClick={() => onChange(gender.value)}
                        className={`
              relative flex flex-col items-center justify-center gap-2 rounded-xl
              border-2 transition-all duration-200 font-medium
              ${getColorClasses(gender.color, selected === gender.value)}
            `}
                    >
                        <span className="text-4xl">{gender.icon}</span>
                        <span className="text-sm">{gender.label}</span>
                        {selected === gender.value && (
                            <div className="absolute top-2 right-2">
                                <svg
                                    className="w-5 h-5"
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