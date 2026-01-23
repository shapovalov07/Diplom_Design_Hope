import { requireUser } from '@/src/lib/auth'
import ProfileInquiries from './ProfileInquiries'
import ProfileForm from './ProfileForm'
import ProfileShapes from './ProfileShapes'

export default async function ProfilePage() {
  const user = await requireUser()

  return (
    <section className="relative overflow-hidden">
      <ProfileShapes />

      <div className="relative mx-auto w-[80%] px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold text-[#252525] sm:text-5xl">Профиль</h1>
            <p className="mt-3 text-sm text-neutral-500">Ваши данные и диалоги — в одном месте.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8">
          <ProfileForm initialFullName={user.fullName} initialEmail={user.email} role={user.role} />
          <ProfileInquiries currentUserId={user.id} />
        </div>
      </div>
    </section>
  )
}
