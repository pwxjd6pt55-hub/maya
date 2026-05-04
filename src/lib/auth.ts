import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'maya-bar-secret-key-123')

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, SECRET, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null
  return await decrypt(session)
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  if (!session) return

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + 120 * 60 * 1000)
  const res = NextResponse.next()
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  })
}
