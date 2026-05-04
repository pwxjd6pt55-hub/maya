'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Commande {
  id: number
  reference: string
  client_nom: string
  client_telephone: string
  mode_commande: string
  parfum_catalogue_nom: string | null
  essences_noms: string | null
  ml: number
  couleur_parfum: string
  gravure: string | null
  retrait: string
  date_souhaitee: string | null
  prix_total: number
  statut: string
  created_at: string
}

const STATUTS = ['nouvelle', 'en_preparation', 'prete', 'livree', 'annulee']
const STATUT_LABELS: Record<string, string> = {
  nouvelle: 'Nouvelle', en_preparation: 'En préparation', prete: 'Prête', livree: 'Livrée', annulee: 'Annulée'
}
const STATUT_COLORS: Record<string, string> = {
  nouvelle: '#E8C97A', en_preparation: '#7AACE8', prete: '#7AE8A4', livree: '#A87AE8', annulee: '#E87A7A'
}

// Données démo si DB pas encore connectée
const DEMO_COMMANDES: Commande[] = [
  { id: 1, reference: 'MBDEMO1', client_nom: 'Aminata Koffi', client_telephone: '+22890123456', mode_commande: 'catalogue', parfum_catalogue_nom: 'Sauvage Noir', essences_noms: null, ml: 50, couleur_parfum: '#F5E6C8', gravure: 'Ami', retrait: 'boutique', date_souhaitee: null, prix_total: 14000, statut: 'nouvelle', created_at: new Date().toISOString() },
  { id: 2, reference: 'MBDEMO2', client_nom: 'Kofi Mensah', client_telephone: '+22891234567', mode_commande: 'melange', parfum_catalogue_nom: null, essences_noms: 'Rose de Damas, Santal de Mysore, Ambre Gris', ml: 100, couleur_parfum: '#E8A88A', gravure: null, retrait: 'livraison', date_souhaitee: null, prix_total: 18000, statut: 'en_preparation', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, reference: 'MBDEMO3', client_nom: 'Yawa Agbodji', client_telephone: '+22892345678', mode_commande: 'catalogue', parfum_catalogue_nom: 'Rose Éternelle', essences_noms: null, ml: 30, couleur_parfum: '#E8C8E8', gravure: 'Yawa', retrait: 'boutique', date_souhaitee: null, prix_total: 10500, statut: 'prete', created_at: new Date(Date.now() - 172800000).toISOString() },
]

