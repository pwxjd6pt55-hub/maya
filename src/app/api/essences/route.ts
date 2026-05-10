import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

const ESSENCES_FALLBACK = [
  { id: 1, nom: 'Rose de Damas', famille: 'Floral', note: 'cœur', couleur: '#E8A0B0', description: 'Rose intense et veloutée, symbole de la haute parfumerie orientale.', actif: 1 },
  { id: 2, nom: 'Jasmin Sambac', famille: 'Floral', note: 'cœur', couleur: '#FFF0A0', description: 'Jasmin crémeux et envoûtant, pilier des parfums floraux de luxe.', actif: 1 },
  { id: 3, nom: "Fleur d'Oranger", famille: 'Floral', note: 'tête', couleur: '#FFD580', description: 'Fraîche et légèrement mielleuse, apporte légèreté et féminité.', actif: 1 },
  { id: 4, nom: 'Iris Poudrée', famille: 'Floral', note: 'cœur', couleur: '#C8A0D8', description: 'Poudré, élégant et doux. Ingrédient phare de la parfumerie classique.', actif: 1 },
  { id: 5, nom: 'Bergamote Sicilienne', famille: 'Agrumes', note: 'tête', couleur: '#A8D860', description: 'Citronné et pétillant, parfaite note d\'ouverture pour une fragrance fraîche.', actif: 1 },
  { id: 8, nom: 'Santal de Mysore', famille: 'Boisé', note: 'fond', couleur: '#C8904A', description: 'Crémeux, chaud et sensuel. L\'une des matières premières les plus précieuses.', actif: 1 },
  { id: 11, nom: 'Oud Arabique', famille: 'Oriental', note: 'fond', couleur: '#603020', description: 'Oud pur, intense et précieux. Le "or liquide" de la parfumerie moyen-orientale.', actif: 1 },
  { id: 16, nom: 'Musc Blanc', famille: 'Musqué', note: 'fond', couleur: '#F0F0F0', description: 'Propre, doux, comme une seconde peau. Fixateur discret et élégant.', actif: 1 },
]

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM essences ORDER BY famille, nom')
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('DB Error:', error)
    return NextResponse.json({ success: true, data: ESSENCES_FALLBACK })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || (!session.isAdmin && session.role !== 'admin')) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }
  try {
    const data = await request.json()
    const { nom, famille, note, couleur, description, image_url } = data
    
    const result = await pool.query(
      'INSERT INTO essences (nom, famille, note, couleur, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [nom, famille, note, couleur || '#BC7C7C', description || '', image_url || null]
    )

    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error: any) {
    console.error('DB POST Error:', error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'ajout: " + (error?.message || String(error)) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || (!session.isAdmin && session.role !== 'admin')) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }
  try {
    const data = await request.json()
    const { id, nom, famille, note, couleur, description, image_url } = data
    
    await pool.query(
      'UPDATE essences SET nom=$1, famille=$2, note=$3, couleur=$4, description=$5, image_url=$6 WHERE id=$7',
      [nom, famille, note, couleur || '#BC7C7C', description || '', image_url || null, id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DB PATCH Error:', error)
    return NextResponse.json({ success: false, error: "Erreur lors de la modification: " + (error?.message || String(error)) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || (!session.isAdmin && session.role !== 'admin')) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false }, { status: 400 })
    await pool.query('DELETE FROM essences WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
