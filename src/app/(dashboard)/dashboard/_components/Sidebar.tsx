'use client'

import { useState } from 'react'
import Link from 'next/link' // Importado para navegação correta no Next.js
import { signOut } from '@/lib/auth/actions'

export default function Sidebar({ email }: { email: string }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 h-14 flex items-center justify-between">
                <h1 className="text-base font-bold text-gray-900">Media Intelligence</h1>
                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Toggle Menu"
                >
                    <div className="space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${open ? 'opacity-0' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </button>
            </header>

            {/* Overlay mobile */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-40 h-full w-64 bg-white border-r flex flex-col
                transition-transform duration-200
                ${open ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-auto
            `}>
                <div className="p-6 border-b">
                    <h1 className="text-lg font-bold text-gray-900">Media Intelligence</h1>
                    <p className="text-xs text-gray-500 mt-1">{email}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {/* CORREÇÃO AQUI: Substituído o link quebrado pelo <Link> estruturado */}
                    <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Dashboard
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                            Sair
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}