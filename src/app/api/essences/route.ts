import { NextResponse } from 'next/server'
import pool from '@/lib/db'

const ESSENCES_FALLBACK = [
  { id: 1, nom: 'Rose de Damas', famille: 'Floral', note: 'cœur', couleur: '#E8A0B0', description: 'Rose intense et veloutée', actif: 1 },
  { id: 2, nom: 'Jasmin Sambac', famille: 'Floral', note: 'cœur', couleur: '#FFF0A0', description: 'Jasmin crémeux et envoûtant', actif: 1 },
  { id: 3, nom: 'Fleur d\'Oranger', famille: 'Floral', note: 'tête', couleur: '#FFD580', description: 'Fraîche et légèrement mielleuse', actif: 1 },
  { id: 4, nom: 'Iris Poudrée', famille: 'Floral', note: 'cœur', couleur: '#C8A0D8', description: 'Poudré, élégant et doux', actif: 1 },
  { id: 5, nom: 'Bergamote Sicilienne', famille: 'Agrumes', note: 'tête', couleur: '#A8D860', description: 'Citronné et pétillant', actif: 1 },
  { id: 6, nom: 'Citron Vert', famille: 'Agrumes', note: 'tête', couleur: '#90E040', description: 'Vif et tonique', actif: 1 },
  { id: 7, nom: 'Pamplemousse Rose', famille: 'Agrumes', note: 'tête', couleur: '#FFB0A0', description: 'Fruité et légèrement amer', actif: 1 },
  { id: 8, nom: 'Santal de Mysore', famille: 'Boisé', note: 'fond', couleur: '#C8904A', description: 'Crémeux, chaud et sensuel', actif: 1 },
  { id: 9, nom: 'Cèdre de l\'Atlas', famille: 'Boisé', note: 'fond', couleur: '#A07840', description: 'Sec, boisé, masculin', actif: 1 },
  { id: 10, nom: 'Vétiver d\'Haïti', famille: 'Boisé', note: 'fond', couleur: '#806030', description: 'Terreux, fumé, profond', actif: 1 },
  { id: 11, nom: 'Oud Arabique', famille: 'Oriental', note: 'fond', couleur: '#603020', description: 'Oud pur, intense et précieux', actif: 1 },
  { id: 12, nom: 'Ambre Gris', famille: 'Oriental', note: 'fond', couleur: '#D0A060', description: 'Chaud, animal et profond', actif: 1 },
  { id: 13, nom: 'Vanille Bourbon', famille: 'Gourmand', note: 'fond', couleur: '#E8C080', description: 'Douce, chaude et réconfortante', actif: 1 },
  { id: 14, nom: 'Caramel Salé', famille: 'Gourmand', note: 'cœur', couleur: '#C07840', description: 'Gourmand et addictif', actif: 1 },
  { id: 15, nom: 'Fève Tonka', famille: 'Gourmand', note: 'fond', couleur: '#A05020', description: 'Amandée, miellée, envoûtante', actif: 1 },
  { id: 16, nom: 'Musc Blanc', famille: 'Musqué', note: 'fond', couleur: '#F0F0F0', description: 'Propre, doux, seconde peau', actif: 1 },
  { id: 17, nom: 'Musc Noir', famille: 'Musqué', note: 'fond', couleur: '#404040', description: 'Sensuel, profond, magnétique', actif: 1 },
  { id: 18, nom: 'Menthe Poivrée', famille: 'Frais', note: 'tête', couleur: '#80E0A0', description: 'Fraîche, vivifiante, intense', actif: 1 },
  { id: 19, nom: 'Eucalyptus', famille: 'Frais', note: 'tête', couleur: '#A0D0C0', description: 'Pur, aérien, propre', actif: 1 },
  { id: 20, nom: 'Poivre Noir', famille: 'Épicé', note: 'cœur', couleur: '#303030', description: 'Piquant, dynamique, chaud', actif: 1 },
]

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM essences ORDER BY famille, nom'
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('DB Error:', error)
    // Fallback data if DB not connected
    return NextResponse.json({
      success: true,
      data: ESSENCES_FALLBACK
    })
  }
}
