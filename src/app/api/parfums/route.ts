import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

let PARFUMS_FALLBACK = [
  { id: 1, nom: 'Sauvage Noir', marque_inspiree: 'Dior Sauvage', famille: 'Frais Aromatique', prix_30ml: 9500, prix_50ml: 14000, prix_100ml: 22000, notes_tete: 'Bergamote, Poivre', notes_coeur: 'Lavande, Géranium', notes_fond: 'Ambroxan, Vétiver', image_url: '/parfums/parfum_noir.png' },
  { id: 2, nom: 'Liberté Florale', marque_inspiree: 'YSL Libre', famille: 'Floral Oriental', prix_30ml: 10000, prix_50ml: 15000, prix_100ml: 24000, notes_tete: 'Mandarine, Lavande', notes_coeur: 'Fleur d\'Oranger, Jasmin', notes_fond: 'Vanille, Musc', image_url: '/parfums/parfum_cristal.png' },
  { id: 3, nom: 'Rose Éternelle', marque_inspiree: 'Chanel N°5', famille: 'Floral Aldéhydé', prix_30ml: 10500, prix_50ml: 16000, prix_100ml: 26000, notes_tete: 'Aldéhydes, Citron', notes_coeur: 'Rose, Jasmin, Iris', notes_fond: 'Santal, Musc, Civet', image_url: '/parfums/parfum_ambre.png' },
  { id: 4, nom: 'Bois de Soie', marque_inspiree: 'Tom Ford Oud Wood', famille: 'Boisé Oriental', prix_30ml: 12000, prix_50ml: 18000, prix_100ml: 28000, notes_tete: 'Cardamome, Poivre Rose', notes_coeur: 'Oud, Santal', notes_fond: 'Vétiver, Ambre, Musc', image_url: '/parfums/parfum_noir.png' },
  { id: 5, nom: 'Jardin de Flore', marque_inspiree: 'Hermès Un Jardin', famille: 'Floral Frais', prix_30ml: 9000, prix_50ml: 13500, prix_100ml: 21000, notes_tete: 'Pamplemousse, Narcisse', notes_coeur: 'Jacinthes, Pivoine', notes_fond: 'Musc Blanc, Bois de Cèdre', image_url: '/parfums/parfum_cristal.png' },
  { id: 6, nom: 'Velours Ambré', marque_inspiree: 'Maison Margiela Replica', famille: 'Oriental Gourmand', prix_30ml: 9500, prix_50ml: 14500, prix_100ml: 23000, notes_tete: 'Bergamote, Iris', notes_coeur: 'Fève Tonka, Vanille', notes_fond: 'Ambre, Musc', image_url: '/parfums/parfum_ambre.png' },
  { id: 7, nom: 'Bleu Électrique', marque_inspiree: 'Bleu de Chanel', famille: 'Aromatique Frais', prix_30ml: 9500, prix_50ml: 14000, prix_100ml: 22000, notes_tete: 'Citron, Menthe', notes_coeur: 'Gingembre, Noix Muscade', notes_fond: 'Santal, Cèdre', image_url: '/parfums/parfum_noir.png' },
  { id: 8, nom: 'Nuit Orientale', marque_inspiree: 'Lancôme La Nuit Trésor', famille: 'Oriental Gourmand', prix_30ml: 9000, prix_50ml: 13500, prix_100ml: 21000, notes_tete: 'Bergamote, Nectarine', notes_coeur: 'Rose, Jasmin, Caramel', notes_fond: 'Vanille, Patchouli, Musc', image_url: '/parfums/parfum_ambre.png' },
  { id: 9, nom: 'Cuir Nomade', marque_inspiree: 'Montblanc Explorer', famille: 'Boisé Aromatique', prix_30ml: 8500, prix_50ml: 12500, prix_100ml: 19500, notes_tete: 'Bergamote, Citron Vert', notes_coeur: 'Vétiver, Poivre Rose', notes_fond: 'Labdanum, Patchouli', image_url: '/parfums/parfum_noir.png' },
  { id: 10, nom: 'Poudre de Soie', marque_inspiree: 'Viktor & Rolf Flowerbomb', famille: 'Floral Oriental', prix_30ml: 10000, prix_50ml: 15500, prix_100ml: 24500, notes_tete: 'Bergamote, Thé', notes_coeur: 'Orchidée, Jasmin, Rose', notes_fond: 'Patchouli, Musc, Vanille', image_url: '/parfums/parfum_cristal.png' },
  { id: 11, nom: 'Oud Royal', marque_inspiree: 'Initio Oud for Greatness', famille: 'Oriental Boisé', prix_30ml: 13000, prix_50ml: 19000, prix_100ml: 30000, notes_tete: 'Cardamome Noire, Safran', notes_coeur: 'Oud, Encens', notes_fond: 'Musc Animal, Ambre Gris', image_url: '/parfums/parfum_ambre.png' },
  { id: 12, nom: 'Soleil d\'Afrique', marque_inspiree: 'Creed Aventus', famille: 'Fruité Boisé', prix_30ml: 12000, prix_50ml: 18000, prix_100ml: 28000, notes_tete: 'Ananas, Pomme Verte', notes_coeur: 'Bouleau, Jasmin', notes_fond: 'Chêne, Musc, Ambre', image_url: '/parfums/parfum_noir.png' },
]


import { getSession } from '@/lib/auth'


export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM parfums_catalogue ORDER BY famille, nom'
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('DB Error:', error)
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.isAdmin) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  try {
    const data = await request.json()
    const { nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml, image_url } = data
    
    try {
      const [result] = await pool.execute(`
        INSERT INTO parfums_catalogue 
          (nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [nom, marque_inspiree || '', famille || '', notes_tete || '', notes_coeur || '', notes_fond || '', prix_30ml || 0, prix_50ml || 0, prix_100ml || 0, image_url || null])
      return NextResponse.json({ success: true, id: (result as any).insertId })
    } catch(dbErr) {
      // Fallback mode
      const newId = PARFUMS_FALLBACK.length ? Math.max(...PARFUMS_FALLBACK.map(p => p.id)) + 1 : 1
      PARFUMS_FALLBACK.push({ id: newId, nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml, image_url })
      return NextResponse.json({ success: true, id: newId, mode: 'offline' })
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.isAdmin) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  try {
    const data = await request.json()
    const { id, nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml, image_url } = data
    
    try {
      await pool.execute(`
        UPDATE parfums_catalogue 
        SET nom=?, marque_inspiree=?, famille=?, notes_tete=?, notes_coeur=?, notes_fond=?, prix_30ml=?, prix_50ml=?, prix_100ml=?, image_url=?
        WHERE id=?
      `, [nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml, image_url, id])
      return NextResponse.json({ success: true })
    } catch(dbErr) {
      // Fallback mode
      const idx = PARFUMS_FALLBACK.findIndex(p => p.id === id)
      if (idx > -1) {
        PARFUMS_FALLBACK[idx] = { ...PARFUMS_FALLBACK[idx], nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml, image_url }
      }
      return NextResponse.json({ success: true, mode: 'offline' })
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.isAdmin) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false }, { status: 400 })
    
    try {
      await pool.execute('DELETE FROM parfums_catalogue WHERE id = ?', [id])
      return NextResponse.json({ success: true })
    } catch(dbErr) {
      PARFUMS_FALLBACK = PARFUMS_FALLBACK.filter(p => p.id !== parseInt(id))
      return NextResponse.json({ success: true, mode: 'offline' })
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
