import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { envoyerEmailsCommande } from "@/lib/email";

export async function GET(request: NextRequest) {
  const session = await getSession();
  try {
    const params: any[] = [];
    let query = `SELECT * FROM commandes WHERE 1=1`;
    if (!session || session.role !== 'admin') {
      if (!session) return NextResponse.json({ success: true, data: [] });
      query += ` AND user_id = $${params.length + 1} `;
      params.push(session.userId);
    }
    query += " ORDER BY created_at DESC";
    const { rows } = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  try {
    const body = await request.json();
    const { items, prix_total, telephone, adresse, mode_livraison, nom, email } = body;

    if (!items || items.length === 0 || !telephone) {
      return NextResponse.json({ success: false, error: "Champs manquants" }, { status: 400 });
    }

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const createdReferences: string[] = [];

    // On boucle sur chaque article — chaque article = une référence unique
    for (const item of items) {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const reference = `MB-${datePart}-${randomPart}`;

      await pool.query(
        `INSERT INTO commandes 
          (reference, user_id, client_nom, client_telephone, client_email, mode_commande, 
           parfum_catalogue_id, parfum_catalogue_nom, ml, gravure, prix_total, statut, retrait)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'nouvelle', $12)`,
        [
          reference,
          session?.userId || null,
          nom || 'Client Maya',
          telephone,
          email || null,
          item.item_type || 'melange',
          item.parfum_catalogue_id || null,
          item.nom_personnalise || null,
          item.ml || 50,
          item.gravure || null,
          item.prix || (prix_total / items.length),
          mode_livraison === 'retrait' ? 'boutique' : 'livraison'
        ]
      );
      createdReferences.push(reference);
    }

    // ─── ENVOI DES EMAILS ───
    // On envoie un email récapitulatif pour la commande (basé sur le premier article pour le template)
    try {
      const firstItem = items[0];
      await envoyerEmailsCommande({
        id: createdReferences.join(', '),
        clientNom: nom || 'Client Maya',
        clientTel: telephone,
        clientEmail: email,
        parfum: items.length > 1 ? `${firstItem.nom_personnalise} (+ ${items.length - 1} autres)` : firstItem.nom_personnalise,
        contenance: `${firstItem.ml}ml`,
        gravure: firstItem.gravure,
        prix: prix_total,
        type: firstItem.item_type,
        dateCommande: new Date().toLocaleDateString('fr-FR')
      });
    } catch (emailErr) {
      console.error("Email sending failed but order was saved:", emailErr);
    }

    return NextResponse.json({ success: true, reference: createdReferences[0], references: createdReferences });
  } catch (error: any) {
    console.error("Erreur POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, statut } = await request.json();
    await pool.query("UPDATE commandes SET statut = $1 WHERE id = $2", [statut, id]);
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ success: false }, { status: 500 }); }
}
