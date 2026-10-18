'use client';

import { createContext, useContext, useState } from 'react';
import { EventType } from '@/lib/types';

type EventContextType = {
    eventId: EventType;
    setEventId: (id: EventType) => void;
};

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [eventId, setEventId] = useState<EventType>('christmas');

    return (
        <EventContext.Provider value={{ eventId, setEventId }}>
            {children}
        </EventContext.Provider>
    );
}

export function useEvent() {
    const ctx = useContext(EventContext);
    if (!ctx) throw new Error('useEvent must be used inside EventProvider');
    return ctx;
}
