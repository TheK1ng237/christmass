'use client';

import React from 'react';
import {EventType, Language} from '@/lib/types';
import {getAvailableEvents} from '@/lib/events';

interface EventSelectorProps {
    selected: EventType;
    onChange: (event: EventType) => void;
    language: Language;
}

export default function EventSelector({selected, onChange, language}: EventSelectorProps) {
    const events = getAvailableEvents();

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {language === 'fr' ? 'Événement / Event' : 'Event / Événement'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {events.map((event) => (
                    <button
                        key={event.id}
                        type="button"
                        onClick={() => onChange(event.id)}
                        className={`
              relative flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl
              border-2 transition-all duration-200 font-medium
              ${selected === event.id
                            ? 'border-2 shadow-lg scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-md'
                        }
            `}
                        style={{
                            borderColor: selected === event.id ? event.colors.primary : undefined,
                            backgroundColor: selected === event.id ? `${event.colors.primary}10` : undefined,
                            color: selected === event.id ? event.colors.primary : undefined,
                        }}
                    >
                        <span className="text-4xl">
  <event.icon size={32} strokeWidth={1.5}/>
</span>
                        <span className="text-sm text-center font-semibold">
  {event.name[language]}
</span>

                        {selected === event.id && (
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