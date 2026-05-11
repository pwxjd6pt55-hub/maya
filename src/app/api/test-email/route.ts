import { NextResponse } from 'next/server';
import { envoyerEmailBienvenue } from '@/lib/email';

export async function GET() {
  console.log("--- TEST EMAIL : Démarrage du test ---");
  
  try {
    const testEmail = process.env.GMAIL_USER || "kougnimag@gmail.com";
    
    console.log(`Tentative d'envoi d'un email de bienvenue à ${testEmail}...`);
    
    await envoyerEmailBienvenue("Test Utilisateur", testEmail);
    
    console.log("✅ Fin de la tentative d'envoi (vérifiez les logs du serveur pour les détails)");
    
    return NextResponse.json({ 
      success: true, 
      message: "Tentative d'envoi effectuée. Vérifiez votre boîte mail (et les spams) ainsi que la console du serveur.",
      config: {
        user: process.env.GMAIL_USER ? "Configuré ✅" : "Manquant ❌",
        pass: process.env.GMAIL_APP_PASSWORD ? "Configuré ✅" : "Manquant ❌"
      }
    });
  } catch (error: any) {
    console.error("❌ Erreur critique lors du test:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
