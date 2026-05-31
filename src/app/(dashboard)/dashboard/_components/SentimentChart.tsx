'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SentimentChart({ articles }: { articles: any[] }) {
    const data = articles
        .filter(a => a.analyses)
        .map(a => ({
            date: new Date(a.published_at).toLocaleDateString('pt-BR'),
            score: a.analyses.score,
            sentiment: a.analyses.sentiment,
        }))
        .reverse()

    return (
        <div className="bg-white rounded-xl border p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Tendência de Sentimento</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" dot={false} name="Score" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}