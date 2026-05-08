import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, email, password } = body

    if (!nom || !email || !password) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (nom, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [nom, email, hashedPassword, 'client']
    )

    const userId = result.rows[0].id

    // Créer la session
    const expires = new Date(Date.now() + 120 * 60 * 1000) // 2 heures
    const session = await encrypt({ userId, nom, email, role: 'client', expires })

    // Envoyer la réponse avec le cookie de session
    const response = NextResponse.json({ 
      success: true, 
      user: { id: userId, nom, email, role: 'client' } 
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
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Erreur lors de l inscription' }, { status: 500 })
  }
}
