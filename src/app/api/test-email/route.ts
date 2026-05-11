import { NextResponse } from 'next/server';
import { envoyerEmailBienvenue } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("--- TEST EMAIL : Démarrage du test ---");
  
  try {
    const testEmail = process.env.GMAIL_USER || "kougnimag@gmail.com";
    
    console.log(`Tentative d'envoi d'un email de bienvenue à ${testEmail}...`);
    
    const result = await envoyerEmailBienvenue("Test Utilisateur", testEmail);
    
    if (result.success) {
      console.log("✅ E-mail envoyé avec succès !");
      return NextResponse.json({ 
        success: true, 
        message: "E-mail envoyé avec succès ! Vérifiez votre boîte mail (et les spams).",
        messageId: result.messageId
      });
    } else {
      console.error("❌ Échec de l'envoi:", result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        tip: "Vérifiez votre mot de passe d'application Google."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ Erreur critique lors du test:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
