import { NextResponse } from 'next/server'
import { encrypt } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (password === adminPassword) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const token = await encrypt({ role: 'admin', isAdmin: true, expires })

      const response = NextResponse.json({ success: true })
      // Poser un vrai cookie JWT pour que les routes API puissent le vérifier
      response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires,
        path: '/',
      })
      return response
    } else {
      return NextResponse.json({ success: false, error: 'Mot de passe incorrect' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
