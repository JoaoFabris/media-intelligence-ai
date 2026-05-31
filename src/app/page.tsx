import { redirect } from 'next/navigation'

export default async function RootPage() {
  // Redireciona automaticamente para o dashboard. 
  // O seu Middleware se encarregará de jogá-lo para o /login caso ele não tenha sessão ativa.
  redirect('/dashboard')
}