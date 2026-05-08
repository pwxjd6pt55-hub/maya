import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'
import { envoyerEmailsCommande } from '@/lib/email'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !session.userId) return NextResponse.json({ authenticated: false }, { status: 401 })

  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const { retrait, date_souhaitee, client_nom, client_telephone, client_email } = await request.json()

    // 1. Get Cart Items
    const [panier]: any = await connection.execute('SELECT id FROM panier WHERE user_id = ?', [session.userId])
    if (panier.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const [items]: any = await connection.execute('SELECT * FROM panier_items WHERE panier_id = ?', [panier[0].id])
    if (items.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const createdReferences = []

    // 2. Create Orders for each item (or one order with multiple items - here we follow the existing 'commandes' schema which is 1 order = 1 parfum)
    for (const item of items) {
      const reference = `MB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      
      // Map item_type to the accepted ENUM values in DB ('catalogue' | 'melange')
      const modeCommande = item.item_type === 'catalogue' ? 'catalogue' : 'melange'

      const [res]: any = await connection.execute(`
        INSERT INTO commandes 
          (reference, client_nom, client_telephone, client_email, mode_commande, parfum_catalogue_id, parfum_catalogue_nom, ml, prix_total, gravure, couleur_parfum, retrait, date_souhaitee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reference, client_nom, client_telephone, client_email, 
        modeCommande, item.parfum_catalogue_id, item.nom_personnalise || 'Mélange', 
        item.ml, item.prix, item.gravure, item.couleur, retrait, date_souhaitee
      ])

      createdReferences.push(reference)

      // Send email (optional: one summary email would be better, but here we trigger for each)
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
    await connection.execute('DELETE FROM panier_items WHERE panier_id = ?', [panier[0].id])
    
    await connection.commit()
    return NextResponse.json({ success: true, references: createdReferences })

  } catch (error) {
    await connection.rollback()
    console.error('Checkout error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors du checkout' }, { status: 500 })
  } finally {
    connection.release()
  }
}
