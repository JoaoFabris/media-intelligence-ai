import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Essa função funciona como um "proxy/middleware" de autenticação.
 *
 * Ela intercepta TODAS as requisições antes de chegarem
 * nas páginas do Next.js e:
 *
 * 1. Cria um cliente do Supabase no servidor
 * 2. Lê os cookies da sessão do usuário
 * 3. Atualiza/refresha automaticamente o token da sessão
 * 4. Verifica se o usuário está autenticado
 * 5. Redireciona para /login se necessário
 *
 * Fluxo:
 *
 * Browser -> Proxy -> Supabase valida sessão -> Página
 *
 * Sem esse proxy:
 * - o token pode expirar
 * - SSR perde autenticação
 * - usuários podem ser deslogados aleatoriamente
 */
export async function updateSession(request: NextRequest) {
  /**
   * Cria uma resposta inicial do Next.js.
   *
   * Essa resposta será modificada ao longo do processo
   * para incluir cookies atualizados da autenticação.
   */
  let supabaseResponse = NextResponse.next({
    request,
  });

  /**
   * Cria um cliente Supabase SERVER-SIDE.
   *
   * IMPORTANTE:
   * Esse cliente NÃO deve ser global.
   *
   * Em ambientes serverless/edge (como Vercel),
   * cada request precisa de uma instância nova
   * para evitar vazamento de sessão entre usuários.
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        /**
         * Lê TODOS os cookies da requisição atual.
         *
         * Aqui o Supabase pega:
         * - access token
         * - refresh token
         * - dados da sessão
         */
        getAll() {
          return request.cookies.getAll();
        },

        /**
         * Esse método é chamado AUTOMATICAMENTE
         * pelo Supabase quando ele precisa:
         *
         * - renovar tokens
         * - atualizar sessão
         * - salvar novos cookies
         *
         * O proxy literalmente "sincroniza"
         * os cookies entre:
         *
         * Request -> Supabase -> Response
         */
        setAll(cookiesToSet, headers) {
          /**
           * Atualiza os cookies da REQUEST atual.
           *
           * Isso mantém o estado consistente
           * durante a execução do request.
           */
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          /**
           * Recria a response com os cookies atualizados.
           */
          supabaseResponse = NextResponse.next({
            request,
          });

          /**
           * Salva os cookies novos na RESPONSE.
           *
           * Esses cookies vão voltar para o browser.
           */
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );

          /**
           * Copia headers adicionais que o Supabase precisar.
           */
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  /**
   * MUITO IMPORTANTE:
   *
   * Não coloque lógica entre:
   *
   * createServerClient()
   * e
   * supabase.auth.getClaims()
   *
   * Porque o Supabase pode precisar atualizar
   * a sessão imediatamente.
   */

  /**
   * Valida a sessão do usuário.
   *
   * O Supabase:
   * - lê o JWT
   * - verifica validade
   * - renova token se necessário
   * - devolve os claims do usuário
   *
   * Claims = payload do JWT:
   * {
   *   sub,
   *   email,
   *   role,
   *   exp,
   *   ...
   * }
   */
  const { data } = await supabase.auth.getClaims();

  /**
   * Dados do usuário autenticado.
   *
   * Se for undefined/null:
   * usuário NÃO está logado.
   */
  const user = data?.claims;

  /**
   * Proteção de rotas.
   *
   * Se NÃO existir usuário autenticado
   * E a rota não for pública:
   *
   * -> redireciona para /login
   */
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    /**
     * Clona a URL atual.
     */
    const url = request.nextUrl.clone();

    /**
     * Muda destino para página de login.
     */
    url.pathname = '/login';

    /**
     * Redireciona usuário.
     */
    return NextResponse.redirect(url);
  }

  /**
   * MUITO IMPORTANTE:
   *
   * Sempre retorne o supabaseResponse ORIGINAL.
   *
   * Porque ele contém:
   * - cookies atualizados
   * - refresh tokens
   * - headers internos
   *
   * Se você criar outra response sem copiar cookies:
   *
   * -> sessões quebram
   * -> logout aleatório
   * -> refresh token falha
   */
  return supabaseResponse;
}