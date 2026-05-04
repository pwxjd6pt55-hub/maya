import { NextRequest, NextResponse } from "next/server";
import { envoyerEmailsCommande } from "@/lib/email";

// GET /api/test-email  →  envoie un email de test à l'admin
export async function GET(request: NextRequest) {
  const testData = {
    id: "TEST-001",
    clientNom: "Maya Bar Test",
    clientTel: "0600000000",
    clientEmail: process.env.GMAIL_USER, // s'envoie à soi-même pour tester
    parfum: "Rose d'Orient — Test",
    contenance: "50ml",
    gravure: "Test gravure",
    emballage: "Écrin doré",
    prix: 380,
    type: "catalogue" as const,
    notes: "Ceci est un email de test pour vérifier la configuration Gmail.",
    dateCommande: new Date().toLocaleString("fr-FR", {
      timeZone: "Africa/Lome",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const result = await envoyerEmailsCommande(testData);

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "📧 Email de test envoyé avec succès !",
      details: result,
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        message: "❌ Erreur lors de l'envoi",
        error: result.error,
        tip: "Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD dans .env.local",
      },
      { status: 500 }
    );
  }
}
