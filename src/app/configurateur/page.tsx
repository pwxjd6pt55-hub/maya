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
  image_url?: string
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
  hover: { y: -5, borderColor: 'var(--rose)', boxShadow: '0 10px 30px rgba(188, 124, 124, 0.15)' },
  tap: { scale: 0.98 }
}

export default function Configurateur() {
  const router = useRouter()
  const [mode, setMode] = useState<'catalogue' | 'melange_essences' | 'melange_parfums'>('catalogue')
  const [essences, setEssences] = useState<Essence[]>([])
  const [parfums, setParfums] = useState<Parfum[]>([])
  const [loading, setLoading] = useState(true)

  // Selection states
  const [parfumSelectionne, setParfumSelectionne] = useState<Parfum | null>(null)
  const [essencesChoisies, setEssencesChoisies] = useState<Essence[]>([])
  const [parfumsChoisis, setParfumsChoisis] = useState<Parfum[]>([])

  // Filters
  const [filtreRecherche, setFiltreRecherche] = useState('')
  const [filtreFamille, setFiltreFamille] = useState('Tous')
  const [filtreFamilleEss, setFiltreFamilleEss] = useState('Tous')

  // Common
  const [ml, setMl] = useState(50)
  const [couleur, setCouleur] = useState('#BC7C7C')
  const [gravure, setGravure] = useState('')
  const [retrait, setRetrait] = useState<'boutique' | 'livraison'>('boutique')
  const [nomClient, setNomClient] = useState('')
  const [telClient, setTelClient] = useState('')
  const [emailClient, setEmailClient] = useState('')
  const [dateSouhaitee, setDateSouhaitee] = useState('')
  const [etape, setEtape] = useState<'quiz' | 'choix' | 'personalisation' | 'coordonnees' | 'confirmation'>('quiz')
  const [submitting, setSubmitting] = useState(false)
  const [commandeRef, setCommandeRef] = useState('')
  const [user, setUser] = useState<any>(null)

  // Quiz
  const [quizStep, setQuizStep] = useState(0)
  const [reponsesQuiz, setReponsesQuiz] = useState<string[]>([])
  const [recommandation, setRecommandation] = useState<string | null>(null)
  const [questionsQuiz, setQuestionsQuiz] = useState<any[]>([])
  const [loadingQuiz, setLoadingQuiz] = useState(true)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(data => {
      if (data.authenticated) {
        setUser(data.user)
        setNomClient(data.user.nom || '')
        setEmailClient(data.user.email || '')
      }
    })
    fetch('/api/quiz').then(r => r.json()).then(data => {
      if (data.success) setQuestionsQuiz(data.data)
      setLoadingQuiz(false)
    }).catch(() => setLoadingQuiz(false))

    Promise.all([
      fetch('/api/essences').then(r => r.json()),
      fetch('/api/parfums').then(r => r.json()),
    ]).then(([essData, parData]) => {
      if (essData.success) setEssences(essData.data)
      if (parData.success) setParfums(parData.data)
      setLoading(false)
    }).catch(() => setLoading(false))
    // Check for direct checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('step') === 'final') {
      setEtape('coordonnees');
    }
  }, [])

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
    router.push('/')
  }

  const finaliserQuiz = (reponses: string[]) => {
    const counts: any = {}
    reponses.forEach(r => counts[r] = (counts[r] || 0) + 1)
    const gagnant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
    setRecommandation(`Nous vous conseillons les notes : ${gagnant}`)
    setFiltreFamille(gagnant)
    setFiltreFamilleEss(gagnant)
    setQuizStep(questionsQuiz.length)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      return ml === 30 ? parfumSelectionne.prix_30ml : ml === 50 ? parfumSelectionne.prix_50ml : parfumSelectionne.prix_100ml
    }
    if (mode === 'melange_parfums' && parfumsChoisis.length > 0) {
      // Prix moyen des parfums choisis + 10% pour le mélange
      const sum = parfumsChoisis.reduce((acc, p) => acc + (ml === 30 ? p.prix_30ml : ml === 50 ? p.prix_50ml : p.prix_100ml), 0)
      return Math.round((sum / parfumsChoisis.length) * 1.1)
    }
    return ML_OPTIONS.find(o => o.val === ml)?.prix_base || 12000
  }

  const peutContinuer = () => {
    if (etape === 'choix') {
      if (mode === 'catalogue') return parfumSelectionne !== null
      if (mode === 'melange_essences') return essencesChoisies.length >= 2
      if (mode === 'melange_parfums') return parfumsChoisis.length >= 2
    }
    return true
  }

  // ─── Cart Integration ───
  const ajouterAuPanier = async () => {
    if (!user) {
      router.push('/connexion?redirect=/configurateur')
      return
    }
    setSubmitting(true)
    const payload = {
      item_type: mode,
      parfum_catalogue_id: mode === 'catalogue' ? parfumSelectionne?.id : null,
      nom_personnalise: mode === 'melange_essences' ? 'Mon Mélange d\'Essences' : mode === 'melange_parfums' ? 'Mon Mix de Parfums' : null,
      ml,
      prix: prixActuel(),
      quantite: 1,
      gravure,
      couleur,
      essences_json: mode === 'melange_essences' ? essencesChoisies.map(e => ({ id: e.id, nom: e.nom })) : null,
      parfums_json: mode === 'melange_parfums' ? parfumsChoisis.map(p => ({ id: p.id, nom: p.nom })) : null
    }

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (res.ok) {
      alert('Produit ajouté au panier !')
      router.push('/mon-compte') // Ou vers une page panier dédiée
    } else {
      alert('Erreur lors de l\'ajout au panier')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0D0800] text-rose animate-pulse">Chargement...</div>

  return (
    <main className="min-h-screen bg-[#0D0800] text-cream pb-20 selection:bg-rose/30">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#0D0800]/80 backdrop-blur-xl border-b border-rose/10 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-rose no-underline">
          MAYA BAR <span className="opacity-40 font-light text-sm tracking-widest ml-2">CONFIGURATEUR</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
               <Link href="/mon-compte" className="text-[10px] uppercase tracking-widest text-rose hover:text-rose-light transition-colors">Panier & Compte</Link>
               <button onClick={logout} className="text-[10px] uppercase tracking-widest text-rose/40 hover:text-rose border-l border-rose/10 pl-6">Déconnexion</button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
               <Link href="/connexion" className="text-[10px] uppercase tracking-widest text-rose/60 hover:text-rose transition-colors">Connexion</Link>
               <Link href="/inscription" className="btn-gold px-6 py-2.5 text-[9px]">S&apos;inscrire</Link>
            </div>
          )}
        </div>
        
        {/* Progress Tracker */}
        <div className="hidden lg:flex items-center gap-8">
          {(['choix', 'personalisation', 'coordonnees'] as const).map((s, i) => {
            const active = etape === s
            const past = ['confirmation', 'coordonnees', 'personalisation'].slice(0, ['choix','personalisation','coordonnees'].indexOf(etape)).includes(s)
            return (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${active ? 'bg-rose border-rose text-white scale-110' : past ? 'border-rose text-rose bg-rose/10' : 'border-rose/20 text-rose/20'}`}>
                  {past ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.2em] ${active ? 'text-rose' : 'text-rose/20'}`}>{s}</span>
                {i < 2 && <div className="w-8 h-px bg-rose/10" />}
              </div>
            )
          })}
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-8 pt-12">
        
        <AnimatePresence mode="wait">
          
          {/* ── ÉTAPE 0 : QUIZ ── */}
          {etape === 'quiz' && (
            <motion.div key="quiz" {...stepVariants} className="max-w-[800px] mx-auto text-center py-10">
              <div className="mb-16">
                <h1 className="font-display text-6xl font-light mb-6">Signature <span className="italic text-rose">Unique</span></h1>
                <p className="text-rose/40 font-light tracking-[0.3em] uppercase text-[10px]">Découvrez votre profil olfactif en quelques secondes</p>
              </div>

              {loadingQuiz ? (
                <div className="text-rose animate-pulse">Récupération du quiz...</div>
              ) : questionsQuiz.length > 0 && quizStep < questionsQuiz.length ? (
                <div className="space-y-16">
                   <div className="text-rose text-[11px] tracking-[0.5em] uppercase font-bold">Étape {quizStep + 1} / {questionsQuiz.length}</div>
                   <h2 className="text-4xl font-light font-display leading-tight">{questionsQuiz[quizStep].question}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                      {JSON.parse(typeof questionsQuiz[quizStep].options === 'string' ? questionsQuiz[quizStep].options : JSON.stringify(questionsQuiz[quizStep].options)).map((opt: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            const newReponses = [...reponsesQuiz, opt.valeur]
                            setReponsesQuiz(newReponses)
                            if (quizStep + 1 < questionsQuiz.length) setQuizStep(quizStep + 1)
                            else finaliserQuiz(newReponses)
                          }}
                          className="glass-card p-8 hover:border-rose transition-all text-sm font-light tracking-widest uppercase hover:bg-rose/5"
                        >
                          {opt.label}
                        </button>
                      ))}
                   </div>
                   <button onClick={() => setEtape('choix')} className="text-[10px] uppercase tracking-[0.4em] text-rose/30 hover:text-rose mt-10">Passer le guide →</button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   <div className="text-7xl mb-10">✨</div>
                   <h2 className="text-4xl font-display font-light">Votre recommandation</h2>
                   <div className="glass-card p-12 border-rose/30 inline-block bg-rose/5">
                      <p className="text-rose text-2xl font-medium tracking-widest mb-4">{recommandation}</p>
                      <p className="text-rose/30 text-[10px] uppercase tracking-widest italic">Basé sur vos préférences olfactives</p>
                   </div>
                   <div className="pt-12">
                      <button onClick={() => setEtape('choix')} className="btn-gold px-16 py-5">Accéder à la création</button>
                   </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── ÉTAPE 1 : CHOIX ── */}
          {etape === 'choix' && (
            <motion.div key="choix" {...stepVariants}>
              <div className="mb-16">
                <h1 className="font-display text-6xl font-light mb-6">Art & <span className="italic text-rose">Senteurs</span></h1>
                <p className="text-rose/40 font-light tracking-widest uppercase text-[10px]">Choisissez votre base de création</p>
              </div>

              {/* Toggle Mode */}
              <div className="flex flex-wrap gap-2 bg-rose/5 p-1 rounded-sm w-fit border border-rose/10 mb-16">
                {[
                  { v: 'catalogue', l: '🏺 Catalogue' }, 
                  { v: 'melange_parfums', l: '✨ Mix Parfums' },
                  { v: 'melange_essences', l: '🧪 Sur-mesure' }
                ].map(m => (
                  <button 
                    key={m.v} 
                    onClick={() => {
                      setMode(m.v as any)
                      setParfumSelectionne(null)
                      setParfumsChoisis([])
                      setEssencesChoisies([])
                    }}
                    className={`px-8 py-3 text-[10px] uppercase tracking-widest transition-all ${mode === m.v ? 'bg-rose text-white font-bold' : 'text-rose/40 hover:text-rose'}`}
                  >
                    {m.l}
                  </button>
                ))}
              </div>

              {/* Mode: CATALOGUE */}
              {mode === 'catalogue' && (
                <div className="space-y-10">
                  <div className="flex gap-4 items-center flex-wrap">
                    <input 
                      placeholder="Rechercher une fragrance..."
                      value={filtreRecherche}
                      onChange={e => setFiltreRecherche(e.target.value)}
                      className="bg-white/5 border border-rose/10 px-8 py-5 flex-1 min-w-[300px] text-sm focus:border-rose/40 outline-none transition-colors font-light"
                    />
                    <div className="flex gap-2">
                      {['Tous', 'Floral', 'Frais', 'Oriental'].map(f => (
                        <button 
                          key={f} 
                          onClick={() => setFiltreFamille(f)}
                          className={`px-6 py-3 text-[9px] uppercase tracking-widest border transition-all ${filtreFamille === f ? 'border-rose text-rose bg-rose/10' : 'border-rose/10 text-rose/30 hover:border-rose/30'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {parfumsFiltres.map(p => (
                      <motion.div 
                        key={p.id}
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setParfumSelectionne(p)}
                        className={`glass-card p-10 cursor-pointer relative transition-all ${parfumSelectionne?.id === p.id ? 'border-rose ring-1 ring-rose/50 bg-rose/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[9px] uppercase tracking-widest text-rose/50">{p.famille}</span>
                          {parfumSelectionne?.id === p.id && <span className="w-6 h-6 bg-rose rounded-full flex items-center justify-center text-white text-[10px]">✓</span>}
                        </div>
                        <h3 className="font-display text-3xl mb-1">{p.nom}</h3>
                        <p className="text-[10px] text-rose/30 uppercase tracking-widest mb-10 italic">Inspiré de {p.marque_inspiree}</p>
                        <div className="space-y-2 text-[11px] text-cream/40 mb-10 leading-relaxed">
                          <p><span className="text-rose/40 uppercase tracking-tighter mr-2">Cœur:</span> {p.notes_coeur}</p>
                          <p><span className="text-rose/40 uppercase tracking-tighter mr-2">Fond:</span> {p.notes_fond}</p>
                        </div>
                        <div className="text-2xl text-rose font-medium">{p.prix_50ml.toLocaleString()} F <span className="text-[9px] text-rose/30 uppercase tracking-widest">/ 50ml</span></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode: MIX PARFUMS */}
              {mode === 'melange_parfums' && (
                <div className="space-y-12">
                   <div className="bg-rose/5 border border-rose/10 p-8 rounded-sm flex items-center justify-between flex-wrap gap-8">
                      <div className="text-sm font-light">
                        Créez un sillage inédit en mélangeant <span className="text-rose font-bold">2 ou 3 parfums</span> iconiques.
                      </div>
                      <div className="flex gap-4">
                        {parfumsChoisis.map(p => (
                          <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            key={p.id} 
                            onClick={() => setParfumsChoisis(prev => prev.filter(x => x.id !== p.id))}
                            className="bg-rose/10 border border-rose/20 px-5 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:bg-rose/20 text-rose"
                          >
                            {p.nom} <span className="opacity-40">×</span>
                          </motion.div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {parfums.map(p => {
                        const active = parfumsChoisis.some(x => x.id === p.id)
                        const disabled = parfumsChoisis.length >= 3 && !active
                        return (
                          <motion.div 
                            key={p.id}
                            variants={cardVariants}
                            whileHover={!disabled ? "hover" : ""}
                            whileTap={!disabled ? "tap" : ""}
                            onClick={() => !disabled && setParfumsChoisis(prev => active ? prev.filter(x => x.id !== p.id) : [...prev, p])}
                            className={`glass-card p-8 cursor-pointer group transition-all text-center ${active ? 'border-rose bg-rose/10' : disabled ? 'opacity-20 grayscale' : ''}`}
                          >
                            <h4 className="font-display text-xl mb-1">{p.nom}</h4>
                            <p className="text-[9px] uppercase tracking-widest text-rose/40 mb-4">{p.famille}</p>
                            <div className="text-[10px] text-rose font-medium">{p.prix_50ml.toLocaleString()} F</div>
                          </motion.div>
                        )
                      })}
                   </div>
                </div>
              )}

              {/* Mode: ESSENCES */}
              {mode === 'melange_essences' && (
                <div className="space-y-12">
                   <div className="bg-rose/5 border border-rose/10 p-8 rounded-sm flex items-center justify-between flex-wrap gap-8">
                      <div className="text-sm font-light">
                        Assemblage haute-couture : sélectionnez <span className="text-rose font-bold">2 à 4 essences</span> pures.
                      </div>
                      <div className="flex gap-4">
                        {essencesChoisies.map(e => (
                          <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            key={e.id} 
                            onClick={() => setEssencesChoisies(prev => prev.filter(x => x.id !== e.id))}
                            className="bg-rose/10 border border-rose/20 px-5 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:bg-rose/20 text-rose"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ background: e.couleur }} />
                            {e.nom} <span className="opacity-40">×</span>
                          </motion.div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                            className={`glass-card p-8 cursor-pointer text-center group transition-all ${active ? 'border-rose bg-rose/10' : disabled ? 'opacity-20 grayscale' : ''}`}
                          >
                            <div className="w-14 h-14 rounded-full mx-auto mb-6 border border-rose/10 flex items-center justify-center p-1 group-hover:scale-110 transition-transform bg-rose/5">
                               <div className="w-full h-full rounded-full shadow-inner" style={{ background: e.couleur }} />
                            </div>
                            <h4 className="text-[11px] font-medium mb-1 uppercase tracking-widest">{e.nom}</h4>
                            <p className="text-[8px] uppercase tracking-[0.2em] text-rose/40 font-bold">{e.note}</p>
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
            <motion.div key="perso" {...stepVariants} className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-20">
              <div className="space-y-20">
                <div>
                   <h2 className="font-display text-5xl mb-4">Le Flacon <span className="italic text-rose">Signature</span></h2>
                   <p className="text-rose/40 text-[11px] uppercase tracking-widest">Détails de votre création d&apos;exception</p>
                </div>

                {/* Contenance */}
                <div className="space-y-8">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-rose/60 font-bold">Contenance & Prix</label>
                  <div className="grid grid-cols-3 gap-6">
                    {ML_OPTIONS.map(opt => (
                      <motion.button 
                        key={opt.val}
                        whileHover={{ y: -6, borderColor: '#BC7C7C' }}
                        onClick={() => setMl(opt.val)}
                        className={`p-8 border-2 text-left transition-all relative ${ml === opt.val ? 'border-rose bg-rose/5 shadow-[0_0_30px_rgba(188,124,124,0.1)]' : 'border-rose/10 hover:border-rose/30'}`}
                      >
                        <div className="text-3xl font-display mb-2">{opt.val}ml</div>
                        <div className="text-[11px] text-rose font-bold">
                          {mode === 'catalogue' && parfumSelectionne ? (opt.val === 30 ? parfumSelectionne.prix_30ml : opt.val === 50 ? parfumSelectionne.prix_50ml : parfumSelectionne.prix_100ml).toLocaleString() : opt.prix_base.toLocaleString()} F
                        </div>
                        {ml === opt.val && <div className="absolute top-2 right-2 w-2 h-2 bg-rose rounded-full" />}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Gravure */}
                <div className="space-y-8">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-rose/60 font-bold">Gravure Laser (Optionnelle)</label>
                  <input 
                    maxLength={20}
                    placeholder="Signature, date, initiales..."
                    value={gravure}
                    onChange={e => setGravure(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-rose/10 py-6 font-display text-4xl focus:border-rose outline-none transition-colors text-cream"
                  />
                  <p className="text-[10px] text-rose/30 italic uppercase tracking-widest">Gravure au diamant haute précision réalisée dans nos ateliers.</p>
                </div>

                {/* Retrait */}
                <div className="space-y-8">
                   <label className="text-[10px] uppercase tracking-[0.4em] text-rose/60 font-bold">Expérience de Retrait</label>
                   <div className="flex gap-6">
                      {[{ v: 'boutique', l: '🏪 Boutique Lomé' }, { v: 'livraison', l: '🛵 Livraison' }].map(opt => (
                        <button 
                          key={opt.v}
                          onClick={() => setRetrait(opt.v as any)}
                          className={`flex-1 p-8 border-2 text-[11px] font-bold uppercase tracking-[0.3em] transition-all ${retrait === opt.v ? 'border-rose bg-rose/5 text-rose' : 'border-rose/10 text-rose/20 hover:border-rose/40'}`}
                        >
                          {opt.l}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              {/* Preview Flacon */}
              <div className="relative sticky top-32 h-fit">
                 <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="glass-card p-16 text-center flex flex-col items-center justify-center relative overflow-hidden bg-rose/5 border-rose/20"
                 >
                    <div className="absolute inset-0 bg-gradient-to-b from-rose/10 to-transparent opacity-50" />
                    
                    <div className="w-36 h-64 border-2 border-rose/30 rounded-sm relative mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                       <motion.div 
                        initial={false}
                        animate={{ backgroundColor: couleur }}
                        className="absolute inset-x-2 bottom-2 top-16 opacity-40 blur-[2px]"
                       />
                       <div className="absolute inset-x-0 top-0 h-14 bg-rose/20 border-b border-rose/30" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-[11px] text-white/60 italic tracking-[0.4em] rotate-[-90deg] uppercase">{gravure || "Maya Bar"}</span>
                       </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                       <h3 className="font-display text-4xl text-rose font-bold">{prixActuel().toLocaleString()} F</h3>
                       <p className="text-[10px] tracking-[0.5em] text-rose/40 uppercase font-bold">Flacon {ml}ml sur-mesure</p>
                    </div>
                 </motion.div>
                 <div className="mt-8">
                    <button 
                      onClick={ajouterAuPanier}
                      disabled={submitting}
                      className="btn-gold w-full py-6 text-[11px] shadow-[0_15px_30px_rgba(188,124,124,0.2)]"
                    >
                      {submitting ? 'Traitement...' : '+ Ajouter au panier'}
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : COORDONNÉES ── */}
          {etape === 'coordonnees' && (
            <motion.div key="coords" {...stepVariants} className="max-w-[700px] mx-auto">
              <div className="text-center mb-16">
                 <h2 className="font-display text-6xl mb-4">L&apos;Écrin <span className="italic text-rose">Final</span></h2>
                 <p className="text-rose/40 text-[11px] uppercase tracking-widest font-light">Finalisez votre commande pour la préparation</p>
              </div>
              
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-rose/60 font-bold ml-1">Nom Complet</label>
                    <input value={nomClient} onChange={e => setNomClient(e.target.value)} className="w-full bg-white/5 border border-rose/10 p-6 focus:border-rose outline-none transition-all font-light" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-rose/60 font-bold ml-1">WhatsApp (+228...)</label>
                    <input value={telClient} onChange={e => setTelClient(e.target.value)} className="w-full bg-white/5 border border-rose/10 p-6 focus:border-rose outline-none transition-all font-light" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-rose/60 font-bold ml-1">Email de confirmation</label>
                  <input type="email" value={emailClient} onChange={e => setEmailClient(e.target.value)} className="w-full bg-white/5 border border-rose/10 p-6 focus:border-rose outline-none transition-all font-light" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-rose/60 font-bold ml-1">Date de Retrait Souhaitée</label>
                  <input type="date" value={dateSouhaitee} onChange={e => setDateSouhaitee(e.target.value)} className="w-full bg-white/5 border border-rose/10 p-6 focus:border-rose outline-none transition-all color-scheme-dark" />
                </div>
              </div>

              <div className="mt-16 p-12 bg-rose/5 border border-rose/20 rounded-sm">
                 <h4 className="text-[10px] uppercase tracking-[0.4em] text-rose mb-8 font-bold">Récapitulatif de création</h4>
                 <div className="flex justify-between items-end">
                    <div className="text-sm text-cream/50 leading-relaxed font-light">
                       {mode === 'catalogue' ? `🏺 Base: ${parfumSelectionne?.nom}` : 
                        mode === 'melange_parfums' ? `✨ Mix: ${parfumsChoisis.map(p => p.nom).join(', ')}` :
                        `🧪 Création: ${essencesChoisies.length} essences`}<br />
                       Flacon {ml}ml · {retrait}
                    </div>
                    <div className="text-4xl font-display text-rose font-bold">{prixActuel().toLocaleString()} F</div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 4 : CONFIRMATION ── */}
          {etape === 'confirmation' && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[800px] mx-auto text-center py-24">
               <div className="text-8xl mb-12">✨</div>
               <h2 className="font-display text-6xl mb-8 leading-tight">Votre Signature est <br /><span className="italic text-rose">Réservée</span></h2>
               <p className="text-rose/50 text-xl font-light mb-16 tracking-wide">Référence: <span className="text-rose font-bold tracking-[0.2em]">#{commandeRef}</span></p>
               
               <div className="bg-rose/5 p-12 border border-rose/10 text-left space-y-10 rounded-sm">
                  <p className="text-sm leading-relaxed font-light opacity-80">
                    Un récapitulatif a été envoyé à <strong>{emailClient}</strong>. <br />
                    Votre session <strong>WhatsApp</strong> va s&apos;ouvrir pour finaliser les détails avec notre concierge.
                  </p>
                  <div className="h-px bg-rose/10" />
                  <div className="flex flex-col md:flex-row gap-10 justify-between items-start md:items-center">
                     <div>
                        <div className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold mb-2">Modes de Règlement</div>
                        <div className="text-sm text-cream/60 font-light">TMoney / Flooz au <span className="text-rose font-bold">70 99 35 97</span> ou Espèces.</div>
                     </div>
                     <button onClick={() => window.open(`https://wa.me/22870993597?text=Bonjour%20Maya%20Bar%2C%20je%20viens%20de%20valider%20ma%20commande%20%23${commandeRef}`, '_blank')} className="btn-gold px-10 py-4 text-[10px]">Ouvrir WhatsApp</button>
                  </div>
               </div>

               <div className="mt-16">
                  <Link href="/"><button className="text-[10px] uppercase tracking-[0.5em] text-rose/30 hover:text-rose transition-all">← Retour à la galerie</button></Link>
               </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── NAVIGATION ── */}
        {etape !== 'confirmation' && (
          <div className="mt-24 pt-12 border-t border-rose/10 flex justify-between items-center">
            <button 
              onClick={() => {
                if (etape === 'choix') router.push('/')
                else if (etape === 'personalisation') setEtape('choix')
                else if (etape === 'coordonnees') setEtape('personalisation')
              }}
              className="text-[10px] uppercase tracking-[0.5em] text-rose/30 hover:text-rose transition-all"
            >
              ← Retour
            </button>
            
            <div className="flex gap-6 items-center">
               {etape === 'choix' && (
                  <button 
                    onClick={ajouterAuPanier}
                    disabled={!peutContinuer() || submitting}
                    className="text-[10px] uppercase tracking-[0.3em] text-rose border border-rose/30 px-10 py-5 hover:bg-rose/5 transition-all"
                  >
                    Ajouter & Continuer
                  </button>
               )}
               <button 
                disabled={!peutContinuer() || submitting}
                onClick={() => {
                  if (etape === 'choix') setEtape('personalisation')
                  else if (etape === 'personalisation') setEtape('coordonnees')
                }}
                className={`btn-gold px-16 ${!peutContinuer() || submitting ? 'opacity-20 grayscale pointer-events-none' : ''}`}
              >
                {submitting ? '...' : etape === 'coordonnees' ? '🚀 Confirmer la Commande' : 'Continuer →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
