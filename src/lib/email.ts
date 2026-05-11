import nodemailer from 'nodemailer';

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
  type: "catalogue" | "melange" | "melange_essences" | "melange_parfums";
  notes?: string;
  dateCommande: string;
}

// ─── Transporter Nodemailer (Gmail SMTP) ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Aide à passer sur certains serveurs cloud
  },
  connectionTimeout: 10000, // 10 secondes max pour se connecter
  greetingTimeout: 10000,
});

// Vérifier la connexion SMTP au démarrage (optionnel mais utile pour le debug)
transporter.verify(function(error, success) {
  if (error) {
    console.error("❌ Erreur de configuration SMTP:", error);
  } else {
    console.log("✅ Serveur SMTP prêt à envoyer des messages");
  }
});

const PRIMARY_COLOR = "#BC7C7C";

// ─── Template email ADMIN ─────────────────────────────────────────────────────
function templateAdmin(cmd: CommandeEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family: 'Jost', Georgia, serif; background:#f9f5f4; color:#3D2B1F}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .header{background:#0D0800;padding:40px 30px;text-align:center;border-radius:12px 12px 0 0}
  .header h1{color:#BC7C7C;font-size:28px;letter-spacing:6px;text-transform:uppercase;font-weight:bold}
  .header p{color:#8B5E5E;font-size:11px;letter-spacing:3px;margin-top:8px;text-transform:uppercase}
  .badge{display:inline-block;background:#BC7C7C;color:white;padding:8px 20px;border-radius:4px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-top:20px}
  .body{background:#fff;padding:40px 30px;border-left:1px solid #eee;border-right:1px solid #eee}
  .stitle{font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#BC7C7C;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #f0e8e8;font-weight:bold}
  .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #f0e8e8}
  .row:last-child{border-bottom:none}
  .lbl{font-size:11px;color:#8B5E5E;letter-spacing:1px;text-transform:uppercase;width:130px;flex-shrink:0}
  .val{font-size:14px;color:#0D0800;font-weight:600;text-align:right}
  .pbox{background:#0D0800;color:#BC7C7C;padding:30px;border-radius:4px;text-align:center;margin:30px 0}
  .pbox .amt{font-size:36px;font-weight:bold}
  .pbox .lbl2{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#8B5E5E;margin-top:6px}
  .actions{display:flex;gap:12px;margin:30px 0}
  .btn{flex:1;padding:16px;text-align:center;border-radius:4px;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
  .btn-wa{background:#25D366;color:white}
  .btn-adm{background:#BC7C7C;color:white}
  .footer{background:#0D0800;padding:30px;text-align:center;border-radius:0 0 12px 12px}
  .footer p{font-size:10px;color:#8B5E5E;letter-spacing:2px;text-transform:uppercase}
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>MAYA BAR</h1><p>Bar à Senteurs · Lomé</p>
    <div class="badge">Nouvelle Commande</div>
  </div>
  <div class="body">
    <p class="stitle">Informations Client</p>
    <div class="row"><span class="lbl">Nom</span><span class="val">${cmd.clientNom}</span></div>
    <div class="row"><span class="lbl">WhatsApp</span><span class="val">${cmd.clientTel}</span></div>
    ${cmd.clientEmail ? `<div class="row"><span class="lbl">Email</span><span class="val">${cmd.clientEmail}</span></div>` : ""}
    <p class="stitle" style="margin-top:30px">Détails de la Création</p>
    <div class="row"><span class="lbl">Parfum</span><span class="val">${cmd.parfum}</span></div>
    <div class="row"><span class="lbl">Type</span><span class="val">${cmd.type.replace('_', ' ')}</span></div>
    <div class="row"><span class="lbl">Format</span><span class="val">${cmd.contenance}</span></div>
    ${cmd.gravure ? `<div class="row"><span class="lbl">Gravure</span><span class="val">"${cmd.gravure}"</span></div>` : ""}
    <div class="row"><span class="lbl">Référence</span><span class="val">#${cmd.id}</span></div>
    <div class="pbox"><div class="amt">${cmd.prix.toLocaleString()} F</div><div class="lbl2">Montant à percevoir</div></div>
  </div>
  <div class="footer"><p>Maya Bar à Senteurs · Lomé, Togo</p></div>
</div></body></html>`;
}

// ─── Template email CLIENT ────────────────────────────────────────────────────
function templateClient(cmd: CommandeEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family: 'Jost', Georgia, serif; background:#f9f5f4; color:#3D2B1F}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .header{background:#0D0800;padding:50px 30px;text-align:center;border-radius:12px 12px 0 0}
  .logo{color:#BC7C7C;font-size:32px;letter-spacing:10px;text-transform:uppercase;font-weight:bold}
  .tagline{color:#8B5E5E;font-size:11px;letter-spacing:4px;margin-top:10px;text-transform:uppercase}
  .body{background:#fff;padding:50px 40px;border-left:1px solid #eee;border-right:1px solid #eee}
  .recap{background:#fdfaf9;border:1px solid #f0e8e8;border-radius:4px;padding:30px;margin:30px 0}
  .rtitle{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#BC7C7C;margin-bottom:20px;font-weight:bold}
  .rrow{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #f0e8e8;font-size:13px}
  .rrow:last-child{border-bottom:none}
  .rlbl{color:#8B5E5E;text-transform:uppercase;font-size:10px;letter-spacing:1px}
  .rval{font-weight:600;color:#0D0800}
  .pline{display:flex;justify-content:space-between;background:#0D0800;color:#BC7C7C;padding:20px 30px;border-radius:4px;margin-top:10px;font-size:20px;font-weight:bold}
  .wa{background:#BC7C7C;padding:30px;border-radius:4px;text-align:center;margin:40px 0}
  .wa p{color:white;font-size:12px;letter-spacing:1px;margin-bottom:15px;text-transform:uppercase;font-weight:bold}
  .wa a{display:inline-block;background:white;color:#BC7C7C;padding:14px 30px;border-radius:2px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
  .footer{background:#0D0800;padding:30px;text-align:center;border-radius:0 0 12px 12px}
  .footer p{font-size:9px;color:#8B5E5E;letter-spacing:2px;text-transform:uppercase;line-height:2}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo">MAYA BAR</div>
    <div class="tagline">Bar à Senteurs · Lomé</div>
  </div>
  <div class="body">
    <p style="font-size:24px;color:#0D0800;margin-bottom:20px;font-family:Georgia,serif">Bonjour <span style="color:#BC7C7C;font-style:italic">${cmd.clientNom}</span>,</p>
    <p style="font-size:14px;line-height:1.8;color:#8B5E5E;margin-bottom:32px">Votre création est désormais entre les mains de nos artisans. Nous préparons votre flacon avec le plus grand soin.</p>
    <div class="recap">
      <p class="rtitle">Détails de la réservation</p>
      <div class="rrow"><span class="rlbl">Référence</span><span class="rval">#${cmd.id}</span></div>
      <div class="rrow"><span class="rlbl">Fragrance</span><span class="rval">${cmd.parfum}</span></div>
      <div class="rrow"><span class="rlbl">Format</span><span class="rval">${cmd.contenance}</span></div>
      ${cmd.gravure ? `<div class="rrow"><span class="rlbl">Gravure</span><span class="rval">"${cmd.gravure}"</span></div>` : ""}
    </div>
    <div class="pline"><span>Total</span><span>${cmd.prix.toLocaleString()} F</span></div>
    <div class="wa">
      <p>Suivre ma commande sur WhatsApp</p>
      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "22870993597"}?text=Bonjour%2C%20je%20souhaite%20suivre%20ma%20commande%20%23${cmd.id}">Nous contacter</a>
    </div>
    <div style="text-align:center;padding:40px 0 0">
      <p style="font-size:12px;color:#BC7C7C;letter-spacing:2px;text-transform:uppercase;font-weight:bold">L&apos;art du parfum sur-mesure</p>
      <p style="font-size:14px;color:#8B5E5E;font-style:italic;margin-top:10px">L&apos;équipe Maya Bar à Senteurs</p>
    </div>
  </div>
  <div class="footer"><p>© Maya Bar · Lomé, Togo · Haute Parfumerie Artisanale</p></div>
</div></body></html>`;
}

// ─── Template Commande Prête ──────────────────────────────────────────────────
function templateCommandePrete(cmd: CommandeEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family: 'Jost', Georgia, serif; background:#f9f5f4; color:#3D2B1F}
  .wrap{max-width:600px;margin:0 auto;padding:20px}
  .header{background:#0D0800;padding:50px 30px;text-align:center;border-radius:12px 12px 0 0}
  .logo{color:#BC7C7C;font-size:32px;letter-spacing:10px;text-transform:uppercase;font-weight:bold}
  .tagline{color:#8B5E5E;font-size:11px;letter-spacing:4px;margin-top:10px;text-transform:uppercase}
  .body{background:#fff;padding:50px 40px;border-left:1px solid #eee;border-right:1px solid #eee}
  .recap{background:#fdfaf9;border:1px solid #f0e8e8;border-radius:4px;padding:30px;margin:30px 0}
  .rtitle{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#BC7C7C;margin-bottom:20px;font-weight:bold}
  .rrow{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #f0e8e8;font-size:13px}
  .rrow:last-child{border-bottom:none}
  .rlbl{color:#8B5E5E;text-transform:uppercase;font-size:10px;letter-spacing:1px}
  .rval{font-weight:600;color:#0D0800}
  .wa{background:#BC7C7C;padding:30px;border-radius:4px;text-align:center;margin:40px 0}
  .wa p{color:white;font-size:12px;letter-spacing:1px;margin-bottom:15px;text-transform:uppercase;font-weight:bold}
  .wa a{display:inline-block;background:white;color:#BC7C7C;padding:14px 30px;border-radius:2px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
  .footer{background:#0D0800;padding:30px;text-align:center;border-radius:0 0 12px 12px}
  .footer p{font-size:9px;color:#8B5E5E;letter-spacing:2px;text-transform:uppercase;line-height:2}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo">MAYA BAR</div>
    <div class="tagline">Bar à Senteurs · Lomé</div>
  </div>
  <div class="body">
    <p style="font-size:24px;color:#0D0800;margin-bottom:20px;font-family:Georgia,serif">Bonjour <span style="color:#BC7C7C;font-style:italic">${cmd.clientNom}</span>,</p>
    <p style="font-size:14px;line-height:1.8;color:#8B5E5E;margin-bottom:32px">Excellente nouvelle ! Votre création parfumée est <strong style="color:#BC7C7C;text-transform:uppercase;">prête</strong>.</p>
    <p style="font-size:14px;line-height:1.8;color:#8B5E5E;margin-bottom:32px">Vous pouvez passer la récupérer à notre boutique ou nous contacter pour organiser une livraison.</p>
    <div class="recap">
      <p class="rtitle">Détails de la commande</p>
      <div class="rrow"><span class="rlbl">Référence</span><span class="rval">#${cmd.id}</span></div>
      <div class="rrow"><span class="rlbl">Fragrance</span><span class="rval">${cmd.parfum}</span></div>
      <div class="rrow"><span class="rlbl">Format</span><span class="rval">${cmd.contenance}</span></div>
    </div>
    <div class="wa">
      <p>Organiser la récupération</p>
      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "22870993597"}?text=Bonjour%2C%20je%20viens%20récupérer%20ma%20commande%20%23${cmd.id}">Nous contacter sur WhatsApp</a>
    </div>
    <div style="text-align:center;padding:40px 0 0">
      <p style="font-size:12px;color:#BC7C7C;letter-spacing:2px;text-transform:uppercase;font-weight:bold">L&apos;art du parfum sur-mesure</p>
      <p style="font-size:14px;color:#8B5E5E;font-style:italic;margin-top:10px">L&apos;équipe Maya Bar à Senteurs</p>
    </div>
  </div>
  <div class="footer"><p>© Maya Bar · Lomé, Togo · Haute Parfumerie Artisanale</p></div>
</div></body></html>`;
}

// ─── Fonction principale d'envoi ──────────────────────────────────────────────
export async function envoyerEmailsCommande(cmd: CommandeEmailData): Promise<{
  success: boolean;
  adminSent: boolean;
  clientSent: boolean;
  error?: string;
}> {
  console.log('--- EMAIL : Tentative d\'envoi via GMAIL SMTP ---');
  const adminEmail = process.env.ADMIN_EMAIL || "kougnimag@gmail.com";
  let adminSent = false;
  let clientSent = false;

  try {
    // 1. Email à l'admin
    console.log(`Envoi email admin à: ${adminEmail}`);
    await transporter.sendMail({
      from: `"Maya Bar" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `✨ NOUVELLE COMMANDE #${cmd.id} — ${cmd.clientNom}`,
      html: templateAdmin(cmd),
    });
    adminSent = true;
    console.log("✅ Email Admin envoyé");

    // 2. Email au client
    if (cmd.clientEmail) {
      console.log(`Envoi email client à: ${cmd.clientEmail}`);
      await transporter.sendMail({
        from: `"Maya Bar" <${process.env.GMAIL_USER}>`,
        to: cmd.clientEmail,
        subject: `Votre Signature Maya Bar est réservée — #${cmd.id}`,
        html: templateClient(cmd),
      });
      clientSent = true;
      console.log("✅ Email Client envoyé");
    }

    return { success: true, adminSent, clientSent };
  } catch (error: any) {
    console.error("Erreur SMTP:", error);
    return { success: false, adminSent, clientSent, error: error.message };
  }
}

// ─── Email de Bienvenue ───────────────────────────────────────────────────────
export async function envoyerEmailBienvenue(nom: string, email: string) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  body{font-family: 'Jost', Georgia, serif; background:#f9f5f4; color:#3D2B1F; margin:0; padding:20px}
  .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee}
  .header{background:#0D0800;padding:40px 30px;text-align:center}
  .logo{color:#BC7C7C;font-size:28px;letter-spacing:6px;text-transform:uppercase;font-weight:bold}
  .tagline{color:#8B5E5E;font-size:10px;letter-spacing:3px;margin-top:8px;text-transform:uppercase}
  .body{padding:40px 30px; text-align:center;}
  h2{font-size:24px;color:#0D0800;margin-bottom:20px;font-family:Georgia,serif}
  p{font-size:14px;line-height:1.8;color:#8B5E5E;margin-bottom:30px}
  .btn{display:inline-block;background:#BC7C7C;color:white;padding:14px 30px;border-radius:4px;text-decoration:none;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
  .footer{background:#0D0800;padding:30px;text-align:center}
  .footer p{font-size:9px;color:#8B5E5E;letter-spacing:2px;text-transform:uppercase;margin:0}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo">MAYA BAR</div><div class="tagline">Bar à Senteurs · Lomé</div>
  </div>
  <div class="body">
    <h2>Bienvenue dans l'Élite Maya, <span style="color:#BC7C7C;font-style:italic">${nom}</span></h2>
    <p>Votre compte a été créé avec succès. Vous faites désormais partie du cercle fermé des amateurs de haute parfumerie artisanale du Togo.</p>
    <p>Nous vous invitons à explorer notre collection ou à créer votre propre parfum sur-mesure au bar à senteurs.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/configurateur" class="btn">Créer mon parfum</a>
  </div>
  <div class="footer"><p>© Maya Bar · Lomé, Togo</p></div>
</div></body></html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Maya Bar" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Bienvenue chez Maya Bar à Senteurs ✨`,
      html,
    });
    console.log("✅ Bienvenue envoyé:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Erreur envoi bienvenue:", error);
    return { success: false, error: error.message };
  }
}

// ─── Fonction : Commande Prête ────────────────────────────────────────────────
export async function envoyerEmailCommandePrete(cmd: CommandeEmailData): Promise<{ success: boolean; error?: string; }> {
  console.log('--- EMAIL : Envoi Notification Commande Prête via SMTP ---');
  try {
    await transporter.sendMail({
      from: `"Maya Bar" <${process.env.GMAIL_USER}>`,
      to: cmd.clientEmail!,
      subject: `Votre création Maya Bar est prête ! ✨ — #${cmd.id}`,
      html: templateCommandePrete(cmd),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Erreur SMTP prete:", error);
    return { success: false, error: error.message };
  }
}