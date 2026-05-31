# Media Intelligence Dashboard

Dashboard de monitoramento de cobertura midiática com análise de sentimento e chat RAG.

## Stack

- **Next.js 16** — App Router, Server Components, Route Handlers
- **Supabase** — PostgreSQL, Auth, Edge Functions
- **Groq** — Análise de sentimento e chat (Llama 3)
- **NewsAPI** — Coleta de artigos
- **Recharts** — Visualização de dados
- **Tailwind CSS** — Estilização

## Arquitetura

```
Browser → Next.js (proxy.ts) → Supabase Auth
                ↓
         API Routes (trigger)
                ↓
      Supabase Edge Functions (Deno)
                ↓
         NewsAPI → Groq → PostgreSQL
                ↓
         Dashboard + Chat RAG (streaming SSE)
```

## Funcionalidades

- **Coleta** — busca artigos por keyword via NewsAPI com match no título
- **Análise** — sentimento (positivo/neutro/negativo), score e resumo via Groq
- **Dashboard** — gráfico de tendência de sentimento + lista de artigos
- **Chat RAG** — perguntas em linguagem natural respondidas com contexto real dos artigos

## Segurança

- RLS ativo em todas as tabelas
- Nenhuma API key exposta ao browser
- `getClaims()` para validação JWT no servidor
- Três camadas de segurança: proxy → Server Components → RLS

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- pnpm
- Supabase CLI
- Conta no [Supabase](https://supabase.com)
- Conta no [NewsAPI](https://newsapi.org)
- Conta no [Groq](https://console.groq.com)

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/media-intelligence
cd media-intelligence

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# edite o .env.local com suas keys

# 4. Configure o banco de dados
# Execute o SQL em supabase/migrations/schema.sql no SQL Editor do Supabase

# 5. Configure as secrets da Edge Function
supabase login
supabase link
supabase secrets set NEWSAPI_KEY=sua_key
supabase secrets set GROQ_API_KEY=sua_key

# 6. Deploy da Edge Function
supabase functions deploy ingest-and-analyze

# 7. Rode o projeto
pnpm dev
```

### Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEWSAPI_KEY=...
GROQ_API_KEY=...
```

## Deploy

O projeto está configurado para deploy na Vercel. Conecte o repositório e configure as variáveis de ambiente no painel da Vercel.
