import nodemailer from "nodemailer";

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

// ─── Transporter Gmail ────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,       // ton adresse Gmail
      pass: process.env.GMAIL_APP_PASSWORD, // mot de passe d'application Google
    },
  });
}

// ─── Template email ADMIN ─────────────────────────────────────────────────────
function templateAdmin(cmd: CommandeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Nouvelle commande Maya Bar</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background:#f5f0eb; color:#2c2416; }
  .wrapper { max-width:600px; margin:0 auto; padding:20px; }
  .header { background:linear-gradient(135deg,#1a0e05 0%,#3d2b1a 100%); padding:40px 30px; text-align:center; border-radius:12px 12px 0 0; }
  .header h1 { color:#d4a96a; font-size:28px; letter-spacing:4px; text-transform:uppercase; font-weight:normal; }
  .header p { color:#c4a882; font-size:13px; letter-spacing:2px; margin-top:6px; }
  .badge { display:inline-block; background:#d4a96a; color:#1a0e05; padding:6px 18px; border-radius:20px; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; margin-top:16px; }
  .body { background:#fff; padding:36px 30px; }
  .section-title { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#9b7d5a; margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid #e8ddd0; }
  .info-row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px dashed #f0e8dc; }
  .info-row:last-child { border-bottom:none; }
  .info-label { font-size:12px; color:#9b7d5a; letter-spacing:1px; text-transform:uppercase; width:130px; flex-shrink:0; }
  .info-value { font-size:14px; color:#2c2416; font-weight:600; text-align:right; }
  .price-box { background:linear-gradient(135deg,#1a0e05,#3d2b1a); color:#d4a96a; padding:20px; border-radius:8px; text-align:center; margin:24px 0; }
  .price-box .amount { font-size:32px; font-weight:bold; }
  .price-box .label { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#c4a882; margin-top:4px; }
  .actions { display:flex; gap:12px; margin:24px 0; }
  .btn { flex:1; padding:14px; text-align:center; border-radius:8px; text-decoration:none; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; }
  .btn-whatsapp { background:#25D366; color:white; }
  .btn-admin { background:#1a0e05; color:#d4a96a; }
  .notes-box { background:#faf7f3; border-left:3px solid #d4a96a; padding:14px 16px; border-radius:0 6px 6px 0; font-size:13px; color:#4a3728; font-style:italic; }
  .footer { background:#faf7f3; padding:20px 30px; text-align:center; border-radius:0 0 12px 12px; border-top:1px solid #e8ddd0; }
  .footer p { font-size:11px; color:#9b7d5a; letter-spacing:1px; }
  .id-badge { font-family: monospace; background:#f0e8dc; padding:2px 8px; border-radius:4px; font-size:11px; color:#9b7d5a; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Maya Bar</h1>
    <p>Senteurs · Lomé</p>
    <div class="badge">✨ Nouvelle Commande</div>
  </div>

  <div class="body">
    <!-- Client -->
    <p class="section-title">Client</p>
    <div class="info-row">
      <span class="info-label">Nom</span>
      <span class="info-value">${cmd.clientNom}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Téléphone</span>
      <span class="info-value">${cmd.clientTel}</span>
    </div>
    ${cmd.clientEmail ? `
    <div class="info-row">
      <span class="info-label">Email</span>
      <span class="info-value">${cmd.clientEmail}</span>
    </div>` : ""}

    <!-- Commande -->
    <p class="section-title" style="margin-top:24px;">Détail de la commande</p>
    <div class="info-row">
      <span class="info-label">Parfum</span>
      <span class="info-value">${cmd.parfum}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Type</span>
      <span class="info-value">${cmd.type === "catalogue" ? "🏺 Catalogue" : "✨ Mélange sur mesure"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Contenance</span>
      <span class="info-value">${cmd.contenance}</span>
    </div>
    ${cmd.gravure ? `
    <div class="info-row">
      <span class="info-label">Gravure</span>
      <span class="info-value">"${cmd.gravure}"</span>
    </div>` : ""}
    ${cmd.emballage ? `
    <div class="info-row">
      <span class="info-label">Emballage</span>
      <span class="info-value">${cmd.emballage}</span>
    </div>` : ""}
    <div class="info-row">
      <span class="info-label">Date</span>
      <span class="info-value">${cmd.dateCommande}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Référence</span>
      <span class="info-value"><span class="id-badge">#${cmd.id}</span></span>
    </div>

    <!-- Prix -->
    <div class="price-box">
      <div class="amount">${cmd.prix} FCFA</div>
      <div class="label">Montant total</div>
    </div>

    <!-- Actions rapides -->
    <div class="actions">
      <a href="https://wa.me/228${cmd.clientTel.replace(/^0/, "").replace(/\s/g, "")}?text=Bonjour%20${encodeURIComponent(cmd.clientNom)}%2C%20votre%20commande%20Maya%20Bar%20%23${cmd.id}%20est%20bien%20re%C3%A7ue%20%E2%9C%85" class="btn btn-whatsapp">
        💬 WhatsApp Client
      </a>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin" class="btn btn-admin">
        📋 Voir dans l'admin
      </a>
    </div>

    ${cmd.notes ? `
    <p class="section-title">Notes / Demandes spéciales</p>
    <div class="notes-box">${cmd.notes}</div>` : ""}
  </div>

  <div class="footer">
    <p>Maya Bar · Senteurs · Email automatique · Ne pas répondre directement</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Template email CLIENT ────────────────────────────────────────────────────
function templateClient(cmd: CommandeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Votre commande Maya Bar</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background:#f5f0eb; color:#2c2416; }
  .wrapper { max-width:600px; margin:0 auto; padding:20px; }
  .header { background:linear-gradient(135deg,#1a0e05 0%,#3d2b1a 100%); padding:50px 30px; text-align:center; border-radius:12px 12px 0 0; }
  .logo { color:#d4a96a; font-size:36px; letter-spacing:8px; text-transform:uppercase; font-weight:normal; }
  .tagline { color:#c4a882; font-size:12px; letter-spacing:3px; margin-top:8px; }
  .confirm-badge { display:inline-block; background:rgba(212,169,106,0.15); border:1px solid #d4a96a; color:#d4a96a; padding:8px 24px; border-radius:20px; font-size:12px; letter-spacing:3px; text-transform:uppercase; margin-top:24px; }
  .body { background:#fff; padding:40px 30px; }
  .greeting { font-size:22px; color:#2c2416; margin-bottom:16px; }
  .greeting span { color:#9b5e2a; }
  .intro { font-size:14px; line-height:1.8; color:#5a4232; margin-bottom:32px; }
  .recap { background:#faf7f3; border-radius:10px; padding:24px; margin:24px 0; }
  .recap-title { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#9b7d5a; margin-bottom:16px; }
  .recap-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e8ddd0; font-size:13px; }
  .recap-row:last-child { border-bottom:none; }
  .recap-label { color:#9b7d5a; }
  .recap-value { font-weight:600; color:#2c2416; }
  .price-line { display:flex; justify-content:space-between; background:#1a0e05; color:#d4a96a; padding:16px 20px; border-radius:8px; margin-top:8px; font-size:18px; font-weight:bold; }
  .steps { margin:32px 0; }
  .step { display:flex; align-items:flex-start; gap:16px; padding:14px 0; border-bottom:1px solid #f0e8dc; }
  .step:last-child { border-bottom:none; }
  .step-num { background:#d4a96a; color:#1a0e05; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; }
  .step-text { font-size:13px; color:#4a3728; line-height:1.6; }
  .step-text strong { color:#2c2416; display:block; margin-bottom:2px; }
  .whatsapp-cta { background:linear-gradient(135deg,#1a5c2e,#25D366); padding:24px; border-radius:10px; text-align:center; margin:24px 0; }
  .whatsapp-cta p { color:rgba(255,255,255,0.85); font-size:12px; letter-spacing:1px; margin-bottom:12px; }
  .whatsapp-btn { display:inline-block; background:white; color:#1a5c2e; padding:12px 28px; border-radius:6px; text-decoration:none; font-size:13px; font-weight:bold; letter-spacing:1px; }
  .signature { text-align:center; padding:24px 0; }
  .signature p { font-size:13px; color:#9b7d5a; line-height:2; }
  .signature .name { font-size:16px; color:#2c2416; font-style:italic; }
  .footer { background:#1a0e05; padding:20px 30px; text-align:center; border-radius:0 0 12px 12px; }
  .footer p { font-size:10px; color:#9b7d5a; letter-spacing:1px; line-height:2; }
  .footer a { color:#d4a96a; text-decoration:none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Maya Bar</div>
    <div class="tagline">Senteurs · Lomé</div>
    <div class="confirm-badge">✅ Commande Confirmée</div>
  </div>

  <div class="body">
    <p class="greeting">Bonjour <span>${cmd.clientNom}</span>,</p>
    <p class="intro">
      Votre commande a bien été reçue et est maintenant entre les mains expertes de nos artisans parfumeurs. 
      Nous avons hâte de vous faire vivre cette expérience olfactive unique.
    </p>

    <!-- Récapitulatif -->
    <div class="recap">
      <p class="recap-title">📦 Votre commande</p>
      <div class="recap-row">
        <span class="recap-label">Référence</span>
        <span class="recap-value">#${cmd.id}</span>
      </div>
      <div class="recap-row">
        <span class="recap-label">Parfum</span>
        <span class="recap-value">${cmd.parfum}</span>
      </div>
      <div class="recap-row">
        <span class="recap-label">Contenance</span>
        <span class="recap-value">${cmd.contenance}</span>
      </div>
      ${cmd.gravure ? `
      <div class="recap-row">
        <span class="recap-label">Gravure personnalisée</span>
        <span class="recap-value">"${cmd.gravure}"</span>
      </div>` : ""}
      ${cmd.emballage ? `
      <div class="recap-row">
        <span class="recap-label">Emballage</span>
        <span class="recap-value">${cmd.emballage}</span>
      </div>` : ""}
    </div>
    <div class="price-line">
      <span>Total</span>
      <span>${cmd.prix} FCFA</span>
    </div>

    <!-- Étapes suivantes -->
    <div class="steps">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9b7d5a;margin-bottom:8px;">Prochaines étapes</p>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">
          <strong>Préparation artisanale</strong>
          Votre parfum est préparé avec soin dans nos ateliers.
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">
          <strong>Notification WhatsApp</strong>
          Vous recevrez un message dès que votre commande est prête.
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">
          <strong>Retrait ou livraison</strong>
          Récupérez votre création ou faites-vous livrer.
        </div>
      </div>
    </div>

    <!-- WhatsApp CTA -->
    <div class="whatsapp-cta">
      <p>Une question ? Contactez-nous directement sur WhatsApp</p>
      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000"}?text=Bonjour%2C%20j%27ai%20une%20question%20sur%20ma%20commande%20%23${cmd.id}" class="whatsapp-btn">
        💬 Nous contacter
      </a>
    </div>

    <!-- Signature -->
    <div class="signature">
      <p>Avec toute notre gratitude,</p>
      <p class="name">L'équipe Maya Bar</p>
      <p style="font-size:12px;color:#c4a882;margin-top:8px;">✨ L'art du parfum depuis Lomé</p>
    </div>
  </div>

  <div class="footer">
    <p>© Maya Bar · Senteurs · Lomé</p>
    <p>Cet email est envoyé automatiquement suite à votre commande.</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Fonction principale d'envoi ──────────────────────────────────────────────
export async function envoyerEmailsCommande(cmd: CommandeEmailData): Promise<{
  success: boolean;
  adminSent: boolean;
  clientSent: boolean;
  error?: string;
}> {
  const transporter = createTransporter();
  const adminEmail = process.env.GMAIL_USER;
  let adminSent = false;
  let clientSent = false;

  try {
    // 1. Email à l'admin (toi)
    if (adminEmail) {
      await transporter.sendMail({
        from: `"Maya Bar 🌸" <${adminEmail}>`,
        to: adminEmail,
        subject: `✨ Nouvelle commande #${cmd.id} — ${cmd.clientNom} — ${cmd.prix} FCFA`,
        html: templateAdmin(cmd),
      });
      adminSent = true;
    }

    // 2. Email au client (si email fourni)
    if (cmd.clientEmail) {
      await transporter.sendMail({
        from: `"Maya Bar 🌸" <${adminEmail}>`,
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
