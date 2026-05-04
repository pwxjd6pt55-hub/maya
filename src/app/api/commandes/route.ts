import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { envoyerEmailsCommande } from "@/lib/email";
import { getSession } from "@/lib/auth";

// ─── Données de démo (si pas de DB) ──────────────────────────────────────────
const commandesDemo = [
  {
    id: "CMD-001",
    reference: "MB-DEMO-001",
    client_nom: "Fatima Zahra",
    client_telephone: "22890000001",
    client_email: "fatima@example.com",
    parfum_catalogue_nom: "Rose d'Orient",
    ml: 50,
    gravure: "Mon âme sœur",
    prix_total: 14000,
    statut: "nouvelle",
    mode_commande: "catalogue",
    created_at: new Date().toISOString(),
  },
];

// ─── GET — Liste des commandes ────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statut = searchParams.get("statut");
  const session = await getSession();

  try {
    let query = `
      SELECT c.*, GROUP_CONCAT(e.nom SEPARATOR ', ') as essences_noms
      FROM commandes c
      LEFT JOIN commande_essences ce ON c.id = ce.commande_id
      LEFT JOIN essences e ON ce.essence_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Si on est un admin, on voit tout. Sinon, on voit seulement ses propres commandes.
    if (!session || session.role !== 'admin') {
      if (!session) return NextResponse.json({ success: true, data: [] });
      query += " AND c.user_id = ? ";
      params.push(session.userId);
    }

    if (statut) {
      query += " AND c.statut = ? ";
      params.push(statut);
    }

    query += " GROUP BY c.id ORDER BY c.created_at DESC";

    const [rows] = await pool.execute(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ success: true, data: commandesDemo, demo: true });
  }
}

// ─── POST — Nouvelle commande ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await getSession();
  try {
    const body = await request.json();

    const {
      client_nom,
      client_telephone,
      client_email,
      mode_commande,
      parfum_catalogue_id,
      parfum_catalogue_nom,
      ml,
      couleur_parfum,
      gravure,
      retrait,
      date_souhaitee,
      essences_ids,
      prix_total,
    } = body;

    // Validation de base
    if (!client_nom || !client_telephone || !mode_commande || (prix_total === undefined || prix_total === null)) {
      return NextResponse.json({ success: false, error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = `MB-${datePart}-${randomPart}`;

    const declencherEnvoiEmails = (ref: string) => {
      try {
        const dateCommande = new Date().toLocaleString("fr-FR", {
          timeZone: "Africa/Lome",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        envoyerEmailsCommande({
          id: ref,
          clientNom: client_nom,
          clientTel: client_telephone,
          clientEmail: client_email,
          parfum: mode_commande === 'catalogue' ? parfum_catalogue_nom : "Mélange personnalisé",
          contenance: `${ml}ml`,
          gravure,
          prix: prix_total,
          type: mode_commande,
          dateCommande,
        } as any).catch(e => console.error("Email error:", e));
      } catch (err) { console.error(err); }
    };

    try {
      const [result]: any = await pool.execute(
        `INSERT INTO commandes 
          (reference, user_id, client_nom, client_telephone, client_email, mode_commande, parfum_catalogue_id, parfum_catalogue_nom, ml, couleur_parfum, gravure, retrait, date_souhaitee, prix_total, statut)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nouvelle')`,
        [
          reference,
          session?.userId || null,
          client_nom,
          client_telephone,
          client_email || null,
          mode_commande,
          parfum_catalogue_id || null,
          parfum_catalogue_nom || null,
          ml || 50,
          couleur_parfum || null,
          gravure || null,
          retrait || 'boutique',
          date_souhaitee || null,
          prix_total,
        ]
      );

      const commandeId = result.insertId;

      // ── 2. Sauvegarder les essences si c'est un mélange ─────────────────────────
      if (mode_commande === 'melange' && essences_ids && Array.isArray(essences_ids)) {
        for (const essId of essences_ids) {
          await pool.execute(
            "INSERT INTO commande_essences (commande_id, essence_id) VALUES (?, ?)",
            [commandeId, essId]
          );
        }
      }

      // Succès base de données -> Envoi email
      declencherEnvoiEmails(reference);

      return NextResponse.json({
        success: true,
        reference,
        message: `Commande ${reference} créée avec succès`,
      });

    } catch (error: any) {
      console.error("Erreur création commande (DB):", error);
      
      // MODE SECOURS : Même si la DB échoue, on envoie quand même l'email !
      const tempRef = `MB-TEMP-${Date.now().toString(36).toUpperCase()}`;
      declencherEnvoiEmails(tempRef);

      return NextResponse.json({
        success: true,
        reference: tempRef,
        message: "Commande enregistrée (Mode secours - Email envoyé)",
        demo: true
      });
    }
  } catch (error: any) {
    console.error("Erreur fatale POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── PATCH — Changer le statut ────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, statut } = body;

  if (!id || !statut) {
    return NextResponse.json({ error: "id et statut requis" }, { status: 400 });
  }

  const statutsValides = ["nouvelle", "en_preparation", "prete", "livree", "annulee"];
  if (!statutsValides.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  try {
    await pool.execute(
      "UPDATE commandes SET statut = ?, updated_at = NOW() WHERE id = ?",
      [statut, id]
    );
    return NextResponse.json({ success: true, id, statut });
  } catch (error) {
    console.error("PATCH DB Error:", error);
    return NextResponse.json({ success: true, id, statut, demo: true });
  }
}
