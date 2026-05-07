'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ───
interface Commande {
  id: number
  reference: string
  client_nom: string
  client_telephone: string
  client_email?: string
  mode_commande: string
  parfum_catalogue_nom?: string
  ml: number
  prix_total: number
  statut: string
  created_at: string
}

const STATUTS = ['nouvelle', 'en_preparation', 'prete', 'livree', 'annulee']
const STATUT_LABELS: Record<string, string> = {
  nouvelle: 'Nouvelle', en_preparation: 'En prépa', prete: 'Prête', livree: 'Livrée', annulee: 'Annulée'
}

export default function AdminMayaPage() {
  const [onglet, setOnglet] = useState('commandes')
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [parfums, setParfums] = useState<any[]>([])
  const [essences, setEssences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authentifie, setAuthentifie] = useState(false)
  const [motDePasse, setMotDePasse] = useState('')
  const [erreurMdp, setErreurMdp] = useState(false)

  // Form states
  const [newParfum, setNewParfum] = useState({
    nom: '', marque_inspiree: '', famille: '', 
    notes_tete: '', notes_coeur: '', notes_fond: '',
    prix_30ml: '', prix_50ml: '', prix_100ml: '',
    image_url: '', actif: 1
  })
  const [uploading, setUploading] = useState(false)

  // ─── Auth ───
  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(data => {
      if (data.authenticated && data.user.role === 'admin') setAuthentifie(true)
      setLoading(false)
    })
  }, [])

  const login = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: motDePasse })
    })
    const data = await res.json()
    if (data.success && data.role === 'admin') setAuthentifie(true)
    else setErreurMdp(true)
  }

  // ─── Data ───
  const fetchData = useCallback(async () => {
    const [resCmd, resPar, resEss] = await Promise.all([
      fetch('/api/commandes').then(r => r.json()),
      fetch('/api/parfums').then(r => r.json()),
      fetch('/api/essences').then(r => r.json())
    ])
    if (resCmd.success) setCommandes(resCmd.data)
    if (resPar.success) setParfums(resPar.data)
    if (resEss.success) setEssences(resEss.data)
  }, [])

  useEffect(() => {
    if (authentifie) fetchData()
  }, [authentifie, fetchData])

  // ─── Upload ───
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'parfum' | 'essence') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (type === 'parfum') setNewParfum(prev => ({ ...prev, image_url: data.url }))
      }
    } catch (err) {
      console.error(err)
    }
    setUploading(false)
  }

  const saveParfum = async () => {
    const res = await fetch('/api/parfums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newParfum)
    })
    if (res.ok) {
      alert('Parfum ajouté !')
      fetchData()
      setOnglet('catalogue')
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0D0800] flex items-center justify-center text-rose font-display text-2xl animate-pulse">Chargement...</div>

  if (!authentifie) {
    return (
      <div className="min-h-screen bg-[#0D0800] flex items-center justify-center p-6">
        <div className="glass-card w-full max-w-md p-10 border-[#BC7C7C33]">
          <h1 className="font-display text-3xl text-rose text-center mb-2">MAYA BAR</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-rose/40 text-center mb-10">Espace Privé Gestion</p>
          <input 
            type="password" 
            placeholder="Clé d'accès"
            value={motDePasse}
            onChange={e => setMotDePasse(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full bg-white/5 border border-rose/20 p-4 text-cream outline-none focus:border-rose/50 mb-6 font-body"
          />
          {erreurMdp && <p className="text-red-400 text-[10px] mb-4 text-center">Clé incorrecte</p>}
          <button onClick={login} className="btn-gold w-full py-4 text-[10px]">Accéder au tableau de bord</button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "AUJOURD'HUI", val: commandes.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length, icon: '7' },
    { label: "NOUVELLES", val: commandes.filter(c => c.statut === 'nouvelle').length, color: 'text-rose' },
    { label: "EN PRÉPA", val: commandes.filter(c => c.statut === 'en_preparation').length },
    { label: "PRÊTES", val: commandes.filter(c => c.statut === 'prete').length, color: 'text-green-400' },
    { label: "CA SEMAINE", val: (commandes.reduce((acc, c) => acc + (c.prix_total || 0), 0) / 1000).toFixed(0) + 'K', color: 'text-rose' }
  ]

  return (
    <main className="min-h-screen bg-[#0D0800] text-cream font-body selection:bg-rose/30 pb-20">
      
      {/* ── HEADER ── */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-rose/5">
        <div>
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl tracking-[0.2em] text-rose">MAYA BAR</span>
            <span className="text-rose/30 font-light text-sm">/ Gestion</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-rose/40 mt-1">
            admin.mayabar.com — <span className="italic">Espace séparé</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-green-400/10 border border-green-400/20 px-4 py-1.5 rounded-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Connectée</span>
          </div>
          <button onClick={() => { fetch('/api/auth', { method: 'DELETE' }).then(() => window.location.reload()) }} className="text-[10px] uppercase tracking-widest text-rose/40 hover:text-rose transition-colors">Déconnexion</button>
        </div>
      </header>

      {/* ── STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-rose/10 border-b border-rose/10">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#0D0800] p-8">
             <div className={`font-display text-4xl mb-1 ${s.color || 'text-cream'}`}>{s.val}</div>
             <div className="text-[9px] tracking-[0.3em] uppercase text-rose/30">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="px-8 flex gap-10 border-b border-rose/5 overflow-x-auto">
        {['COMMANDES', 'CATALOGUE', '+ NOUVEAU PARFUM', 'ESSENCES', 'CLIENTS', 'STATISTIQUES', 'QUIZ'].map(tab => (
          <button 
            key={tab}
            onClick={() => setOnglet(tab.toLowerCase())}
            className={`py-6 text-[10px] font-bold tracking-[0.3em] uppercase transition-all relative ${onglet === tab.toLowerCase() ? 'text-rose' : 'text-rose/30 hover:text-rose/60'}`}
          >
            {tab}
            {onglet === tab.toLowerCase() && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-10">
        <AnimatePresence mode="wait">
          
          {/* ── TICKET LIST (COMMANDES) ── */}
          {onglet === 'commandes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="cmd">
              <div className="grid grid-cols-1 gap-6">
                {commandes.map(c => (
                  <div key={c.id} className="glass-card p-8 flex items-center justify-between group">
                    <div className="flex gap-10 items-center">
                       <div className="text-[10px] tracking-widest text-rose/30 font-mono">#{c.reference}</div>
                       <div>
                          <div className="font-display text-xl mb-1">{c.client_nom}</div>
                          <div className="text-xs text-rose/60">{c.client_telephone}</div>
                       </div>
                       <div className="h-10 w-px bg-rose/5" />
                       <div>
                          <div className="text-[10px] text-rose/40 uppercase mb-1">{c.mode_commande}</div>
                          <div className="text-sm">{c.parfum_catalogue_nom || 'Mélange personnalisé'}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-10">
                       <div className="text-right">
                          <div className="text-xl font-medium text-rose">{c.prix_total.toLocaleString()} F</div>
                          <div className="text-[9px] text-rose/40 uppercase">Montant total</div>
                       </div>
                       <select 
                        value={c.statut}
                        onChange={async (e) => {
                           await fetch('/api/commandes', {
                             method: 'PATCH',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ id: c.id, statut: e.target.value })
                           })
                           fetchData()
                        }}
                        className="bg-white/5 border border-rose/20 p-3 text-[10px] uppercase tracking-widest text-rose outline-none"
                       >
                         {STATUTS.map(s => <option key={s} value={s} className="bg-[#0D0800]">{STATUT_LABELS[s]}</option>)}
                       </select>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── NOUVEAU PARFUM (MATCHING SCREENSHOT) ── */}
          {onglet === '+ nouveau parfum' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="new">
              <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-16">
                 
                 {/* Photo Section */}
                 <div>
                    <h3 className="text-[10px] tracking-[0.4em] uppercase text-rose/60 mb-8">Photo du Parfum</h3>
                    <div className="aspect-square bg-rose/5 border-2 border-dashed border-rose/20 flex flex-col items-center justify-center relative group cursor-pointer hover:bg-rose/10 transition-all overflow-hidden">
                       {newParfum.image_url ? (
                         <img src={newParfum.image_url} alt="Aperçu parfum" className="w-full h-full object-contain p-10" />
                       ) : (
                         <>
                           <div className="text-4xl text-rose/30 mb-4">📸</div>
                           <div className="text-[10px] text-rose/60 uppercase tracking-widest">Cliquer pour uploader</div>
                           <div className="text-[9px] text-rose/30 mt-2 uppercase">JPG, PNG — max 5MB</div>
                         </>
                       )}
                       <input type="file" onChange={(e) => handleUpload(e, 'parfum')} className="absolute inset-0 opacity-0 cursor-pointer" />
                       {uploading && <div className="absolute inset-0 bg-[#0D0800]/80 flex items-center justify-center text-[10px] uppercase tracking-widest text-rose">Upload en cours...</div>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                       <div className="border border-rose/10 p-4 text-center">
                          <div className="text-xl text-rose/30">📷</div>
                          <div className="text-[9px] text-rose/40 uppercase mt-1">Prendre photo</div>
                       </div>
                       <div className="border border-rose/10 p-4 text-center">
                          <div className="text-xl text-rose/30">🖼️</div>
                          <div className="text-[9px] text-rose/40 uppercase mt-1">Galerie</div>
                       </div>
                    </div>
                    <p className="text-[9px] text-rose/20 mt-4 italic leading-relaxed">
                      Prenez la photo directement depuis votre téléphone ou importez depuis la galerie. L&apos;image sera automatiquement optimisée.
                    </p>
                 </div>

                 {/* Form Section */}
                 <div className="space-y-10">
                    <h3 className="text-[10px] tracking-[0.4em] uppercase text-rose/60">Informations du Parfum</h3>
                    
                    <div className="grid grid-cols-1 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose/40">Nom du parfum *</label>
                          <input 
                            placeholder="ex: Santal Mystique"
                            value={newParfum.nom}
                            onChange={e => setNewParfum({...newParfum, nom: e.target.value})}
                            className="w-full bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40 transition-colors"
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-rose/40">Famille olfactive *</label>
                            <select 
                              value={newParfum.famille}
                              onChange={e => setNewParfum({...newParfum, famille: e.target.value})}
                              className="w-full bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40"
                            >
                              <option value="">Choisir...</option>
                              {['Floral', 'Boisé', 'Oriental', 'Agrumes', 'Frais'].map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-rose/40">Inspiré de</label>
                            <input 
                              placeholder="ex: Dior Sauvage"
                              value={newParfum.marque_inspiree}
                              onChange={e => setNewParfum({...newParfum, marque_inspiree: e.target.value})}
                              className="w-full bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40"
                            />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose/40">Notes olfactives (Résumé)</label>
                          <div className="grid grid-cols-3 gap-4">
                             <input placeholder="Tête" value={newParfum.notes_tete} onChange={e => setNewParfum({...newParfum, notes_tete: e.target.value})} className="bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40" />
                             <input placeholder="Coeur" value={newParfum.notes_coeur} onChange={e => setNewParfum({...newParfum, notes_coeur: e.target.value})} className="bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40" />
                             <input placeholder="Fond" value={newParfum.notes_fond} onChange={e => setNewParfum({...newParfum, notes_fond: e.target.value})} className="bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40" />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose/40">Prix par contenance (FCFA) *</label>
                          <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-1">
                                <span className="text-[8px] text-rose/30">30ml</span>
                                <input type="number" placeholder="8000" value={newParfum.prix_30ml} onChange={e => setNewParfum({...newParfum, prix_30ml: e.target.value})} className="w-full bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40" />
                             </div>
                             <div className="space-y-1">
                                <span className="text-[8px] text-rose/30">50ml</span>
                                <input type="number" placeholder="12000" value={newParfum.prix_50ml} onChange={e => setNewParfum({...newParfum, prix_50ml: e.target.value})} className="w-full bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40" />
                             </div>
                             <div className="space-y-1">
                                <span className="text-[8px] text-rose/30">100ml</span>
                                <input type="number" placeholder="18000" value={newParfum.prix_100ml} onChange={e => setNewParfum({...newParfum, prix_100ml: e.target.value})} className="w-full bg-white/5 border border-rose/10 p-4 text-cream outline-none focus:border-rose/40" />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-10">
                       <div className="flex items-center gap-3">
                          <input type="checkbox" id="visible" checked={newParfum.actif === 1} onChange={e => setNewParfum({...newParfum, actif: e.target.checked ? 1 : 0})} className="accent-rose w-4 h-4" />
                          <label htmlFor="visible" className="text-[10px] uppercase tracking-widest text-cream">Visible dans le catalogue</label>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-10">
                       <button onClick={saveParfum} className="btn-gold flex-1 py-6 text-[11px]">Publier le parfum</button>
                       <button onClick={() => setOnglet('catalogue')} className="px-10 border border-rose/20 text-rose/40 text-[10px] uppercase tracking-widest hover:text-rose transition-colors">Brouillon</button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ── ESSENCES ── */}
          {onglet === 'essences' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="ess">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[10px] tracking-[0.4em] uppercase text-rose/60">Essences disponibles — <span className="italic">Mélanges sur mesure</span></h3>
                  <button className="btn-gold py-3 px-8 text-[9px]">+ Nouvelle Essence</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {essences.map(e => (
                    <div key={e.id} className="glass-card p-8 flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-full border border-rose/10 flex items-center justify-center overflow-hidden bg-rose/5">
                             {e.image_url ? (
                               <img src={e.image_url} alt={e.nom} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-6 h-6 rounded-full" style={{ background: e.couleur }} />
                             )}
                          </div>
                          <div>
                             <div className="font-display text-lg mb-1">{e.nom}</div>
                             <div className="text-[9px] uppercase tracking-widest text-rose/40">{e.famille} · {e.note}</div>
                          </div>
                       </div>
                       <button className="text-[10px] uppercase tracking-widest text-rose/30 hover:text-rose border border-rose/10 px-4 py-2">Edit</button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-rose/10 p-8 flex items-center justify-center gap-4 cursor-pointer hover:bg-rose/5 transition-all">
                     <span className="text-2xl text-rose/20">+</span>
                     <span className="text-[10px] uppercase tracking-widest text-rose/30">Ajouter essence</span>
                  </div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </main>
  )
}
