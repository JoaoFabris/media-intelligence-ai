-- Tabela de artigos
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  source text,
  published_at timestamptz,
  keyword text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de análises
CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  score numeric(3,2) NOT NULL CHECK (score >= 0.00 AND score <= 1.00),
  one_line_summary text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_article_analysis UNIQUE (article_id)
);

-- Tabela de mensagens do chat
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Full-text search
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

-- Índices
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
CREATE INDEX idx_articles_keyword ON articles(keyword);
CREATE INDEX idx_articles_keyword_published ON articles(keyword, published_at DESC);
CREATE INDEX idx_chat_messages_user_created ON chat_messages(user_id, created_at ASC);
CREATE INDEX idx_analyses_article ON analyses(article_id);

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_read" ON articles FOR SELECT USING (true);
CREATE POLICY "analyses_read" ON analyses FOR SELECT USING (true);
CREATE POLICY "chat_own_read" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_own_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);