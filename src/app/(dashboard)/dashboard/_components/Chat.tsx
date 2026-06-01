'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

export default function Chat({ keyword }: { keyword: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSend() {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        // Adiciona mensagem vazia do assistant para receber o streaming
        setMessages(prev => [...prev, { role: 'assistant', content: '' }])

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, keyword }),
            })

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (reader) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() ?? ''

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const data = line.slice(6)
                    if (data === '[DONE]') break

                    try {
                        const parsed = JSON.parse(data)
                        const delta = parsed.choices?.[0]?.delta?.content ?? ''
                        if (delta) {
                            setMessages(prev => {
                                const updated = [...prev]
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    content: updated[updated.length - 1].content + delta,
                                }
                                return updated
                            })
                        }
                    } catch { }
                }
            }
        } catch (error) {
            console.error('Erro no streaming:', error)
        } finally {
            // Garante que o loading seja desativado ao terminar ou falhar
            setLoading(false)
        }
    } // <- Fim correto da função handleSend

    // O return agora está no lugar certo: no corpo principal do componente Chat
    return (
        <div className="bg-white rounded-xl border flex flex-col h-[500px]">
            <div className="p-6 border-b">
                <h3 className="text-base font-semibold text-gray-900">Chat com os artigos</h3>
                <p className="text-xs text-gray-500 mt-1">Pergunte sobre a cobertura de "{keyword}"</p>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <p className="text-sm text-gray-400 text-center mt-8">
                        Faça uma pergunta sobre os artigos coletados
                    </p>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {msg.content || (loading && msg.role === 'assistant' && i === messages.length - 1 ? '...' : '')}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Qual o sentimento geral?"
                    className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    Enviar
                </button>
            </div>
        </div>
    )
}