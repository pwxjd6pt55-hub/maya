import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'
import { envoyerEmailsCommande } from '@/lib/email'

// POST /api/commandes/notify — Notifie un client que sa commande est prête
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || (!session.isAdmin && session.role !== 'admin')) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { commandeId } = await request.json()
    if (!commandeId) {
      return NextResponse.json({ success: false, error: 'ID de commande requis' }, { status: 400 })
    }

    const { rows } = await pool.query("SELECT * FROM commandes WHERE id = $1", [commandeId])
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Commande introuvable' }, { status: 404 })
    }

    const commande = rows[0]

    // Mettre à jour le statut à "pret"
    await pool.query("UPDATE commandes SET statut = 'pret' WHERE id = $1", [commandeId])

    // Envoyer l'email de notification si le client a un email
    if (commande.client_email) {
      await envoyerEmailsCommande({
        id: commande.reference || commande.id,
        clientNom: commande.client_nom,
        clientTel: commande.client_tel,
        clientEmail: commande.client_email,
        parfum: commande.items_json ? JSON.parse(commande.items_json)[0]?.nom || 'Votre création' : 'Votre création',
        contenance: commande.items_json ? JSON.parse(commande.items_json)[0]?.ml + 'ml' || '' : '',
        prix: commande.prix_total || 0,
        type: 'catalogue',
        notes: '✅ Votre commande est prête ! Venez la récupérer ou attendez la livraison.',
        dateCommande: new Date().toLocaleDateString('fr-FR'),
      })
    }

    // Lien WhatsApp de fallback
    const telPropre = (commande.client_tel || '').replace(/[^0-9]/g, '')
    const messageWA = encodeURIComponent(
      `Bonjour ${commande.client_nom} ! 🌹\n\nVotre commande Maya Bar #${commande.reference || commande.id} est prête !\n\nVenez la récupérer à la boutique ou contactez-nous pour la livraison.\n\nMerci de votre confiance ✨\n— Maya Bar à Senteurs`
    )
    const whatsappLink = `https://wa.me/${telPropre}?text=${messageWA}`

    return NextResponse.json({ success: true, whatsappLink })
  } catch (error) {
    console.error("Notify Error:", error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la notification' }, { status: 500 })
  }
}
