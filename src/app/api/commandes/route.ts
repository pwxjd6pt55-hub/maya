import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // DEBUG : On affiche tout sans filtre pour comprendre
    const { rows } = await pool.query("SELECT * FROM commandes ORDER BY created_at DESC");
    console.log(`--- API COMMANDES : ${rows.length} commandes trouvées ---`);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
