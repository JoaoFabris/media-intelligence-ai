import React from 'react'

const sentimentConfig = {
    positive: { label: 'Positivo', className: 'bg-green-100 text-green-700' },
    neutral: { label: 'Neutro', className: 'bg-gray-100 text-gray-600' },
    negative: { label: 'Negativo', className: 'bg-red-100 text-red-700' },
}

interface Article {
    id: string | number
    url: string
    title: string
    source: string
    published_at: string | Date
    analyses?: {
        sentiment: string
        one_line_summary?: string
    } | null
}

export default function ArticleList({ articles }: { articles: Article[] }) {
    return (
        <div className="bg-white rounded-xl border">
            <div className="p-6 border-b">
                <h3 className="text-base font-semibold text-gray-900">Artigos</h3>
            </div>
            <ul className="divide-y">
                {articles.map(article => {
                    const analysis = article.analyses
                    const config = analysis
                        ? sentimentConfig[analysis.sentiment as keyof typeof sentimentConfig]
                        : null

                    return (
                        <li key={article.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                                    >
                                        {article.title}
                                    </a>

                                    {analysis?.one_line_summary && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {analysis.one_line_summary}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-1">
                                        {article.source} · {new Date(article.published_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                {config && (
                                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${config.className}`}>
                                        {config.label}
                                    </span>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}