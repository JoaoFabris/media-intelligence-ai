import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { message, keyword } = await request.json()

  if (!message) {
    return NextResponse.json({ error: 'message obrigatório' }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. Busca artigos relevantes via full-text search
  const { data: articles } = await supabase
  .from('articles')
  .select(`
    title,
    description,
    source,
    published_at,
    analyses ( sentiment, one_line_summary )
  `)
  .eq('keyword', keyword ?? '')
  .limit(5)

const context = articles?.length
  ? articles.map((a: any, i: number) => {
      const analysis = Array.isArray(a.analyses) ? a.analyses[0] : a.analyses
      return `[${i + 1}] ${a.title} (${a.source}, ${new Date(a.published_at).toLocaleDateString('pt-BR')})
Sentimento: ${analysis?.sentiment ?? 'n/a'}
Resumo: ${analysis?.one_line_summary ?? a.description ?? 'sem resumo'}`
    }).join('\n\n')
  : 'Nenhum artigo encontrado.'

  // 3. Chama Groq com streaming
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      stream: true,
      messages: [
        {
          role: 'system',
          content: `Você é um analista de mídia. Responda perguntas sobre cobertura jornalística baseado nos artigos abaixo. Seja objetivo e cite as fontes.

ARTIGOS:
${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  })
  console.log('CONTEXTO:', context)

  // 4. Retorna o stream diretamente ao browser
  return new Response(groqRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}