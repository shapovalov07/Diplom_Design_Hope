import { requireUser } from '@/src/lib/auth'

export default async function ProfilePage() {
  const user = await requireUser()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <div className="mt-3 text-sm text-neutral-700">
        <div><b>ФИО:</b> {user.fullName}</div>
        <div><b>Email:</b> {user.email}</div>
        <div><b>Роль:</b> {user.role}</div>
      </div>
    </div>
  )
}
