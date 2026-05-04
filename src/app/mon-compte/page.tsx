'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function MyAccountPage() {
  const [user, setUser] = useState<any>(null)
  const [commandes, setCommandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const chargerCommandes = React.useCallback(async () => {
    try {
      const res = await fetch('/api/commandes')
      const data = await res.json()
      if (data.success) {
        setCommandes(data.data)
      }
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
        chargerCommandes()
      } else {
        router.push('/connexion')
      }
    })
  }, [chargerCommandes, router])

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-deep-brown flex items-center justify-center text-gold">Chargement...</div>

  return (
    <main className="min-h-screen bg-deep-brown text-cream p-8 md:p-20">
      <div className="max-w-[1000px] mx-auto">
        <header className="flex justify-between items-end mb-16 border-b border-white/5 pb-10">
          <div>
            <p className="text-gold text-[10px] uppercase tracking-[0.3em] mb-4">Votre Espace Signature</p>
            <h1 className="font-display text-5xl font-light">Bienvenue, <span className="italic text-gold">{user?.nom}</span></h1>
          </div>
          <button onClick={logout} className="text-[10px] uppercase tracking-widest text-red-400/50 hover:text-red-400 transition-colors">
            Déconnexion
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar : Profil Olfactif */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 border-gold/20">
              <h3 className="text-gold text-xs uppercase tracking-widest mb-6">Mon Profil Olfactif</h3>
              {user?.profil_olfactif ? (
                <div className="space-y-4">
                  <p className="text-2xl font-display">{JSON.parse(user.profil_olfactif).recommandation}</p>
                  <p className="text-cream/40 text-xs leading-relaxed">Basé sur vos dernières préférences.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-cream/40 text-sm">Vous n&apos;avez pas encore de profil défini.</p>
                  <Link href="/configurateur">
                    <button className="text-gold text-[10px] uppercase tracking-widest border border-gold/30 px-6 py-3 hover:bg-gold/5 transition-all">
                      Faire le quiz
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main : Historique */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-gold text-xs uppercase tracking-widest mb-6">Historique des Créations</h3>
            
            {commandes.length === 0 ? (
              <div className="glass-card p-12 text-center opacity-40 italic">
                Aucune commande pour le moment.
              </div>
            ) : (
              <div className="space-y-6">
                {commandes.map((c) => (
                  <motion.div 
                    key={c.id}
                    whileHover={{ x: 10 }}
                    className="glass-card p-8 flex justify-between items-center border-white/5 hover:border-gold/30 transition-all"
                  >
                    <div>
                      <div className="text-[10px] text-gold/60 mb-2">{new Date(c.created_at).toLocaleDateString()} · {c.reference}</div>
                      <h4 className="text-xl font-display mb-1">{c.parfum_catalogue_nom || "Mélange Signature"}</h4>
                      <p className="text-xs text-cream/30 uppercase tracking-widest">{c.ml}ml · {c.statut}</p>
                    </div>
                    <div className="text-right space-y-3">
                       <div className="text-gold font-medium">{c.prix_total.toLocaleString()} FCFA</div>
                       <Link href="/configurateur">
                          <button className="text-[9px] uppercase tracking-widest bg-gold/10 text-gold px-4 py-2 hover:bg-gold hover:text-deep-brown transition-all">
                            Recommander
                          </button>
                       </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="mt-20 pt-10 border-t border-white/5 text-center">
          <Link href="/" className="text-[10px] uppercase tracking-widest text-cream/30 hover:text-gold transition-colors">
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  )
}
