function required(name: 'ADMIN_USERNAME' | 'ADMIN_PASSWORD'): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be set for admin end-to-end tests.`)
  return value
}

export const adminCredentials = {
  username: required('ADMIN_USERNAME'),
  password: required('ADMIN_PASSWORD'),
}
