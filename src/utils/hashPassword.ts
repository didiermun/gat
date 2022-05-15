import * as bcrypt from 'bcrypt'

export async function hash(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function validatePassword(password: string, savedDb: string) {
  return await bcrypt.compare(password, savedDb)
}
