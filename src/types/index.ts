export type Analysis = {
    sentiment: 'positive' | 'neutral' | 'negative'
    score: number
    one_line_summary: string | null
  }
  
  export type Article = {
    id: string
    title: string
    url: string
    source: string
    published_at: string
    keyword: string
    analyses: Analysis | null
  }