export default function AdminPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [onglet, setOnglet] = useState<'commandes' | 'stats' | 'catalogue' | 'quiz'>('commandes')
  const [motDePasse, setMotDePasse] = useState('')
  const [authentifie, setAuthentifie] = useState(false)
  const [erreurMdp, setErreurMdp] = useState(false)

  // ─── Sécurisation : Authentification API ───
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà un cookie de session valide
    fetch('/api/auth')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) setAuthentifie(true)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const connexion = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: motDePasse }),
      })
      const data = await res.json()
      if (data.success) {
        setAuthentifie(true)
        setErreurMdp(false)
      } else {
        setErreurMdp(true)
      }
    } catch (e) {
      setErreurMdp(true)
    }
  }

  const deconnexion = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setAuthentifie(false)
    setMotDePasse('')
  }

  const chargerCommandes = useCallback(async () => {
    try {
      const res = await fetch('/api/commandes')
      const data = await res.json()
      if (data.success) setCommandes(data.data)
    } catch (e) {
      // Données démo si DB non connectée
      setCommandes(DEMO_COMMANDES)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authentifie) chargerCommandes()
  }, [authentifie, chargerCommandes])

  // ─── Catalogue ───
  const [parfums, setParfums] = useState<any[]>([])
  const [loadingParfums, setLoadingParfums] = useState(false)
  const [editingParfum, setEditingParfum] = useState<any>(null)

  const chargerParfums = useCallback(async () => {
    setLoadingParfums(true)
    try {
      const res = await fetch('/api/parfums')
      const data = await res.json()
      if (data.success) setParfums(data.data)
    } catch (e) {}
    setLoadingParfums(false)
  }, [])

  useEffect(() => {
    if (authentifie && onglet === 'catalogue' && parfums.length === 0) {
      chargerParfums()
    }
  }, [authentifie, onglet, chargerParfums, parfums.length])

  const sauvegarderParfum = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingParfum.id ? 'PATCH' : 'POST'
      const res = await fetch('/api/parfums', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingParfum),
      })
      if (res.ok) {
        setEditingParfum(null)
        chargerParfums()
      }
    } catch (err) {}
  }

  const supprimerParfum = async (id: number) => {
    if(!window.confirm('Vraiment supprimer ce parfum ?')) return;
    try {
      await fetch(`/api/parfums?id=${id}`, { method: 'DELETE' })
      chargerParfums()
    } catch (e) {}
  }

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ question: '', options: [{ label: '', valeur: 'Floral' }], ordre: 1 })

  const chargerQuiz = useCallback(async () => {
    setLoadingQuiz(true)
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      if (data.success) setQuizQuestions(data.data)
    } catch (e) {}
    setLoadingQuiz(false)
  }, [])

  useEffect(() => {
    if (authentifie && onglet === 'quiz' && quizQuestions.length === 0) {
      chargerQuiz()
    }
  }, [authentifie, onglet, chargerQuiz, quizQuestions.length])

  const sauvegarderQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      })
      if (res.ok) {
        setNewQuestion({ question: '', options: [{ label: '', valeur: 'Floral' }], ordre: quizQuestions.length + 1 })
        chargerQuiz()
      }
    } catch (err) {}
  }

  const supprimerQuestion = async (id: number) => {
    if(!window.confirm('Supprimer cette question ?')) return;
    try {
      await fetch(`/api/quiz?id=${id}`, { method: 'DELETE' })
      chargerQuiz()
    } catch (e) {}
  }

  const changerStatut = async (id: number, statut: string) => {
    try {
      await fetch('/api/commandes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut }),
      })
    } catch (e) {}
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
  }

  const whatsappClient = (c: Commande, message: string) => {
    if (!c.client_telephone) {
      alert("Numéro de téléphone manquant pour ce client.")
      return
    }
    const tel = c.client_telephone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Stats
  const totalJour = commandes.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length
  const totalSemaine = commandes.filter(c => {
    const d = new Date(c.created_at)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  }).reduce((acc, c) => acc + (c.prix_total || 0), 0)

  // Page login
  if (!authentifie) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--deep-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', maxWidth: '400px', width: '100%', margin: '1rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>Maya Bar</div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,241,232,0.4)', marginBottom: '3rem' }}>Espace Administrateur</div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={e => setMotDePasse(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && connexion()}
            style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${erreurMdp ? '#E87A7A' : 'rgba(201,168,76,0.2)'}`, color: 'var(--cream)', fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
          />
          {erreurMdp && <p style={{ color: '#E87A7A', fontSize: '0.8rem', marginBottom: '1rem' }}>Mot de passe incorrect</p>}
          <button className="btn-gold" onClick={connexion} style={{ width: '100%' }}>Connexion</button>
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/" style={{ fontSize: '0.75rem', color: 'rgba(247,241,232,0.3)', textDecoration: 'none' }}>← Retour au site</Link>
          </div>
        </div>
      </div>
    )
  }

  const commandesFiltrees = filtreStatut === 'tous' ? commandes : commandes.filter(c => c.statut === filtreStatut)

  const inputStyle = { width: '100%', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--deep-brown)' }}>
      {/* Header admin */}
      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: 'var(--gold)' }}>
          Maya Bar <span style={{ fontSize: '0.8rem', color: 'rgba(247,241,232,0.4)', fontWeight: 300 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => chargerCommandes()} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(247,241,232,0.5)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 1rem', cursor: 'pointer' }}>⟳ Actualiser</button>
          <Link href="/" style={{ fontSize: '0.75rem', color: 'rgba(247,241,232,0.4)', textDecoration: 'none' }}>← Site</Link>
          <button onClick={() => deconnexion()} style={{ background: 'transparent', border: 'none', color: 'rgba(247,241,232,0.3)', cursor: 'pointer', fontSize: '0.75rem' }}>Déconnexion</button>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ padding: '1.5rem 2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        {[
          { label: 'Commandes aujourd\'hui', val: totalJour, icon: '📋' },
          { label: 'Nouvelles', val: commandes.filter(c => c.statut === 'nouvelle').length, icon: '🔔', color: '#E8C97A' },
          { label: 'En préparation', val: commandes.filter(c => c.statut === 'en_preparation').length, icon: '🧪', color: '#7AACE8' },
          { label: 'Prêtes', val: commandes.filter(c => c.statut === 'prete').length, icon: '✅', color: '#7AE8A4' },
          { label: 'CA semaine (FCFA)', val: totalSemaine.toLocaleString('fr-FR'), icon: '💰', color: '#C9A84C' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1rem 1.5rem', flex: '1', minWidth: '150px' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', color: stat.color || 'var(--cream)' }}>{stat.val}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(247,241,232,0.4)', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ padding: '0 2rem', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', gap: '0', overflowX: 'auto' }}>
        {[{ val: 'commandes', label: '📋 Commandes' }, { val: 'catalogue', label: '🗂️ Catalogue' }, { val: 'stats', label: '📊 Statistiques' }, { val: 'quiz', label: '🧪 Quiz' }].map(o => (
          <button key={o.val} onClick={() => setOnglet(o.val as any)} style={{
            padding: '1rem 1.5rem', background: 'transparent', border: 'none',
            borderBottom: onglet === o.val ? '2px solid var(--gold)' : '2px solid transparent',
            color: onglet === o.val ? 'var(--gold)' : 'rgba(247,241,232,0.4)',
            fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.2s',
          }}>{o.label}</button>
        ))}
      </div>

      <div style={{ padding: '2rem' }}>

        {/* ── COMMANDES ── */}
        {onglet === 'commandes' && (
          <div>
            {/* Filtres statut */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <button onClick={() => setFiltreStatut('tous')} style={{ padding: '0.5rem 1rem', border: '1px solid rgba(201,168,76,0.3)', background: filtreStatut === 'tous' ? 'rgba(201,168,76,0.15)' : 'transparent', color: filtreStatut === 'tous' ? 'var(--gold)' : 'rgba(247,241,232,0.4)', borderColor: filtreStatut === 'tous' ? 'var(--gold)' : 'rgba(201,168,76,0.3)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Tous ({commandes.length})
              </button>
              {STATUTS.map(s => (
                <button key={s} onClick={() => setFiltreStatut(s)} style={{ padding: '0.5rem 1rem', border: '1px solid', background: filtreStatut === s ? 'rgba(201,168,76,0.1)' : 'transparent', color: filtreStatut === s ? STATUT_COLORS[s] : 'rgba(247,241,232,0.4)', borderColor: filtreStatut === s ? STATUT_COLORS[s] : 'rgba(255,255,255,0.1)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  {STATUT_LABELS[s]} ({commandes.filter(c => c.statut === s).length})
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(247,241,232,0.3)' }}>Chargement…</div>
            ) : commandesFiltrees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(247,241,232,0.3)' }}>Aucune commande</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {commandesFiltrees.map(c => (
                  <div key={c.id} className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      {/* Infos principales */}
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(247,241,232,0.4)' }}>{c.reference}</span>
                          <span style={{
                            padding: '0.2rem 0.75rem', fontSize: '0.65rem', letterSpacing: '0.1em',
                            color: STATUT_COLORS[c.statut] || 'var(--cream)',
                            border: `1px solid ${STATUT_COLORS[c.statut] || 'rgba(255,255,255,0.2)'}`,
                            background: `${STATUT_COLORS[c.statut]}22`,
                          }}>{STATUT_LABELS[c.statut]}</span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(247,241,232,0.3)' }}>
                            {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '0.25rem' }}>{c.client_nom}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '0.75rem' }}>{c.client_telephone}</div>

                        <div style={{ fontSize: '0.8rem', color: 'rgba(247,241,232,0.6)', lineHeight: 1.8 }}>
                          {c.mode_commande === 'catalogue' ? `🌹 ${c.parfum_catalogue_nom}` : `🧪 ${c.essences_noms || 'Mélange personnalisé'}`}<br />
                          📦 {c.ml}ml {c.couleur_parfum && <span style={{ display: 'inline-block', width: '10px', height: '10px', background: c.couleur_parfum, borderRadius: '50%', verticalAlign: 'middle', margin: '0 4px' }} />}
                          {c.gravure && `· Gravure: "${c.gravure}"`}<br />
                          {c.retrait === 'boutique' ? '🏪 Retrait boutique' : '🛵 Livraison'}
                          {c.date_souhaitee && ` · ${new Date(c.date_souhaitee).toLocaleDateString('fr-FR')}`}
                        </div>
                      </div>

                      {/* Prix + Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--gold)' }}>{(c.prix_total || 0).toLocaleString('fr-FR')}</div>
                          <div style={{ fontSize: '0.65rem', color: 'rgba(247,241,232,0.3)' }}>FCFA</div>
                        </div>

                        {/* Changer statut */}
                        <select
                          value={c.statut}
                          onChange={e => changerStatut(c.id, e.target.value)}
                          style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', color: STATUT_COLORS[c.statut], fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                        >
                          {STATUTS.map(s => <option key={s} value={s} style={{ background: '#1A0F00', color: 'white' }}>{STATUT_LABELS[s]}</option>)}
                        </select>

                        {/* WhatsApp client */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => whatsappClient(c, `Bonjour ${c.client_nom} ! 🌸 Votre commande Maya Bar *${c.reference}* est en cours de préparation. Nous vous contacterons très bientôt.`)}
                            style={{ padding: '0.5rem 0.875rem', background: '#25D366', border: 'none', color: 'white', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                            📱 WA Confirmation
                          </button>
                          {c.statut === 'prete' && (
                            <button onClick={() => whatsappClient(c, `Bonjour ${c.client_nom} ! ✅ Votre parfum Maya Bar est *prêt* ! Référence *${c.reference}*. ${c.retrait === 'boutique' ? 'Vous pouvez venir le récupérer en boutique.' : 'Votre livraison est en cours. 🛵'}`)}
                              style={{ padding: '0.5rem 0.875rem', background: 'rgba(122,232,164,0.2)', border: '1px solid #7AE8A4', color: '#7AE8A4', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                              ✅ Prêt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATALOGUE ── */}
        {onglet === 'catalogue' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--cream)', fontWeight: 'normal', fontFamily: 'Cormorant Garamond, serif' }}>Gestion du Catalogue</h2>
              <button onClick={() => setEditingParfum({ id: 0, nom: '', marque_inspiree: '', famille: '', notes_tete: '', notes_coeur: '', notes_fond: '', prix_30ml: 0, prix_50ml: 0, prix_100ml: 0, image_url: '' })} className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>+ Ajouter un Parfum</button>
            </div>

            {editingParfum && (
              <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '1rem' }}>{editingParfum.id ? 'Éditer le Parfum' : 'Nouveau Parfum'}</h3>
                <form onSubmit={sauvegarderParfum} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <input required placeholder="Nom du parfum" value={editingParfum.nom} onChange={e => setEditingParfum({...editingParfum, nom: e.target.value})} style={inputStyle} />
                  <input placeholder="Marque inspirée" value={editingParfum.marque_inspiree} onChange={e => setEditingParfum({...editingParfum, marque_inspiree: e.target.value})} style={inputStyle} />
                  <input required placeholder="Famille olfactive (ex: Boisé)" value={editingParfum.famille} onChange={e => setEditingParfum({...editingParfum, famille: e.target.value})} style={inputStyle} />
                  <input placeholder="Lien de l'image (ex: /parfums/ma-photo.png)" value={editingParfum.image_url || ''} onChange={e => setEditingParfum({...editingParfum, image_url: e.target.value})} style={inputStyle} />
                  
                  <input placeholder="Notes de tête" value={editingParfum.notes_tete} onChange={e => setEditingParfum({...editingParfum, notes_tete: e.target.value})} style={inputStyle} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" required placeholder="Prix 30ml" value={editingParfum.prix_30ml || ''} onChange={e => setEditingParfum({...editingParfum, prix_30ml: parseInt(e.target.value) || 0})} style={inputStyle} />
                    <input type="number" required placeholder="Prix 50ml" value={editingParfum.prix_50ml || ''} onChange={e => setEditingParfum({...editingParfum, prix_50ml: parseInt(e.target.value) || 0})} style={inputStyle} />
                    <input type="number" required placeholder="Prix 100ml" value={editingParfum.prix_100ml || ''} onChange={e => setEditingParfum({...editingParfum, prix_100ml: parseInt(e.target.value) || 0})} style={inputStyle} />
                  </div>
                  <input placeholder="Notes de cœur" value={editingParfum.notes_coeur} onChange={e => setEditingParfum({...editingParfum, notes_coeur: e.target.value})} style={inputStyle} />
                  <input placeholder="Notes de fond" value={editingParfum.notes_fond} onChange={e => setEditingParfum({...editingParfum, notes_fond: e.target.value})} style={inputStyle} />
                  
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn-gold" style={{ padding: '0.5rem 1rem' }}>Sauvegarder</button>
                    <button type="button" onClick={() => setEditingParfum(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {loadingParfums ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(247,241,232,0.3)' }}>Chargement du catalogue…</div>
            ) : parfums.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(247,241,232,0.3)' }}>Le catalogue est vide</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {parfums.map(p => (
                  <div key={p.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize:'1.5rem'}}>📸</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--cream)', lineHeight: 1.1, marginBottom: '0.2rem' }}>{p.nom}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{p.famille}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Insp: {p.marque_inspiree}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.4)'}}>30ml</div>
                        <div>{(p.prix_30ml||0).toLocaleString('fr-FR')}F</div>
                      </div>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.4)'}}>50ml</div>
                        <div>{(p.prix_50ml||0).toLocaleString('fr-FR')}F</div>
                      </div>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.4)'}}>100ml</div>
                        <div>{(p.prix_100ml||0).toLocaleString('fr-FR')}F</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button onClick={() => setEditingParfum(p)} style={{ flex: 1, padding: '0.4rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Jost, sans-serif' }}>✏️ Éditer</button>
                      <button onClick={() => supprimerParfum(p.id)} style={{ padding: '0.4rem 0.8rem', background: 'rgba(232,122,122,0.1)', border: '1px solid rgba(232,122,122,0.3)', color: '#E87A7A', cursor: 'pointer', fontSize: '0.75rem' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {onglet === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Répartition modes */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>Modes de commande</div>
              {[{ label: 'Catalogue', val: commandes.filter(c => c.mode_commande === 'catalogue').length, color: '#E8C97A' }, { label: 'Mélange perso', val: commandes.filter(c => c.mode_commande === 'melange').length, color: '#7AACE8' }].map(item => (
                <div key={item.label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(247,241,232,0.7)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', color: item.color }}>{item.val}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                    <div style={{ width: `${commandes.length ? (item.val / commandes.length) * 100 : 0}%`, height: '100%', background: item.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Répartition ML */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>Contenances populaires</div>
              {[30, 50, 100].map(ml => {
                const count = commandes.filter(c => c.ml === ml).length
                return (
                  <div key={ml} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(247,241,232,0.7)' }}>{ml}ml</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                      <div style={{ width: `${commandes.length ? (count / commandes.length) * 100 : 0}%`, height: '100%', background: 'var(--gold)', borderRadius: '3px', opacity: ml === 30 ? 0.5 : ml === 50 ? 0.75 : 1, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {onglet === 'quiz' && (
          <div className="max-w-[800px] mx-auto">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '2rem', fontFamily: 'Cormorant Garamond, serif' }}>Gestion du Quiz Olfactif</h2>
            
            {/* Formulaire ajout */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Nouvelle Question</h3>
              <form onSubmit={sauvegarderQuestion} className="space-y-4">
                <input required placeholder="La question (ex: Quelle ambiance préférez-vous ?)" value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} style={inputStyle} />
                
                <div className="space-y-2">
                  <p className="text-[10px] uppercase text-gold/60">Options de réponse</p>
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input required placeholder="Texte de la réponse" value={opt.label} onChange={e => {
                        const opts = [...newQuestion.options]; opts[idx].label = e.target.value; setNewQuestion({...newQuestion, options: opts});
                      }} style={inputStyle} />
                      <select value={opt.valeur} onChange={e => {
                        const opts = [...newQuestion.options]; opts[idx].valeur = e.target.value; setNewQuestion({...newQuestion, options: opts});
                      }} style={{...inputStyle, width: '150px'}}>
                        {['Floral','Agrumes','Boisé','Oriental','Gourmand','Musqué','Frais','Épicé'].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options, { label: '', valeur: 'Floral' }]})} className="text-[10px] text-gold hover:underline mt-2">+ Ajouter une option</button>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <input type="number" placeholder="Ordre" value={newQuestion.ordre} onChange={e => setNewQuestion({...newQuestion, ordre: parseInt(e.target.value)})} style={{...inputStyle, width: '80px'}} />
                  <button type="submit" className="btn-gold" style={{ padding: '0.6rem 2rem' }}>Ajouter au Quiz</button>
                </div>
              </form>
            </div>

            {/* Liste questions */}
            <div className="space-y-4">
              {quizQuestions.map((q) => (
                <div key={q.id} className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-gold text-xs mr-2">#{q.ordre}</span>
                      <span className="text-cream text-lg font-display">{q.question}</span>
                    </div>
                    <button onClick={() => supprimerQuestion(q.id)} style={{ background: 'transparent', border: 'none', color: '#E87A7A', cursor: 'pointer', fontSize: '0.8rem' }}>Supprimer</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(typeof q.options === 'string' ? q.options : JSON.stringify(q.options)).map((opt: any, i: number) => (
                      <div key={i} className="bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-cream/60">
                        {opt.label} → <span className="text-gold">{opt.valeur}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
