import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Sidebar from './_components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen lg:flex bg-gray-50">
      <Sidebar email={session.email as string} />

      <main className="flex-1 p-4 lg:p-8 overflow-auto mt-14 lg:mt-0">
        {children}
      </main>
    </div>
  )
}