/**
 * 📧 GESTIONNAIRE D'EMAILS - MAYA BAR (VERSION BREVO API)
 * 
 * Cette version utilise l'API HTTP de Brevo pour garantir l'envoi
 * même sur des hébergeurs comme Render qui bloquent le SMTP.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Fonction générique pour envoyer un e-mail via l'API Brevo
 */
async function sendBrevoEmail(subject: string, htmlContent: string, toEmail: string, toName: string = "") {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { 
          name: "Maya Bar à Senteurs", 
          email: process.env.SENDER_EMAIL || "kougnimag@gmail.com" 
        },
        to: toName ? [{ email: toEmail, name: toName }] : [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur API Brevo:", data);
      return { success: false, error: data.message || "Erreur API" };
    }

    console.log(`✅ Email envoyé à ${toEmail} (ID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Erreur réseau Brevo:", error);
    return { success: false, error: error.message };
  }
}

// ─── TEMPLATES D'EMAILS ────────────────────────────────────────────────────────

function templateNouvelleCommande(commande: any) {
  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h1 style="color: #d4af37; text-align: center;">Nouvelle Commande ! 🛍️</h1>
      <p>Une nouvelle commande vient d'être passée sur le site.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p><strong>Référence :</strong> ${commande.reference}</p>
        <p><strong>Client :</strong> ${commande.nom} (${commande.email})</p>
        <p><strong>Téléphone :</strong> ${commande.telephone}</p>
        <p><strong>Mode :</strong> ${commande.mode_commande === 'livraison' ? '🚚 Livraison' : '🏪 Retrait en boutique'}</p>
        <p><strong>Total :</strong> ${commande.total} FCFA</p>
      </div>
      <p style="text-align: center; margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin-maya-2026" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir dans l'admin</a>
      </p>
    </div>
  `;
}

function templateCommandeClient(commande: any) {
  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h1 style="color: #d4af37; text-align: center;">Merci pour votre commande ! ✨</h1>
      <p>Bonjour ${commande.nom},</p>
      <p>Nous avons bien reçu votre commande <strong>#${commande.reference}</strong>.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p><strong>Statut :</strong> En cours de préparation</p>
        <p><strong>Mode :</strong> ${commande.mode_commande === 'livraison' ? 'Livraison à domicile' : 'Retrait en boutique'}</p>
        <p><strong>Total :</strong> ${commande.total} FCFA</p>
      </div>
      <p>Nous vous contacterons dès que votre commande sera prête.</p>
      <p>À bientôt,<br>L'équipe Maya Bar</p>
    </div>
  `;
}

function templateCommandePrete(commande: any) {
  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h1 style="color: #4CAF50; text-align: center;">Votre commande est prête ! 🎉</h1>
      <p>Bonjour ${commande.nom},</p>
      <p>Bonne nouvelle ! Votre commande <strong>#${commande.reference}</strong> est maintenant prête.</p>
      <div style="background: #f1f8e9; padding: 15px; border-radius: 5px; border-left: 5px solid #4CAF50;">
        <p><strong>Mode choisi :</strong> ${commande.mode_commande === 'livraison' ? '🚚 En cours de livraison' : '🏪 Disponible au retrait en boutique'}</p>
      </div>
      <p>Nous vous remercions de votre confiance.</p>
      <p>À bientôt,<br>L'équipe Maya Bar à Senteurs</p>
    </div>
  `;
}

// ─── FONCTIONS D'ENVOI ─────────────────────────────────────────────────────────

export async function envoyerEmailsCommande(commande: any) {
  console.log("📨 Envoi des emails de commande via Brevo...");
  
  // 1. Email pour l'admin
  const resAdmin = await sendBrevoEmail(
    `Nouvelle commande #${commande.reference}`,
    templateNouvelleCommande(commande),
    process.env.ADMIN_EMAIL || "kougnimag@gmail.com",
    "Admin Maya Bar"
  );

  // 2. Email pour le client
  const resClient = await sendBrevoEmail(
    `Confirmation de votre commande #${commande.reference} - Maya Bar`,
    templateCommandeClient(commande),
    commande.email,
    commande.nom
  );

  return { admin: resAdmin.success, client: resClient.success };
}

export async function envoyerEmailCommandePrete(commande: any) {
  console.log("📨 Envoi de l'email 'Commande Prête' via Brevo...");
  return await sendBrevoEmail(
    `Votre commande #${commande.reference} est prête ! ✨`,
    templateCommandePrete(commande),
    commande.email,
    commande.nom
  );
}

export async function envoyerEmailBienvenue(nom: string, email: string) {
  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #d4af37;">Bienvenue chez Maya Bar ! ✨</h1>
      <p>Bonjour ${nom},</p>
      <p>Merci de nous avoir rejoint. Vous recevrez désormais nos actualités et vos confirmations de commande par e-mail.</p>
      <p>À très bientôt !</p>
    </div>
  `;

  return await sendBrevoEmail(
    "Bienvenue chez Maya Bar à Senteurs ✨",
    html,
    email,
    nom
  );
}