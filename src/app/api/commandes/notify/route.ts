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

    // Sécurisation des données
    const clientTel = commande.client_telephone || commande.client_tel || '';
    const clientEmail = commande.client_email || commande.email || '';

    // Sécurisation du JSON (évite les crashs si items_json est invalide)
    let parfumNom = 'Votre création';
    let parfumContenance = '';
    if (commande.items_json) {
      try {
        const items = typeof commande.items_json === 'string' ? JSON.parse(commande.items_json) : commande.items_json;
        if (Array.isArray(items) && items.length > 0) {
          parfumNom = items[0]?.nom || 'Votre création';
          parfumContenance = items[0]?.ml ? items[0].ml + 'ml' : '';
        }
      } catch (e) {
        console.error('JSON Error:', e);
      }
    }

    // Envoyer l'email de notification si le client a un email
    if (clientEmail) {
      await envoyerEmailsCommande({
        id: commande.reference || commande.id?.toString(),
        clientNom: commande.client_nom || 'Client',
        clientTel: clientTel,
        clientEmail: clientEmail,
        parfum: parfumNom,
        contenance: parfumContenance,
        prix: commande.prix_total || 0,
        type: 'catalogue',
        notes: '✅ Votre commande est prête ! Venez la récupérer ou attendez la livraison.',
        dateCommande: new Date().toLocaleDateString('fr-FR'),
      })
    }

    // Lien WhatsApp de fallback
    const telPropre = clientTel.replace(/[^0-9]/g, '')
    const messageWA = encodeURIComponent(
      `Bonjour ${commande.client_nom || 'Client'} ! 🌹\n\nVotre commande Maya Bar #${commande.reference || commande.id} est prête !\n\nVenez la récupérer à la boutique ou contactez-nous pour la livraison.\n\nMerci de votre confiance ✨\n— Maya Bar à Senteurs`
    )
    const whatsappLink = `https://wa.me/${telPropre}?text=${messageWA}`

    return NextResponse.json({ success: true, whatsappLink })
  } catch (error: any) {
    console.error("Notify Error:", error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la notification: ' + (error?.message || String(error)) }, { status: 500 })
  }
}
