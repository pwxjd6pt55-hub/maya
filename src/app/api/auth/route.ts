import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { encrypt, decrypt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 1. Vérification ADMIN (via .env)
    if (!email && password === process.env.ADMIN_PASSWORD) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const session = await encrypt({ role: 'admin', expires })
      
      const response = NextResponse.json({ success: true, role: 'admin' })
      response.cookies.set({
        name: 'session',
        value: session,
        httpOnly: true,
        expires: expires,
        path: '/',
      })
      // Garder admin_session pour la compatibilité avec l'ancien code si nécessaire
      response.cookies.set({
        name: 'admin_session',
        value: session,
        httpOnly: true,
        expires: expires,
        path: '/',
      })
      return response
    }

    // 2. Vérification CLIENT (via DB)
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const [users]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
    }

    const user = users[0]
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const expires = new Date(Date.now() + 120 * 60 * 1000)
    const session = await encrypt({ 
      userId: user.id, 
      nom: user.nom, 
      email: user.email, 
      role: user.role, 
      expires 
    })

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role } 
    })

    response.cookies.set({
      name: 'session',
      value: session,
      httpOnly: true,
      expires: expires,
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get('session')?.value || request.cookies.get('admin_session')?.value

  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const payload = await decrypt(session)
    return NextResponse.json({ 
      authenticated: true, 
      user: payload 
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  response.cookies.delete('admin_session')
  return response
}
