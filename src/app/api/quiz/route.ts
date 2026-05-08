import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM quiz_questions ORDER BY ordre ASC')
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('Quiz GET error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération du quiz' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { question, options, ordre } = await request.json()
    const result = await pool.query(
      'INSERT INTO quiz_questions (question, options, ordre) VALUES ($1, $2, $3) RETURNING id',
      [question, JSON.stringify(options), ordre || 0]
    )
    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l ajout' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    await pool.query('DELETE FROM quiz_questions WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
