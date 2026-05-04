'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ───────────────────────────────────────
interface Essence {
  id: number
  nom: string
  famille: string
  note: string
  couleur: string
  description: string
}

interface Parfum {
  id: number
  nom: string
  marque_inspiree: string
  famille: string
  prix_30ml: number
  prix_50ml: number
  prix_100ml: number
  notes_tete: string
  notes_coeur: string
  notes_fond: string
  image_url?: string
}

const FAMILLES = ['Tous', 'Floral', 'Agrumes', 'Boisé', 'Oriental', 'Gourmand', 'Musqué', 'Frais', 'Épicé']
const ML_OPTIONS = [
  { val: 30, label: '30 ml', prix_base: 8000 },
  { val: 50, label: '50 ml', prix_base: 12000 },
  { val: 100, label: '100 ml', prix_base: 18000 },
]

// ─── Animations ───
const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
}

const cardVariants = {
  hover: { y: -5, borderColor: 'var(--gold)', boxShadow: '0 10px 30px rgba(201, 168, 76, 0.15)' },
  tap: { scale: 0.98 }
}


// ─── Main Component ───────────────────────────────
export default function Configurateur() {
  const router = useRouter()
  const [mode, setMode] = useState<'catalogue' | 'melange'>('catalogue')
  const [essences, setEssences] = useState<Essence[]>([])
  const [parfums, setParfums] = useState<Parfum[]>([])
  const [loading, setLoading] = useState(true)

  // Catalogue state
  const [filtreRecherche, setFiltreRecherche] = useState('')
  const [filtreFamille, setFiltreFamille] = useState('Tous')
  const [parfumSelectionne, setParfumSelectionne] = useState<Parfum | null>(null)

  // Mélange state
  const [essencesChoisies, setEssencesChoisies] = useState<Essence[]>([])
  const [filtreFamilleEss, setFiltreFamilleEss] = useState('Tous')

  // Commun
  const [ml, setMl] = useState(50)
  const [couleur, setCouleur] = useState('#E8C97A')
  const [gravure, setGravure] = useState('')
  const [retrait, setRetrait] = useState<'boutique' | 'livraison'>('boutique')
  const [nomClient, setNomClient] = useState('')
  const [telClient, setTelClient] = useState('')
  const [emailClient, setEmailClient] = useState('')
  const [dateSouhaitee, setDateSouhaitee] = useState('')
  const [etape, setEtape] = useState<'quiz' | 'choix' | 'personalisation' | 'coordonnees' | 'confirmation'>('quiz')
  const [submitting, setSubmitting] = useState(false)
  const [commandeRef, setCommandeRef] = useState('')
  
  // Quiz state
  const [quizStep, setQuizStep] = useState(0)
  const [reponsesQuiz, setReponsesQuiz] = useState<string[]>([])
  const [recommandation, setRecommandation] = useState<string | null>(null)
  const [questionsQuiz, setQuestionsQuiz] = useState<any[]>([])
  const [loadingQuiz, setLoadingQuiz] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Vérifier la session
    fetch('/api/auth').then(r => r.json()).then(data => {
      if (data.authenticated) {
        setUser(data.user)
        setNomClient(data.user.nom || '')
        setEmailClient(data.user.email || '')
      }
    })

    // Charger le quiz
    fetch('/api/quiz').then(r => r.json()).then(data => {
      if (data.success) setQuestionsQuiz(data.data)
      setLoadingQuiz(false)
    }).catch(() => setLoadingQuiz(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
    router.push('/')
  }

  const finaliserQuiz = (reponses: string[]) => {
    // Logique simple : on prend la valeur la plus fréquente
    const counts: any = {}
    reponses.forEach(r => counts[r] = (counts[r] || 0) + 1)
    const gagnant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
    
    setRecommandation(`Nous vous conseillons les notes : ${gagnant}`)
    setFiltreFamille(gagnant) // On pré-filtre pour aider le client
    setFiltreFamilleEss(gagnant)
    setQuizStep(questionsQuiz.length) // Passer à l'écran de résultat
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Load data
  useEffect(() => {
    Promise.all([
      fetch('/api/essences').then(r => r.json()),
      fetch('/api/parfums').then(r => r.json()),
    ]).then(([essData, parData]) => {
      if (essData.success) setEssences(essData.data)
      if (parData.success) setParfums(parData.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ─── Computed ───
  const parfumsFiltres = parfums.filter(p => {
    const matchRecherche = (p.nom || '').toLowerCase().includes(filtreRecherche.toLowerCase()) ||
      (p.marque_inspiree || '').toLowerCase().includes(filtreRecherche.toLowerCase())
    const matchFamille = filtreFamille === 'Tous' || (p.famille || '').includes(filtreFamille)
    return matchRecherche && matchFamille
  })

  const essencesFiltrees = essences.filter(e =>
    filtreFamilleEss === 'Tous' || e.famille === filtreFamilleEss
  )

  const prixActuel = () => {
    if (mode === 'catalogue' && parfumSelectionne) {
      const prix = ml === 30 ? parfumSelectionne.prix_30ml : ml === 50 ? parfumSelectionne.prix_50ml : parfumSelectionne.prix_100ml
      return prix || 0
    }
    return ML_OPTIONS.find(o => o.val === ml)?.prix_base || 12000
  }

  const peutContinuer = () => {
    if (etape === 'choix') {
      return mode === 'catalogue' ? parfumSelectionne !== null : essencesChoisies.length >= 2
    }
    return true
  }

  // ─── Submit ───
  const enregistrerCommande = async () => {
    try {
      const payload = {
        client_nom: nomClient,
        client_telephone: telClient,
        client_email: emailClient,
        mode_commande: mode,
        parfum_catalogue_id: parfumSelectionne?.id || null,
        parfum_catalogue_nom: parfumSelectionne?.nom || null,
        ml,
        couleur_parfum: couleur,
        gravure,
        retrait,
        date_souhaitee: dateSouhaitee,
        essences_ids: essencesChoisies.map(e => e.id),
        prix_total: prixActuel(),
      }
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setCommandeRef(data.reference)
        setEtape('confirmation')
        const msg = buildWhatsAppMessage(data.reference)
        window.open(`https://wa.me/22870993597?text=${encodeURIComponent(msg)}`, '_blank')
      } else {
        alert("Erreur : " + (data.error || "Inconnu"))
      }
    } catch (e) {
      setCommandeRef('MB-TEMP' + Date.now().toString(36).toUpperCase())
      setEtape('confirmation')
    }
    setSubmitting(false)
  }

  const buildWhatsAppMessage = (ref: string) => {
    let msg = `🌸 *Nouvelle Commande Maya Bar*\n`
    msg += `📋 Réf: *${ref}*\n\n`
    msg += `👤 Client: ${nomClient}\n`
    if (mode === 'catalogue' && parfumSelectionne) {
      msg += `🌹 Parfum: *${parfumSelectionne.nom}* (${parfumSelectionne.marque_inspiree})\n`
    } else {
      msg += `🧪 Mélange: ${essencesChoisies.map(e => e.nom).join(', ')}\n`
    }
    msg += `📦 Flacon: *${ml}ml*\n`
    if (gravure) msg += `✍️ Gravure: "${gravure}"\n`
    msg += `🚚 Retrait: ${retrait}\n`
    msg += `\n💰 Total: *${prixActuel().toLocaleString('fr-FR')} FCFA*`
    return msg
  }

  // ─── Render ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-brown">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-deep-brown text-cream pb-20">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-deep-brown/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-gold no-underline">
          Maya Bar <span className="opacity-40 font-light text-sm">Configurateur</span>
        </Link>

        {/* User Account / Login */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/mon-compte" className="text-[10px] uppercase tracking-widest text-cream/70 hover:text-gold transition-colors">
                Mon Compte ({user.nom})
              </Link>
              <button onClick={logout} className="text-[10px] uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors border-l border-white/10 pl-4">
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/connexion" className="text-[10px] uppercase tracking-widest text-cream/70 hover:text-gold transition-colors">
                Connexion
              </Link>
              <Link href="/inscription" className="btn-gold px-4 py-2 text-[9px]">
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
        
        {/* Progress Tracker */}
        <div className="hidden md:flex items-center gap-6">
          {(['choix', 'personalisation', 'coordonnees'] as const).map((s, i) => {
            const active = etape === s
            const past = ['confirmation', 'coordonnees', 'personalisation'].slice(0, ['choix','personalisation','coordonnees'].indexOf(etape)).includes(s)
            return (
              <div key={s} className="flex items-center gap-3">
                <motion.div 
                  animate={{ 
                    scale: active ? 1.1 : 1,
                    backgroundColor: active ? '#C9A84C' : past ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                    borderColor: active ? '#C9A84C' : 'rgba(201,168,76,0.3)'
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold ${active ? 'text-deep-brown' : 'text-gold'}`}
                >
                  {past ? '✓' : i + 1}
                </motion.div>
                <span className={`text-[9px] uppercase tracking-[0.2em] ${active ? 'text-gold' : 'text-cream/30'}`}>{s}</span>
                {i < 2 && <div className="w-8 h-px bg-white/5" />}
              </div>
            )
          })}
        </div>

        <Link href="/admin" className="text-[9px] uppercase tracking-widest text-gold/50 border border-gold/20 px-4 py-2 hover:bg-gold/5 transition-colors">
          Admin
        </Link>
      </header>

      <div className="max-w-[1200px] mx-auto px-8 pt-12">
        
        <AnimatePresence mode="wait">
          
          {/* ── ÉTAPE 0 : QUIZ OLFACTIF ── */}
          {etape === 'quiz' && (
            <motion.div key="quiz" {...stepVariants} className="max-w-[800px] mx-auto text-center py-10">
              <div className="mb-12">
                <h1 className="font-display text-5xl font-light mb-4 text-cream">Découvrez votre <span className="italic text-gold">Profil</span></h1>
                <p className="text-cream/40 font-light tracking-wide uppercase text-[10px]">Laissez-nous vous guider vers votre signature idéale</p>
              </div>

              {loadingQuiz ? (
                <div className="text-gold animate-pulse">Chargement du quiz...</div>
              ) : questionsQuiz.length > 0 && quizStep < questionsQuiz.length ? (
                <div className="space-y-12">
                   <div className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Question {quizStep + 1} / {questionsQuiz.length}</div>
                   <h2 className="text-3xl font-light text-cream">{questionsQuiz[quizStep].question}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                      {JSON.parse(typeof questionsQuiz[quizStep].options === 'string' ? questionsQuiz[quizStep].options : JSON.stringify(questionsQuiz[quizStep].options)).map((opt: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            const newReponses = [...reponsesQuiz, opt.valeur]
                            setReponsesQuiz(newReponses)
                            if (quizStep + 1 < questionsQuiz.length) {
                              setQuizStep(quizStep + 1)
                            } else {
                              // Fin du quiz
                              finaliserQuiz(newReponses)
                            }
                          }}
                          className="glass-card p-6 hover:border-gold transition-all text-sm font-light tracking-wide"
                        >
                          {opt.label}
                        </button>
                      ))}
                   </div>
                   <div className="pt-10">
                      <button onClick={() => setEtape('choix')} className="text-[10px] uppercase tracking-widest text-cream/30 hover:text-gold transition-colors">Passer le quiz →</button>
                   </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                   <div className="text-8xl mb-6">✨</div>
                   <h2 className="text-3xl font-light text-cream">Votre recommandation</h2>
                   <div className="glass-card p-10 border-gold/30 inline-block">
                      <p className="text-gold text-xl font-medium tracking-wide mb-2">{recommandation}</p>
                      <p className="text-cream/40 text-xs italic">Basé sur vos préférences olfactives</p>
                   </div>
                   <div className="pt-10">
                      <button onClick={() => setEtape('choix')} className="btn-gold px-12">Commencer la création</button>
                   </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── ÉTAPE 1 : CHOIX ── */}
          {etape === 'choix' && (
            <motion.div key="choix" {...stepVariants}>
              <div className="mb-12">
                <h1 className="font-display text-5xl font-light mb-4 text-cream">Créez votre <span className="italic text-gold">Sillage</span></h1>
                <p className="text-cream/40 font-light tracking-wide">Choisissez un parfum de notre catalogue ou composez votre propre mélange.</p>
              </div>

              {/* Toggle Mode */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-sm w-fit border border-white/5 mb-12">
                {[{ v: 'catalogue', l: '📚 Catalogue' }, { v: 'melange', l: '🧪 Sur-mesure' }].map(m => (
                  <button 
                    key={m.v} 
                    onClick={() => setMode(m.v as any)}
                    className={`px-8 py-3 text-[11px] uppercase tracking-widest transition-all ${mode === m.v ? 'bg-gold text-deep-brown font-bold' : 'text-cream/50 hover:text-cream'}`}
                  >
                    {m.l}
                  </button>
                ))}
              </div>

              {mode === 'catalogue' ? (
                <div className="space-y-8">
                  <div className="flex gap-4 items-center flex-wrap">
                    <input 
                      placeholder="Chercher un parfum, une inspiration..."
                      value={filtreRecherche}
                      onChange={e => setFiltreRecherche(e.target.value)}
                      className="bg-white/5 border border-white/10 px-6 py-4 flex-1 min-w-[300px] text-sm focus:border-gold/50 outline-none transition-colors"
                    />
                    <div className="flex gap-2">
                      {['Tous', 'Floral', 'Frais', 'Oriental'].map(f => (
                        <button 
                          key={f} 
                          onClick={() => setFiltreFamille(f)}
                          className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${filtreFamille === f ? 'border-gold text-gold bg-gold/5' : 'border-white/5 text-cream/40 hover:border-white/20'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parfumsFiltres.map(p => (
                      <motion.div 
                        key={p.id}
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setParfumSelectionne(p)}
                        className={`glass-card p-8 cursor-pointer relative transition-all ${parfumSelectionne?.id === p.id ? 'border-gold ring-1 ring-gold/50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] uppercase tracking-widest text-gold/60">{p.famille}</span>
                          {parfumSelectionne?.id === p.id && <span className="w-5 h-5 bg-gold rounded-full flex items-center justify-center text-deep-brown text-[10px]">✓</span>}
                        </div>
                        <h3 className="font-display text-2xl mb-1">{p.nom}</h3>
                        <p className="text-[10px] text-cream/30 uppercase tracking-widest mb-6">Inspiré de {p.marque_inspiree}</p>
                        <div className="space-y-1 text-[11px] text-cream/50 mb-8">
                          <p><span className="text-gold/50">Notes:</span> {p.notes_coeur}</p>
                          <p><span className="text-gold/50">Sillage:</span> {p.notes_fond}</p>
                        </div>
                        <div className="text-xl text-gold font-medium">{p.prix_50ml.toLocaleString()} FCFA <span className="text-[9px] text-cream/20">/ 50ml</span></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                   <div className="bg-gold/5 border border-gold/10 p-6 rounded-sm flex items-center justify-between flex-wrap gap-6">
                      <div className="text-sm">
                        Sélectionnez <span className="text-gold font-bold">2 à 4 essences</span> pour votre mélange unique.
                      </div>
                      <div className="flex gap-2">
                        {essencesChoisies.map(e => (
                          <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            key={e.id} 
                            onClick={() => setEssencesChoisies(prev => prev.filter(x => x.id !== e.id))}
                            className="bg-gold/10 border border-gold/20 px-3 py-1 rounded-full text-[10px] flex items-center gap-2 cursor-pointer hover:bg-gold/20"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ background: e.couleur }} />
                            {e.nom} <span className="opacity-50">×</span>
                          </motion.div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {essencesFiltrees.map(e => {
                        const active = essencesChoisies.some(x => x.id === e.id)
                        const disabled = essencesChoisies.length >= 4 && !active
                        return (
                          <motion.div 
                            key={e.id}
                            variants={cardVariants}
                            whileHover={!disabled ? "hover" : ""}
                            whileTap={!disabled ? "tap" : ""}
                            onClick={() => !disabled && setEssencesChoisies(prev => active ? prev.filter(x => x.id !== e.id) : [...prev, e])}
                            className={`glass-card p-6 cursor-pointer text-center group transition-all ${active ? 'border-gold bg-gold/10' : disabled ? 'opacity-30' : ''}`}
                          >
                            <div className="w-12 h-12 rounded-full mx-auto mb-4 border-2 border-white/5 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                               <div className="w-full h-full rounded-full shadow-inner" style={{ background: e.couleur }} />
                            </div>
                            <h4 className="text-xs font-medium mb-1">{e.nom}</h4>
                            <p className="text-[9px] uppercase tracking-tighter text-cream/40">{e.note}</p>
                          </motion.div>
                        )
                      })}
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : PERSONALISATION ── */}
          {etape === 'personalisation' && (
            <motion.div key="perso" {...stepVariants} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20">
              <div className="space-y-16">
                <div>
                  <h2 className="font-display text-4xl mb-2">Configurez votre <span className="italic text-gold">Objet de Luxe</span></h2>
                  <p className="text-cream/40 text-sm">Chaque détail compte pour faire de ce parfum le vôtre.</p>
                </div>

                {/* Contenance */}
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold/60">Contenance & Prix</label>
                  <div className="grid grid-cols-3 gap-4">
                    {ML_OPTIONS.map(opt => (
                      <motion.button 
                        key={opt.val}
                        whileHover={{ y: -4 }}
                        onClick={() => setMl(opt.val)}
                        className={`p-6 border text-left transition-all ${ml === opt.val ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <div className="text-2xl font-display mb-2">{opt.val}ml</div>
                        <div className="text-[10px] text-gold">{ML_OPTIONS.find(o => o.val === opt.val)?.prix_base.toLocaleString()} FCFA</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Gravure */}
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold/60">Gravure Laser Personnalisée</label>
                  <input 
                    maxLength={20}
                    placeholder="Votre nom, une date, un message..."
                    value={gravure}
                    onChange={e => setGravure(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-4 font-display text-3xl focus:border-gold outline-none transition-colors"
                  />
                  <p className="text-[10px] text-cream/20 italic">La gravure est réalisée au diamant sur le verre du flacon.</p>
                </div>

                {/* Retrait */}
                <div className="space-y-6">
                   <label className="text-[10px] uppercase tracking-[0.3em] text-gold/60">Mode de Retrait</label>
                   <div className="flex gap-4">
                      {[{ v: 'boutique', l: '🏪 Boutique Lomé' }, { v: 'livraison', l: '🛵 Livraison Domicile' }].map(opt => (
                        <button 
                          key={opt.v}
                          onClick={() => setRetrait(opt.v as any)}
                          className={`flex-1 p-6 border text-[11px] uppercase tracking-widest transition-all ${retrait === opt.v ? 'border-gold bg-gold/5 text-gold' : 'border-white/10 text-cream/40'}`}
                        >
                          {opt.l}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              {/* Preview Flacon */}
              <div className="relative group">
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="glass-card p-12 text-center aspect-[4/5] flex flex-col items-center justify-center relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-32 h-56 border-2 border-gold/40 rounded-sm relative mb-10">
                       <motion.div 
                        initial={false}
                        animate={{ backgroundColor: couleur }}
                        className="absolute inset-x-2 bottom-2 top-12 opacity-60 blur-[1px]"
                       />
                       <div className="absolute inset-x-0 top-0 h-10 bg-gold/20 border-b border-gold/40" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-xs text-white/80 italic tracking-widest rotate-[-90deg] uppercase">{gravure || "Signature"}</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h3 className="font-display text-3xl text-gold">{prixActuel().toLocaleString()} FCFA</h3>
                       <p className="text-[10px] tracking-[0.3em] text-cream/40 uppercase">Flacon {ml}ml sur-mesure</p>
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : COORDONNÉES ── */}
          {etape === 'coordonnees' && (
            <motion.div key="coords" {...stepVariants} className="max-w-[600px] mx-auto text-center">
              <h2 className="font-display text-5xl mb-8">Dernière <span className="italic text-gold">Étape</span></h2>
              <p className="text-cream/50 mb-12">Laissez-nous vos coordonnées pour que nous puissions préparer votre écrin.</p>
              
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">Nom Complet</label>
                  <input value={nomClient} onChange={e => setNomClient(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 focus:border-gold outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">WhatsApp (+228...)</label>
                  <input value={telClient} onChange={e => setTelClient(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 focus:border-gold outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">Email (pour la confirmation)</label>
                  <input type="email" value={emailClient} onChange={e => setEmailClient(e.target.value)} placeholder="votre@email.com" className="w-full bg-white/5 border border-white/10 p-5 focus:border-gold outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">Date Souhaitée</label>
                  <input type="date" value={dateSouhaitee} onChange={e => setDateSouhaitee(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 focus:border-gold outline-none transition-all color-scheme-dark" />
                </div>
              </div>

              <div className="mt-12 p-8 bg-gold/5 border border-gold/10 text-left">
                 <h4 className="text-[10px] uppercase tracking-widest text-gold mb-4">Récapitulatif</h4>
                 <div className="flex justify-between items-end">
                    <div className="text-sm text-cream/60">
                       {mode === 'catalogue' ? `Inspiration: ${parfumSelectionne?.nom}` : `Mélange Personnalisé (${essencesChoisies.length} essences)`}<br />
                       Flacon {ml}ml · {retrait}
                    </div>
                    <div className="text-3xl font-display text-gold">{prixActuel().toLocaleString()} FCFA</div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 4 : CONFIRMATION ── */}
          {etape === 'confirmation' && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[700px] mx-auto text-center py-20">
               <div className="text-8xl mb-10">✨</div>
               <h2 className="font-display text-5xl mb-6">Votre parfum est en <span className="italic text-gold">Chemin</span></h2>
               <p className="text-cream/50 text-lg mb-12">Référence: <span className="text-gold font-bold tracking-widest">{commandeRef}</span></p>
               
               <div className="bg-white/5 p-10 border border-gold/20 mb-12 text-left space-y-6">
                  <p className="text-sm leading-relaxed">
                    Un récapitulatif a été envoyé par <strong>Email</strong> et votre application <strong>WhatsApp</strong> va s&apos;ouvrir pour finaliser le retrait.
                  </p>
                  <div className="h-px bg-white/10" />
                  <div className="flex gap-10 items-center">
                     <div className="text-xs uppercase tracking-widest text-gold">Mode de Paiement</div>
                     <div className="text-sm text-cream/70">TMoney / Flooz au <span className="text-gold">70 99 35 97</span> ou Espèces en boutique.</div>
                  </div>
               </div>

               <div className="flex gap-4 justify-center">
                  <Link href="/"><button className="btn-gold px-12">Retour à l&apos;accueil</button></Link>
               </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── NAVIGATION ── */}
        {etape !== 'confirmation' && (
          <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center">
            <button 
              onClick={() => {
                if (etape === 'choix') window.history.back()
                else if (etape === 'personalisation') setEtape('choix')
                else if (etape === 'coordonnees') setEtape('personalisation')
              }}
              className="text-[10px] uppercase tracking-widest text-cream/30 hover:text-cream transition-colors"
            >
              ← Retour
            </button>
            
            <button 
              disabled={!peutContinuer() || submitting}
              onClick={() => {
                if (etape === 'choix') setEtape('personalisation')
                else if (etape === 'personalisation') setEtape('coordonnees')
                else if (etape === 'coordonnees') { setSubmitting(true); enregistrerCommande(); }
              }}
              className={`btn-gold px-12 ${!peutContinuer() || submitting ? 'opacity-30 grayscale pointer-events-none' : ''}`}
            >
              {submitting ? 'Envoi...' : etape === 'coordonnees' ? '🚀 Confirmer la Commande' : 'Continuer →'}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
