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
    const { retrait, date_souhaitee, client_nom, client_telephone, client_email } = await request.json()

    // 1. Get Cart Items
    const { rows: panier } = await client.query('SELECT id FROM panier WHERE user_id = $1', [session.userId])
    if (panier.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const { rows: items } = await client.query('SELECT * FROM panier_items WHERE panier_id = $1', [panier[0].id])
    if (items.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const createdReferences = []

    // 2. Create Orders
    for (const item of items) {
      const reference = `MB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      const modeCommande = item.item_type === 'catalogue' ? 'catalogue' : 'melange'

      await client.query(`
        INSERT INTO commandes 
          (reference, client_nom, client_telephone, client_email, mode_commande, parfum_catalogue_id, parfum_catalogue_nom, ml, prix_total, gravure, couleur_parfum, retrait, date_souhaitee)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        reference, client_nom, client_telephone, client_email, 
        modeCommande, item.parfum_catalogue_id, item.nom_personnalise || 'Mélange', 
        item.ml, item.prix, item.gravure, item.couleur, retrait, date_souhaitee
      ])

      createdReferences.push(reference)

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
    }

    // 3. Clear Cart
    await client.query('DELETE FROM panier_items WHERE panier_id = $1', [panier[0].id])
    
    await client.query('COMMIT')
    return NextResponse.json({ success: true, references: createdReferences })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Checkout error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors du checkout' }, { status: 500 })
  } finally {
    client.release()
  }
}
