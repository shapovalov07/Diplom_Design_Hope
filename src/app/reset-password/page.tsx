import ResetPasswordForm from './ResetPasswordForm'

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[]
  }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token
  const token = String(rawToken ?? '').trim()

  return <ResetPasswordForm initialToken={token} />
}
