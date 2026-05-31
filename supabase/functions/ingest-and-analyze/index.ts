import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { keyword } = await req.json()
  if (!keyword) {
    return new Response(JSON.stringify({ error: 'keyword obrigatória' }), { status: 400, headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Coleta artigos da NewsAPI
  const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&searchIn=title&pageSize=10&sortBy=publishedAt`
  const newsRes = await fetch(newsUrl, {
    headers: { 'X-Api-Key': Deno.env.get('NEWSAPI_KEY')! },
  })
  const newsData = await newsRes.json()

  if (newsData.status !== 'ok') {
    return new Response(JSON.stringify({ error: newsData.message }), { status: 500, headers: corsHeaders })
  }

  // 2. Insere artigos (deduplicação por URL)
  const articles = newsData.articles
    .filter((a: any) => a.url && a.title)
    .map((a: any) => ({
      url: a.url,
      title: a.title,
      description: a.description ?? '',
      source: a.source?.name ?? '',
      published_at: a.publishedAt,
      keyword,
    }))

  const { data: inserted } = await supabase
    .from('articles')
    .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })
    .select('id, title, description')

  if (!inserted?.length) {
    return new Response(
      JSON.stringify({ message: 'Nenhum artigo novo para analisar.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 3. Analisa sentimento de cada artigo novo
  const analyses = []

  for (const article of inserted) {
    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content: `Você é um analista de mídia. Retorne APENAS JSON válido com as chaves:
              sentiment (positive | neutral | negative),
              score (número de 0.00 a 1.00),
              one_line_summary (string em português).
              Nenhum texto fora do JSON.`,
          },
          {
            role: 'user',
            content: `Título: ${article.title}\nDescrição: ${article.description}`,
          },
        ],
      }),
    })

    if (!aiRes.ok) {
      console.error(`Erro na Groq para artigo ${article.id}: Status ${aiRes.status}`)
      continue
    }

    const aiData = await aiRes.json()
    const raw = aiData.choices?.[0]?.message?.content ?? '{}'

    try {
      const clean = raw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const parsed = JSON.parse(clean)
      const result = Array.isArray(parsed) ? parsed[0] : parsed

      analyses.push({
        article_id: article.id,
        sentiment: result.sentiment,
        score: result.score,
        one_line_summary: result.one_line_summary,
      })
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch {
      console.error('Erro ao parsear análise gerada pela Groq:', raw)
    }
  } // ← fecha o for

  // 4. Insere análises no banco
  if (analyses.length > 0) {
    await supabase.from('analyses').upsert(analyses, { onConflict: 'article_id' })
  }

  return new Response(
    JSON.stringify({ message: `${inserted.length} artigos processados`, analyses: analyses.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})