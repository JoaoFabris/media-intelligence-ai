'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchForm({ keyword }: { keyword?: string }) {
    const router = useRouter()
    const [value, setValue] = useState(keyword ?? '')
    const [loading, setLoading] = useState(false)

    async function handleIngest() {
        if (!value) return
        setLoading(true)
        await fetch('/api/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: value }),
        })
        router.push(`/dashboard?keyword=${encodeURIComponent(value)}`)
        router.refresh()
        setLoading(false)
    }

    function handleSearch() {
        if (!value) return
        router.push(`/dashboard?keyword=${encodeURIComponent(value)}`)
    }

    return (
        <div className="flex gap-3">
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Ex: Petrobras, Embraer, Vale..."
                className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
                onClick={handleSearch}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
                Buscar
            </button>
            <button
                onClick={handleIngest}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Coletando...' : 'Coletar + Analisar'}
            </button>
        </div>
    )
}