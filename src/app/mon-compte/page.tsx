'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function MyAccountPage() {
  const [user, setUser] = useState<any>(null)
  const [commandes, setCommandes] = useState<any[]>([])
  const [panier, setPanier] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const chargerDonnees = useCallback(async () => {
    try {
      const [resCmd, resPanier] = await Promise.all([
        fetch('/api/commandes').then(r => r.json()),
        fetch('/api/cart').then(r => r.json())
      ])
      if (resCmd.success) setCommandes(resCmd.data)
      if (resPanier.success) setPanier(resPanier.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(data => {
      if (data.authenticated) {
        setUser(data.user)
        chargerDonnees()
      } else {
        router.push('/connexion')
      }
    })
  }, [chargerDonnees, router])

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  const supprimerDuPanier = async (id: number) => {
    await fetch(`/api/cart?id=${id}`, { method: 'DELETE' })
    chargerDonnees()
  }

  const recommander = async (c: any) => {
    setSubmitting(true)
    const payload = {
      item_type: c.mode_commande,
      parfum_catalogue_id: c.parfum_catalogue_id,
      ml: c.ml,
      prix: c.prix_total,
      quantite: 1,
      gravure: c.gravure,
      couleur: c.couleur_parfum,
      essences_json: c.essences || null // Si dispo dans l'objet commande
    }
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    chargerDonnees()
    setSubmitting(false)
    alert('Commande ajoutée au panier !')
  }

  const validerPanier = () => {
    // Rediriger vers une page de checkout ou ouvrir le configurateur à l'étape finale
    router.push('/configurateur?step=final')
  }

  if (loading) return <div className="min-h-screen bg-[#0D0800] flex items-center justify-center text-rose animate-pulse">Chargement...</div>

  return (
    <main className="min-h-screen bg-[#0D0800] text-cream p-8 md:p-20 font-body">
      <div className="max-w-[1200px] mx-auto">
        
        <header className="flex justify-between items-end mb-20 border-b border-rose/10 pb-12">
          <div>
            <p className="text-rose text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Espace Privilège</p>
            <h1 className="font-display text-6xl font-light">Bienvenue, <span className="italic text-rose">{user?.nom}</span></h1>
          </div>
          <button onClick={logout} className="text-[10px] uppercase tracking-widest text-rose/30 hover:text-rose transition-colors border border-rose/10 px-6 py-3">
            Déconnexion
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-20">
          
          {/* SIDEBAR : PANIER ACTUEL */}
          <div className="space-y-12">
            <div>
              <h3 className="text-rose text-[10px] uppercase tracking-[0.4em] font-bold mb-8">Panier Actuel</h3>
              <div className="space-y-4">
                {panier.length === 0 ? (
                  <div className="glass-card p-10 text-center text-[10px] uppercase tracking-widest text-rose/20 border-dashed">
                    Votre panier est vide
                  </div>
                ) : (
                  <>
                    {panier.map((item) => (
                      <div key={item.id} className="glass-card p-6 border-rose/10 bg-rose/5 group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-[9px] uppercase tracking-widest text-rose/40">{item.item_type}</div>
                          <button onClick={() => supprimerDuPanier(item.id)} className="text-rose/20 hover:text-rose transition-colors">×</button>
                        </div>
                        <h4 className="font-display text-xl mb-1">{item.nom_personnalise || item.parfum_catalogue_nom || 'Parfum'}</h4>
                        <div className="text-[10px] text-rose/60 mb-4">{item.ml}ml {item.gravure && `· "${item.gravure}"`}</div>
                        <div className="text-rose font-bold">{item.prix.toLocaleString()} F</div>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-rose/10">
                       <div className="flex justify-between items-center mb-8">
                          <span className="text-[10px] uppercase tracking-widest text-rose/40">Total</span>
                          <span className="text-2xl font-display text-rose">{panier.reduce((acc, i) => acc + i.prix * i.quantite, 0).toLocaleString()} F</span>
                       </div>
                       <button onClick={validerPanier} className="btn-gold w-full py-5 text-[10px]">Commander ({panier.length})</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="glass-card p-10 border-rose/10">
              <h3 className="text-rose text-[10px] uppercase tracking-[0.4em] font-bold mb-6">Mon Profil</h3>
              <p className="text-sm text-cream/40 mb-2">Email: {user?.email}</p>
              <Link href="/configurateur" className="text-[9px] uppercase tracking-widest text-rose hover:text-rose-light">Refaire le quiz olfactif →</Link>
            </div>
          </div>

          {/* MAIN : HISTORIQUE */}
          <div className="space-y-12">
            <h3 className="text-rose text-[10px] uppercase tracking-[0.4em] font-bold mb-8">Historique des Commandes</h3>
            
            {commandes.length === 0 ? (
              <div className="glass-card p-20 text-center opacity-20 italic font-display text-2xl">
                Votre galerie de créations est encore vide.
              </div>
            ) : (
              <div className="space-y-6">
                {commandes.map((c) => (
                  <motion.div 
                    key={c.id}
                    whileHover={{ x: 10, borderColor: 'rgba(188, 124, 124, 0.3)' }}
                    className="glass-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-rose/10 transition-all gap-8"
                  >
                    <div>
                      <div className="text-[10px] text-rose/40 font-mono mb-2">#{c.reference} · {new Date(c.created_at).toLocaleDateString()}</div>
                      <h4 className="text-2xl font-display mb-1">{c.parfum_catalogue_nom || "Mélange Signature"}</h4>
                      <div className="flex gap-4 items-center">
                         <div className={`text-[8px] uppercase tracking-widest px-2 py-1 border ${c.statut === 'livree' ? 'border-green-400/30 text-green-400' : 'border-rose/30 text-rose'}`}>
                            {c.statut}
                         </div>
                         <div className="text-[10px] text-cream/30 uppercase tracking-widest">{c.ml}ml</div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col md:items-end gap-4 w-full md:w-auto">
                       <div className="text-2xl font-display text-rose">{c.prix_total.toLocaleString()} F</div>
                       <button 
                        onClick={() => recommander(c)}
                        disabled={submitting}
                        className="text-[9px] uppercase tracking-widest bg-rose/10 text-rose border border-rose/20 px-8 py-3 hover:bg-rose hover:text-white transition-all"
                       >
                         {submitting ? '...' : 'RECOMMANDER'}
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="mt-32 pt-12 border-t border-rose/10 text-center">
          <Link href="/" className="text-[10px] uppercase tracking-[0.5em] text-rose/20 hover:text-rose transition-colors">
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  )
}
