import Link from 'next/link' // Importado para navegação otimizada
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { signOut } from '@/lib/auth/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-gray-900">Media Intelligence</h1>
          <p className="text-xs text-gray-500 mt-1">{session.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* CORREÇÃO AQUI: Mudado de 'a' quebrado para o '<Link>' do Next.js */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
        </nav>

        <div className="p-4 border-t">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}