import { createClient } from '@/lib/supabase/server'
import ArticleList from './_components/ArticleList'
import SearchForm from './_components/SearchForm'
import SentimentChart from './_components/SentimentChart'
import Chat from './_components/Chat'



export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ keyword?: string }>
}) {
    const { keyword } = await searchParams
    const supabase = await createClient()

    let articles: any[] = []

    if (keyword) {
        const { data } = await supabase
            .from('articles')
            .select('id, title, source, published_at, url, analyses(sentiment, score, one_line_summary)')
            .ilike('keyword', keyword)
            .order('published_at', { ascending: false })
            .limit(20)

        articles = data ?? []
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-500 mt-1">Monitore a cobertura de mídia por keyword</p>
            </div>

            <SearchForm keyword={keyword} />

            {keyword && articles.length === 0 && (
                <p className="text-gray-500">Nenhum artigo encontrado para "{keyword}". Tente ingesting primeiro.</p>
            )}

            {articles.length > 0 && (
                <>
                    <SentimentChart articles={articles} />
                    <ArticleList articles={articles} />
                </>
            )}
            {articles.length > 0 && keyword && (
                <Chat keyword={keyword} />
            )}
        </div>
    )
}