'use client';

import { useEvent } from "@/app/context/EventContext";
import EventParticles from "@/components/AnimatedSnow";

export default function GlobalParticles() {
    const { eventId } = useEvent();
    return <EventParticles eventId={eventId} />;
}