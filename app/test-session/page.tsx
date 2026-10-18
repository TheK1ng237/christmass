'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // utilise le client côté navigateur

export default function TestPage() {
    const [status, setStatus] = useState('Vérification...')

    useEffect(() => {
        const check = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                setStatus(`✅ Connecté ! Email: ${data.session.user.email}`)
            } else {
                setStatus('❌ Aucune session trouvée côté client.')
            }
        }
        check()
    }, [])

    return <div className="p-10 text-white bg-black min-h-screen mt-80">{status}</div>
}
