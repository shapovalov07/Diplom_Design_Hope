export type UserNameFields = {
  lastName: string
  firstName: string
  middleName: string
}

export function normalizeUserNameFields(input: Partial<UserNameFields>): UserNameFields {
  return {
    lastName: String(input.lastName ?? '').trim(),
    firstName: String(input.firstName ?? '').trim(),
    middleName: String(input.middleName ?? '').trim(),
  }
}

export function formatUserFullName(input: Partial<UserNameFields>) {
  const { lastName, firstName, middleName } = normalizeUserNameFields(input)
  return [lastName, firstName, middleName].filter(Boolean).join(' ')
}

export function splitLegacyFullName(fullName: string): UserNameFields {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { lastName: '', firstName: '', middleName: '' }
  }
  if (parts.length === 1) {
    return { lastName: '', firstName: parts[0], middleName: '' }
  }

  const [lastName, firstName, ...rest] = parts
  return {
    lastName,
    firstName,
    middleName: rest.join(' '),
  }
}
