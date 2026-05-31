import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  // Executa a atualização de sessão para cada requisição que passar pelo matcher
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto as que correspondam a:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens do Next.js)
     * - favicon.ico (ícone do navegador)
     * - Imagens públicas/ícones (arquivos com extensões comuns abaixo)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
