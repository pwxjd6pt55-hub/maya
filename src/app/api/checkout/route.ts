import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'
import { envoyerEmailsCommande } from '@/lib/email'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.userId) return NextResponse.json({ authenticated: false }, { status: 401 })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { retrait, date_souhaitee, client_nom, client_telephone, client_email, adresse } = await request.json()
    console.log('--- CHECKOUT : Commande reçue ---', client_nom);

    // 1. Get Cart Items
    const { rows: panier } = await client.query('SELECT id FROM panier WHERE user_id = $1', [session.userId])
    if (panier.length === 0) {
      console.warn('--- CHECKOUT : Panier non trouvé ---');
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Panier non trouvé' }, { status: 400 })
    }

    const { rows: items } = await client.query('SELECT * FROM panier_items WHERE panier_id = $1', [panier[0].id])
    if (items.length === 0) {
      console.warn('--- CHECKOUT : Panier vide ---');
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const createdReferences = []
    console.log(`--- CHECKOUT : Traitement de ${items.length} articles ---`);

    // 2. Create Orders
    for (const item of items) {
      const reference = `MB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      const modeCommande = item.item_type === 'catalogue' ? 'catalogue' : 'melange'

      await client.query(`
        INSERT INTO commandes 
          (reference, client_nom, client_telephone, client_email, client_adresse, mode_commande, parfum_catalogue_id, parfum_catalogue_nom, ml, prix_total, gravure, couleur_parfum, retrait, date_souhaitee)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        reference, client_nom, client_telephone, client_email, adresse || null,
        modeCommande, item.parfum_catalogue_id, item.nom_personnalise || 'Mélange', 
        item.ml, item.prix, item.gravure, item.couleur, retrait, date_souhaitee
      ])

      createdReferences.push(reference)

      console.log('--- CHECKOUT : Envoi email pour ---', reference);
      try {
        await envoyerEmailsCommande({
          id: reference,
          clientNom: client_nom,
          clientTel: client_telephone,
          clientEmail: client_email,
          parfum: item.nom_personnalise || item.parfum_catalogue_nom || 'Mélange',
          contenance: `${item.ml}ml`,
          prix: item.prix,
          type: item.item_type,
          dateCommande: new Date().toLocaleDateString()
        })
      } catch (e) {
        console.error('--- CHECKOUT : Erreur email ignorée ---', e);
      }
    }

    // 3. Clear Cart
    await client.query('DELETE FROM panier_items WHERE panier_id = $1', [panier[0].id])
    
    await client.query('COMMIT')
    console.log('--- CHECKOUT : Succès final ! ---', createdReferences);
    return NextResponse.json({ success: true, references: createdReferences, reference: createdReferences[0] })

  } catch (error: unknown) {
    await client.query('ROLLBACK')
    const msg = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Checkout error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  } finally {
    client.release()
  }
}
