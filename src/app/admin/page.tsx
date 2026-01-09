import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import AdminPanel from './panel'


const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev_secret_change_me')

export default async function AdminPage() {
  const token = (await cookies()).get('session')?.value
  if (!token) redirect('/login')

  try {
    const { payload } = await jwtVerify(token, secret)
    if ((payload as any).role !== 'ADMIN') redirect('/')
  } catch {
    redirect('/login')
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Админка</h1>
      <p>Доступ только для ADMIN.</p>
       <AdminPanel />
    </div>
  )
}
