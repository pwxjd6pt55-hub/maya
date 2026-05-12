import { NextResponse } from 'next/server'

// Cette API sert uniquement à maintenir le serveur Render éveillé
// On l'appelle toutes les 14 minutes via un service externe (ex: cron-job.org)
export async function GET() {
  return NextResponse.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    message: 'Maya Bar is awake 🌹' 
  })
}
