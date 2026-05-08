import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || !session.isAdmin) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const [rows]: any = await pool.execute('SELECT id, nom, email, created_at FROM users WHERE role = "client" ORDER BY created_at DESC')
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
