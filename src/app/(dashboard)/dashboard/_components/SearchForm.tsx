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
        <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="Ex: Petrobras, Embraer, Vale..."
                    className="w-full sm:flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <div className="grid grid-cols-2 sm:flex gap-2">
                    <div className="relative group">
                        <button
                            onClick={handleSearch}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                        >
                            Buscar
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Filtra artigos já coletados
                        </div>
                    </div>
                    <div className="relative group">
                        <button
                            onClick={handleIngest}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Coletando...' : 'Coletar + Analisar'}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Busca novos artigos e analisa sentimento
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-400">
                Use <span className="font-medium text-gray-500">Buscar</span> para filtrar artigos já coletados ·{' '}
                Use <span className="font-medium text-gray-500">Coletar + Analisar</span> para buscar novos artigos na NewsAPI
            </p>
        </div>
    )
}