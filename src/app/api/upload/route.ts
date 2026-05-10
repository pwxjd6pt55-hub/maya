import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limite de 5 Mo pour éviter de surcharger la base de données PostgreSQL
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'L\'image est trop lourde (maximum 5 Mo)' }, { status: 400 });
    }

    // Convertir l'image en Base64 Data URI
    const mimeType = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    // On retourne directement l'URI. Elle sera sauvegardée dans la colonne "image_url" (qui est de type TEXT)
    return NextResponse.json({ success: true, url: dataUri });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur lors du traitement de l\'image' }, { status: 500 });
  }
}
