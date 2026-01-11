import { requireAdmin } from '@/src/lib/auth'
import AdminPanel from './panel'

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="p-6">
      <h1 className="mb-6 text-center text-xl font-semibold">
        Приветствую тебя мой дорогой администратор, хорошей тебе работы ;)
      </h1>

      <AdminPanel />
    </div>
  )
}
