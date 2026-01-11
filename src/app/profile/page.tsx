import LogoutButton from '@/src/components/LogoutButton'
import { requireUser } from '@/src/lib/auth'

export default async function ProfilePage() {
  const user = await requireUser()

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-5 text-sm text-neutral-700 shadow-sm">
        <div><b>ФИО:</b> {user.fullName}</div>
        <div><b>Email:</b> {user.email}</div>
        <div><b>Роль:</b> {user.role}</div>
        <LogoutButton className="mt-5 bg-[#B5292A]">
          Выйти из аккаунта
        </LogoutButton>
      </div>
    </div>
  )
}
