import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/commandes — Liste des commandes
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
  }

  try {
    if (session.role === 'admin' || session.isAdmin) {
      // Admin : toutes les commandes
      const { rows } = await pool.query("SELECT * FROM commandes ORDER BY created_at DESC")
      return NextResponse.json({ success: true, data: rows })
    } else {
      // Client : uniquement ses commandes
      const { rows } = await pool.query(
        "SELECT * FROM commandes WHERE user_id = $1 ORDER BY created_at DESC",
        [session.userId]
      )
      return NextResponse.json({ success: true, data: rows })
    }
  } catch (error) {
    console.error("DB Error:", error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/commandes — Mise à jour du statut
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || (!session.isAdmin && session.role !== 'admin')) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id, statut } = await request.json()
    if (!id || !statut) {
      return NextResponse.json({ success: false, error: 'ID et statut requis' }, { status: 400 })
    }

    await pool.query("UPDATE commandes SET statut = $1 WHERE id = $2", [statut, id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DB PATCH Error:", error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
