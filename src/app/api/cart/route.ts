import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const [panier]: any = await pool.execute('SELECT * FROM panier WHERE user_id = ?', [session.userId])
    if (panier.length === 0) return NextResponse.json({ success: true, items: [] })

    const [items]: any = await pool.execute('SELECT * FROM panier_items WHERE panier_id = ?', [panier[0].id])
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
    let [panier]: any = await pool.execute('SELECT id FROM panier WHERE user_id = ?', [session.userId])
    let panierId: number
    if (panier.length === 0) {
      const [res]: any = await pool.execute('INSERT INTO panier (user_id) VALUES (?)', [session.userId])
      panierId = res.insertId
    } else {
      panierId = panier[0].id
    }

    // 2. Add Item
    await pool.execute(`
      INSERT INTO panier_items 
        (panier_id, item_type, parfum_catalogue_id, nom_personnalise, ml, prix, quantite, gravure, couleur, essences_json, parfums_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    const [panier]: any = await pool.execute('SELECT id FROM panier WHERE user_id = ?', [session.userId])
    if (panier.length === 0) return NextResponse.json({ success: true })

    if (clearAll) {
      await pool.execute('DELETE FROM panier_items WHERE panier_id = ?', [panier[0].id])
    } else if (itemId) {
      await pool.execute('DELETE FROM panier_items WHERE id = ? AND panier_id = ?', [itemId, panier[0].id])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
