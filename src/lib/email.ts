import { Resend } from "resend";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CommandeEmailData {
  id: string;
  clientNom: string;
  clientTel: string;
  clientEmail?: string;
  parfum: string;
  contenance: string;
  gravure?: string;
  emballage?: string;
  prix: number;
  type: "catalogue" | "melange";
  notes?: string;
  dateCommande: string;
}

// ─── Template email ADMIN ─────────────────────────────────────────────────────
function templateAdmin(cmd: CommandeEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;background:#f5f0eb;color:#2c2416}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .header{background:linear-gradient(135deg,#1a0e05,#3d2b1a);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0}
  .header h1{color:#d4a96a;font-size:28px;letter-spacing:4px;text-transform:uppercase;font-weight:normal}
  .header p{color:#c4a882;font-size:13px;letter-spacing:2px;margin-top:6px}
  .badge{display:inline-block;background:#d4a96a;color:#1a0e05;padding:6px 18px;border-radius:20px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-top:16px}
  .body{background:#fff;padding:36px 30px}
  .stitle{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9b7d5a;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e8ddd0}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed #f0e8dc}
  .row:last-child{border-bottom:none}
  .lbl{font-size:12px;color:#9b7d5a;letter-spacing:1px;text-transform:uppercase;width:130px;flex-shrink:0}
  .val{font-size:14px;color:#2c2416;font-weight:600;text-align:right}
  .pbox{background:linear-gradient(135deg,#1a0e05,#3d2b1a);color:#d4a96a;padding:20px;border-radius:8px;text-align:center;margin:24px 0}
  .pbox .amt{font-size:32px;font-weight:bold}
  .pbox .lbl2{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c4a882;margin-top:4px}
  .actions{display:flex;gap:12px;margin:24px 0}
  .btn{flex:1;padding:14px;text-align:center;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
  .btn-wa{background:#25D366;color:white}
  .btn-adm{background:#1a0e05;color:#d4a96a}
  .footer{background:#faf7f3;padding:20px 30px;text-align:center;border-radius:0 0 12px 12px;border-top:1px solid #e8ddd0}
  .footer p{font-size:11px;color:#9b7d5a;letter-spacing:1px}
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>Maya Bar</h1><p>Senteurs · Marrakech</p>
    <div class="badge">✨ Nouvelle Commande</div>
  </div>
  <div class="body">
    <p class="stitle">Client</p>
    <div class="row"><span class="lbl">Nom</span><span class="val">${cmd.clientNom}</span></div>
    <div class="row"><span class="lbl">Téléphone</span><span class="val">${cmd.clientTel}</span></div>
    ${cmd.clientEmail ? `<div class="row"><span class="lbl">Email</span><span class="val">${cmd.clientEmail}</span></div>` : ""}
    <p class="stitle" style="margin-top:24px">Commande</p>
    <div class="row"><span class="lbl">Parfum</span><span class="val">${cmd.parfum}</span></div>
    <div class="row"><span class="lbl">Type</span><span class="val">${cmd.type === "catalogue" ? "🏺 Catalogue" : "✨ Sur mesure"}</span></div>
    <div class="row"><span class="lbl">Contenance</span><span class="val">${cmd.contenance}</span></div>
    ${cmd.gravure ? `<div class="row"><span class="lbl">Gravure</span><span class="val">"${cmd.gravure}"</span></div>` : ""}
    <div class="row"><span class="lbl">Référence</span><span class="val">#${cmd.id}</span></div>
    <div class="row"><span class="lbl">Date</span><span class="val">${cmd.dateCommande}</span></div>
    <div class="pbox"><div class="amt">${cmd.prix} FCFA</div><div class="lbl2">Montant total</div></div>
    <div class="actions">
      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "22600000000"}?text=Bonjour%20${encodeURIComponent(cmd.clientNom)}%2C%20commande%20re%C3%A7ue%20%E2%9C%85" class="btn btn-wa">💬 WhatsApp Client</a>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin" class="btn btn-adm">📋 Voir Admin</a>
    </div>
    ${cmd.notes ? `<p class="stitle">Notes</p><p style="font-size:13px;color:#4a3728;font-style:italic;padding:12px;background:#faf7f3;border-left:3px solid #d4a96a">${cmd.notes}</p>` : ""}
  </div>
  <div class="footer"><p>Maya Bar · Email automatique · Ne pas répondre</p></div>
</div></body></html>`;
}

// ─── Template email CLIENT ────────────────────────────────────────────────────
function templateClient(cmd: CommandeEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;background:#f5f0eb;color:#2c2416}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .header{background:linear-gradient(135deg,#1a0e05,#3d2b1a);padding:50px 30px;text-align:center;border-radius:12px 12px 0 0}
  .logo{color:#d4a96a;font-size:36px;letter-spacing:8px;text-transform:uppercase;font-weight:normal}
  .tagline{color:#c4a882;font-size:12px;letter-spacing:3px;margin-top:8px}
  .cbadge{display:inline-block;background:rgba(212,169,106,0.15);border:1px solid #d4a96a;color:#d4a96a;padding:8px 24px;border-radius:20px;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:24px}
  .body{background:#fff;padding:40px 30px}
  .recap{background:#faf7f3;border-radius:10px;padding:24px;margin:24px 0}
  .rtitle{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9b7d5a;margin-bottom:16px}
  .rrow{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e8ddd0;font-size:13px}
  .rrow:last-child{border-bottom:none}
  .rlbl{color:#9b7d5a}
  .rval{font-weight:600;color:#2c2416}
  .pline{display:flex;justify-content:space-between;background:#1a0e05;color:#d4a96a;padding:16px 20px;border-radius:8px;margin-top:8px;font-size:18px;font-weight:bold}
  .wa{background:linear-gradient(135deg,#1a5c2e,#25D366);padding:24px;border-radius:10px;text-align:center;margin:24px 0}
  .wa p{color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:1px;margin-bottom:12px}
  .wa a{display:inline-block;background:white;color:#1a5c2e;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold}
  .footer{background:#1a0e05;padding:20px 30px;text-align:center;border-radius:0 0 12px 12px}
  .footer p{font-size:10px;color:#9b7d5a;letter-spacing:1px;line-height:2}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo">Maya Bar</div>
    <div class="tagline">Senteurs · Marrakech</div>
    <div class="cbadge">✅ Commande Confirmée</div>
  </div>
  <div class="body">
    <p style="font-size:22px;color:#2c2416;margin-bottom:16px">Bonjour <span style="color:#9b5e2a">${cmd.clientNom}</span>,</p>
    <p style="font-size:14px;line-height:1.8;color:#5a4232;margin-bottom:32px">Votre commande a bien été reçue et est entre les mains de nos artisans parfumeurs.</p>
    <div class="recap">
      <p class="rtitle">📦 Votre commande</p>
      <div class="rrow"><span class="rlbl">Référence</span><span class="rval">#${cmd.id}</span></div>
      <div class="rrow"><span class="rlbl">Parfum</span><span class="rval">${cmd.parfum}</span></div>
      <div class="rrow"><span class="rlbl">Contenance</span><span class="rval">${cmd.contenance}</span></div>
      ${cmd.gravure ? `<div class="rrow"><span class="rlbl">Gravure</span><span class="rval">"${cmd.gravure}"</span></div>` : ""}
    </div>
    <div class="pline"><span>Total</span><span>${cmd.prix} FCFA</span></div>
    <div class="wa">
      <p>Une question ? Contactez-nous sur WhatsApp</p>
      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "22600000000"}?text=Bonjour%2C%20question%20sur%20commande%20%23${cmd.id}">💬 Nous contacter</a>
    </div>
    <div style="text-align:center;padding:24px 0">
      <p style="font-size:13px;color:#9b7d5a;line-height:2">Avec toute notre gratitude,</p>
      <p style="font-size:16px;color:#2c2416;font-style:italic">L'équipe Maya Bar</p>
      <p style="font-size:12px;color:#c4a882;margin-top:8px">✨ L'art du parfum depuis Marrakech</p>
    </div>
  </div>
  <div class="footer"><p>© Maya Bar · Senteurs · Marrakech</p></div>
</div></body></html>`;
}

// ─── Fonction principale d'envoi ──────────────────────────────────────────────
export async function envoyerEmailsCommande(cmd: CommandeEmailData): Promise<{
  success: boolean;
  adminSent: boolean;
  clientSent: boolean;
  error?: string;
}> {
  // Après — mets ta vraie clé :
  const resend = new Resend(process.env.RESEND_API_KEY ?? "re_ACXqtCPG_3mNow2dWddVvjUb4DAc71Dqe");
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  let adminSent = false;
  let clientSent = false;

  try {
    // 1. Email à l'admin
    if (adminEmail) {
      await resend.emails.send({
        from: "Maya Bar <onboarding@resend.dev>",
        to: adminEmail,
        subject: `✨ Nouvelle commande #${cmd.id} — ${cmd.clientNom} — ${cmd.prix} FCFA`,
        html: templateAdmin(cmd),
      });
      adminSent = true;
    }

    // 2. Email au client (si email fourni)
    if (cmd.clientEmail) {
      await resend.emails.send({
        from: "Maya Bar <onboarding@resend.dev>",
        to: cmd.clientEmail,
        subject: `✅ Votre commande Maya Bar #${cmd.id} est confirmée`,
        html: templateClient(cmd),
      });
      clientSent = true;
    }

    return { success: true, adminSent, clientSent };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return {
      success: false,
      adminSent,
      clientSent,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}