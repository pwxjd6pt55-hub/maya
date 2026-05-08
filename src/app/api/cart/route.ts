import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const { rows: panier } = await pool.query('SELECT * FROM panier WHERE user_id = $1', [session.userId])
    if (panier.length === 0) return NextResponse.json({ success: true, items: [] })

    const { rows: items } = await pool.query('SELECT * FROM panier_items WHERE panier_id = $1', [panier[0].id])
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const body = await request.json()
    let { item_type, parfum_catalogue_id, nom_personnalise, ml, prix, quantite, gravure, couleur, essences_json, parfums_json } = body
    if (item_type === 'melange') item_type = 'melange_essences'

    // 1. Get or Create Cart
    let { rows: panier } = await pool.query('SELECT id FROM panier WHERE user_id = $1', [session.userId])
    let panierId: number
    if (panier.length === 0) {
      const res = await pool.query('INSERT INTO panier (user_id) VALUES ($1) RETURNING id', [session.userId])
      panierId = res.rows[0].id
    } else {
      panierId = panier[0].id
    }

    // 2. Add Item
    await pool.query(`
      INSERT INTO panier_items 
        (panier_id, item_type, parfum_catalogue_id, nom_personnalise, ml, prix, quantite, gravure, couleur, essences_json, parfums_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      panierId, item_type, parfum_catalogue_id || null, nom_personnalise || null, 
      ml, prix, quantite || 1, gravure || null, couleur || null, 
      essences_json ? JSON.stringify(essences_json) : null,
      parfums_json ? JSON.stringify(parfums_json) : null
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.userId) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')
    const clearAll = searchParams.get('all') === 'true'

    const { rows: panier } = await pool.query('SELECT id FROM panier WHERE user_id = $1', [session.userId])
    if (panier.length === 0) return NextResponse.json({ success: true })

    if (clearAll) {
      await pool.query('DELETE FROM panier_items WHERE panier_id = $1', [panier[0].id])
    } else if (itemId) {
      await pool.query('DELETE FROM panier_items WHERE id = $1 AND panier_id = $2', [itemId, panier[0].id])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
