'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/lib/auth/actions'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        setLoading(true)
        setError('')
        const result = isLogin
            ? await signIn(email, password)
            : await signUp(email, password)
        if (result?.error) setError(result.error)
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow space-y-4">
                <h1 className="text-2xl font-bold text-center">
                    {isLogin ? 'Entrar' : 'Criar conta'}
                </h1>

                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:underline"
                    >
                        {isLogin ? 'Cadastre-se' : 'Entre'}
                    </button>
                </p>
            </div>
        </div>
    )
}