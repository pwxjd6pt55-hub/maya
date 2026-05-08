'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Animations ──────────────────────────────────────────────────────────────
const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

export default function ConfiguratorElite() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'custom' | 'mix' | 'quiz'>('custom')
  const [essences, setEssences] = useState<any[]>([])
  const [parfums, setParfums] = useState<any[]>([])
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  
  // Selection state
  const [selectedEssences, setSelectedEssences] = useState<any[]>([])
  const [selectedMix, setSelectedMix] = useState<any[]>([])
  const [ml, setMl] = useState(50)
  const [gravure, setGravure] = useState('')
  const [couleur, setCouleur] = useState('#BC7C7C')

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<any[]>([])
  const [quizRecommendation, setQuizRecommendation] = useState<any>(null)

  // Cart & UI State
  const [cartCount, setCartCount] = useState(0)
  const [adding, setAdding] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    fetch('/api/essences').then(r => r.json()).then(d => d.success && setEssences(d.data))
    fetch('/api/parfums').then(r => r.json()).then(d => d.success && setParfums(d.data))
    fetch('/api/quiz').then(r => r.json()).then(d => d.success && setQuizQuestions(d.data))
    updateCartCount()
  }, [])

  const updateCartCount = () => {
    fetch('/api/cart').then(r => r.json()).then(d => {
      if (d.success) setCartCount(d.items.length)
    }).catch(() => {})
  }

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => {
    if (mode === 'quiz' && step === 2) {
       setStep(1)
       setCurrentQuizIndex(0)
    } else {
       setStep(s => s - 1)
    }
  }

  const toggleEssence = (e: any) => {
    if (selectedEssences.find(x => x.id === e.id)) {
      setSelectedEssences(selectedEssences.filter(x => x.id !== e.id))
    } else if (selectedEssences.length < 3) {
      setSelectedEssences([...selectedEssences, e])
    }
  }

  const toggleMix = (p: any) => {
    if (selectedMix.find(x => x.id === p.id)) {
      setSelectedMix(selectedMix.filter(x => x.id !== p.id))
    } else if (selectedMix.length < 2) {
      setSelectedMix([...selectedMix, p])
    }
  }

  // Helper: safely parse quiz options regardless of DB format
  const parseOptions = (options: any): any[] => {
    if (Array.isArray(options)) return options
    if (typeof options === 'string') {
      try { return JSON.parse(options) } catch { return [] }
    }
    return []
  }

  const handleQuizAnswer = (option: any) => {
    const newAnswers = [...quizAnswers, option]
    setQuizAnswers(newAnswers)
    
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
    } else {
      // valeur contains the olfactory family (Floral, Boisé, etc.)
      const recommendedCategory = option.valeur || option.category || 'Floral'
      setQuizRecommendation(recommendedCategory)
      handleNext()
    }
  }

  const addToCart = async () => {
    setAdding(true)
    const prix = ml === 30 ? 9500 : ml === 50 ? 14000 : 22000
    const body = {
      item_type: mode === 'custom' ? 'melange_essences' : 'melange_parfums',
      nom_personnalise: mode === 'custom' ? 'Création Personnalisée' : 'Mélange de Parfums',
      ml,
      prix,
      gravure,
      couleur,
      essences_json: mode === 'custom' ? selectedEssences.map(e => ({ id: e.id, nom: e.nom })) : null,
      parfums_json: mode === 'mix' ? selectedMix.map(p => ({ id: p.id, nom: p.nom })) : null
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      console.log('--- CART RESPONSE ---', data);
      
      if (data.success) {
        updateCartCount()
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else if (data.authenticated === false) {
        window.location.href = '/connexion'
      } else {
        alert("Erreur : " + (data.error || "Impossible d'ajouter au panier"))
      }
    } catch (e: unknown) { 
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      console.error(e)
      alert("Erreur réseau ou serveur : " + msg)
    }
    setAdding(false)
  }

  return (
    <div className="min-h-screen bg-[#0D0800] text-[#F9F5F2] font-body flex flex-col selection:bg-rose/40">
      
      {/* ── HEADER NAVIGATION ── */}
      <nav className="p-10 flex justify-between items-center border-b border-white/5 bg-[#0D0800]/80 backdrop-blur-md sticky top-0 z-[100]">
        <Link href="/" className="font-display text-2xl tracking-tighter hover:text-rose transition-colors">
          MAYA <span className="italic font-light opacity-30">BAR</span>
        </Link>
        <div className="flex gap-8 items-center">
          <div className="hidden md:flex gap-4 items-center">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all ${step >= s ? 'bg-rose border-rose text-white' : 'border-white/10 text-white/20'}`}>{s}</div>
                {s < 4 && <div className={`w-8 h-[1px] ${step > s ? 'bg-rose' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
          <Link href="/mon-compte" className="relative group">
             <span className="text-[12px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">Panier</span>
             {cartCount > 0 && (
               <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 w-5 h-5 bg-gold rounded-full text-[10px] flex items-center justify-center text-black font-bold shadow-lg">
                 {cartCount}
               </motion.span>
             )}
          </Link>
        </div>
      </nav>

      {/* ── WORKSPACE ── */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* ── LEFT: VISUALIZATION ── */}
        <section className="flex-1 bg-[#120D0A] flex flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-rose/5 to-transparent pointer-events-none" />
          
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="relative z-10">
            <div className="w-48 h-80 border-[3px] border-white/10 rounded-[40px] relative p-1">
               <div className="w-full h-full rounded-[36px] overflow-hidden relative">
                  <motion.div animate={{ height: `${step > 1 ? 80 : 0}%`, background: couleur }} className="absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-60 blur-[1px]" />
                  <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white/20" />
                  <div className="absolute top-0 left-1/3 w-[2px] h-full bg-white/10" />
               </div>
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-b from-white/20 to-white/5 border border-white/10 rounded-xl" />
               <AnimatePresence>
                 {gravure && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-4">
                     <p className="font-display text-sm italic text-white/40 tracking-widest leading-tight">{gravure}</p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
            <div className="w-48 h-8 bg-rose/5 blur-xl mt-12 rounded-full mx-auto" />
          </motion.div>

          <div className="absolute bottom-12 text-center">
             <h4 className="text-[12px] uppercase tracking-[0.4em] text-rose font-bold mb-2">Signature Maya Bar</h4>
             <p className="font-display text-2xl italic opacity-30">L&apos;excellence est un choix.</p>
          </div>
        </section>

        {/* ── RIGHT: CONTROLS ── */}
        <section className="w-full lg:w-[600px] bg-[#0D0800] border-l border-white/5 p-12 lg:p-20 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: MODE SELECTION */}
            {step === 1 && (
              <motion.div key="step1" {...slideUp} className="space-y-12">
                 <div>
                    <h3 className="text-5xl font-display font-light mb-4">Le Début de la <span className="italic text-rose">Création</span></h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">Comment souhaitez-vous composer votre essence unique aujourd&apos;hui ?</p>
                 </div>
                 <div className="space-y-6">
                    <button onClick={() => { setMode('quiz'); setStep(2); }} className="w-full glass-card p-10 text-left group border-rose/30 bg-rose/5 transition-all flex justify-between items-center shadow-xl shadow-rose/5">
                       <div><h4 className="text-2xl font-display mb-2 text-rose">Diagnostic Olfactif</h4><p className="text-[12px] uppercase tracking-widest text-rose/60 transition-colors italic">Laissez-nous vous guider...</p></div>
                       <span className="text-2xl group-hover:translate-x-2 transition-transform text-rose">✨</span>
                    </button>
                    <button onClick={() => { setMode('custom'); handleNext(); }} className="w-full glass-card p-10 text-left group hover:border-rose transition-all flex justify-between items-center">
                       <div><h4 className="text-2xl font-display mb-2">Création Pure</h4><p className="text-[12px] uppercase tracking-widest text-white/30 group-hover:text-rose/60 transition-colors">Assemblage d&apos;essences rares</p></div>
                       <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                    </button>
                    <button onClick={() => { setMode('mix'); handleNext(); }} className="w-full glass-card p-10 text-left group hover:border-rose transition-all flex justify-between items-center">
                       <div><h4 className="text-2xl font-display mb-2">Mélange Signature</h4><p className="text-[12px] uppercase tracking-widest text-white/30 group-hover:text-rose/60 transition-colors">Fusion de fragrances iconiques</p></div>
                       <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                    </button>
                 </div>
                 <div className="pt-8 text-center">
                    <Link href="/" className="text-[12px] uppercase tracking-widest text-white/30 hover:text-rose transition-colors font-bold">← Abandonner et retourner à l&apos;accueil</Link>
                 </div>
              </motion.div>
            )}

            {/* STEP 2: QUIZ FLOW OR SELECTION */}
            {step === 2 && mode === 'quiz' && (
              <motion.div key="quiz" {...slideUp} className="space-y-12">
                 <div className="flex justify-between items-start">
                    <div><h3 className="text-4xl font-display font-light mb-2">Diagnostic <span className="italic text-rose">Privé</span></h3><p className="text-rose/50 text-[12px] uppercase tracking-[0.4em] font-bold">Question {currentQuizIndex + 1} sur {quizQuestions.length}</p></div>
                    <button onClick={handleBack} className="text-[12px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Retour</button>
                 </div>
                 {quizQuestions[currentQuizIndex] && (
                   <div className="space-y-8">
                      <p className="text-xl font-light leading-relaxed italic">{quizQuestions[currentQuizIndex].question}</p>
                      <div className="grid grid-cols-1 gap-4">
                        {parseOptions(quizQuestions[currentQuizIndex].options).map((opt: any, i: number) => (
                          <button key={i} onClick={() => handleQuizAnswer(opt)} className="w-full p-6 text-left border border-white/10 rounded-2xl bg-white/5 hover:border-rose/50 hover:bg-rose/5 transition-all text-sm font-light">
                            {opt.label || opt.text || String(opt)}
                          </button>
                        ))}
                      </div>
                   </div>
                 )}
              </motion.div>
            )}

            {/* STEP 2: SELECTION (Post-Quiz or Direct) */}
            {step === 2 && mode !== 'quiz' && (
              <motion.div key="step2" {...slideUp} className="space-y-12">
                 <div className="flex justify-between items-start">
                    <div><h3 className="text-4xl font-display font-light mb-2">{mode === 'custom' ? 'Sélection des Essences' : 'Mix de Fragrances'}</h3><p className="text-rose/50 text-[12px] uppercase tracking-[0.4em] font-bold">Étape 2 sur 4</p></div>
                    <button onClick={handleBack} className="text-[12px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Retour</button>
                 </div>
                 <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {mode === 'custom' ? essences.map(e => (
                      <div key={e.id} onClick={() => toggleEssence(e)} className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedEssences.find(x => x.id === e.id) ? 'bg-rose border-rose text-white' : 'bg-white/5 border-white/10 hover:border-rose/40 text-white/60'}`}>
                         <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full border border-white/10" style={{ background: e.couleur }} /><div><div className="text-base font-medium">{e.nom}</div><div className="text-[11px] uppercase tracking-widest opacity-60">{e.famille} — {e.note}</div></div></div>
                         {selectedEssences.find(x => x.id === e.id) && <span>✓</span>}
                      </div>
                    )) : parfums.map(p => (
                      <div key={p.id} onClick={() => toggleMix(p)} className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedMix.find(x => x.id === p.id) ? 'bg-rose border-rose text-white' : 'bg-white/5 border-white/10 hover:border-rose/40 text-white/60'}`}>
                         <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-xs">🏺</div><div><div className="text-base font-medium">{p.nom}</div><div className="text-[11px] uppercase tracking-widest opacity-60">{p.famille}</div></div></div>
                         {selectedMix.find(x => x.id === p.id) && <span>✓</span>}
                      </div>
                    ))}
                 </div>
                 <button onClick={handleNext} disabled={mode === 'custom' ? selectedEssences.length === 0 : selectedMix.length === 0} className="btn-gold w-full py-6 disabled:opacity-20">VALIDER LA SÉLECTION</button>
              </motion.div>
            )}

            {/* STEP 3: RECOMMENDATION (from Quiz) */}
            {step === 3 && mode === 'quiz' && (
              <motion.div key="recommendation" {...slideUp} className="space-y-12">
                 <div className="text-center space-y-8 py-10">
                    <div className="text-6xl mb-6">✨</div>
                    <h3 className="text-4xl font-display font-light">Votre Profil : <span className="italic text-rose">{quizRecommendation}</span></h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm mx-auto uppercase tracking-widest">Nous avons identifié les notes qui feront vibrer votre âme.</p>
                    <div className="pt-10 flex flex-col gap-4">
                       <button onClick={() => { setMode('custom'); handleNext(); }} className="btn-gold w-full py-6">Voir les Essences suggérées</button>
                       <button onClick={() => { setMode('mix'); handleNext(); }} className="bg-white/5 border border-white/10 w-full py-6 rounded-full text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Ou choisir un mélange prêt</button>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* STEP 3: CUSTOMIZATION (Regular flow) */}
            {step === 3 && mode !== 'quiz' && (
              <motion.div key="step3" {...slideUp} className="space-y-12">
                 <div className="flex justify-between items-start">
                    <div><h3 className="text-4xl font-display font-light mb-2">Personnalisation</h3><p className="text-rose/50 text-[12px] uppercase tracking-[0.4em] font-bold">Étape 3 sur 4</p></div>
                    <button onClick={handleBack} className="text-[12px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Retour</button>
                 </div>
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[12px] uppercase tracking-[0.4em] text-rose font-bold">Contenance</label>
                       <div className="flex gap-4">
                          {[30, 50, 100].map(v => (
                            <button key={v} onClick={() => setMl(v)} className={`flex-1 py-4 rounded-xl border text-xs font-bold transition-all ${ml === v ? 'bg-rose border-rose text-white' : 'bg-white/5 border-white/10 text-white/40'}`}>{v}ml</button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[12px] uppercase tracking-[0.4em] text-rose font-bold">Gravure Laser</label>
                       <input value={gravure} onChange={e => setGravure(e.target.value)} placeholder="Votre message secret..." className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none focus:border-rose transition-all" maxLength={25} />
                    </div>
                 </div>
                 <button onClick={handleNext} className="btn-gold w-full py-6">ÉVALUER L&apos;ASSEMBLAGE</button>
              </motion.div>
            )}

            {/* STEP 4: SUMMARY & CART */}
            {step === 4 && (
              <motion.div key="step4" {...slideUp} className="space-y-12">
                 <div><h3 className="text-4xl font-display font-light mb-2">Votre <span className="italic text-rose">Chef-d&apos;Œuvre</span></h3><p className="text-white/30 text-sm font-light">Résumé de votre composition avant la mise en flacon.</p></div>
                 <div className="glass-card p-10 space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                       <div className="text-[12px] uppercase tracking-widest text-rose font-bold">Type</div>
                       <div className="text-base font-medium">{mode === 'custom' ? 'Création Pure' : 'Mélange Signature'}</div>
                    </div>
                    <div className="space-y-2">
                       <div className="text-[12px] uppercase tracking-widest text-rose font-bold">Composition</div>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {(mode === 'custom' ? selectedEssences : selectedMix).map(x => (
                             <span key={x.id} className="px-4 py-2 bg-white/5 rounded-full text-[12px] border border-white/10">{x.nom}</span>
                          ))}
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                       <div className="text-3xl font-display text-gold font-bold">{(ml === 30 ? 9500 : ml === 50 ? 14000 : 22000).toLocaleString()} F</div>
                       <div className="text-[12px] uppercase tracking-widest opacity-50">{ml}ml</div>
                    </div>
                 </div>
                 <button onClick={addToCart} disabled={adding} className="btn-gold w-full py-6 text-xl tracking-tighter italic disabled:opacity-50">{adding ? 'MISE EN FLACON...' : 'AJOUTER AU PANIER'}</button>
                 <button onClick={handleBack} className="w-full text-[12px] uppercase tracking-widest text-white/30 font-bold hover:text-white transition-colors">Modifier la création</button>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-12 right-12 bg-white text-black px-10 py-6 rounded-2xl shadow-2xl z-[200] flex items-center gap-6 border border-rose/20">
             <div className="w-8 h-8 bg-rose rounded-full flex items-center justify-center text-white text-xs">✓</div>
             <div><p className="text-[10px] uppercase tracking-[0.4em] font-bold">Succès Olfactif</p><p className="text-xs font-light opacity-60">Votre création a rejoint votre panier.</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glass-card { background: rgba(18, 13, 10, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 40px; }
        .btn-gold { background: #BC7C7C; color: white; font-family: var(--font-display); font-weight: 500; letter-spacing: 0.4em; text-transform: uppercase; transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); border-radius: 100px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-gold:hover { background: white; color: black; transform: translateY(-8px); box-shadow: 0 30px 60px rgba(188, 124, 124, 0.2); }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #BC7C7C; }
      `}</style>
    </div>
  )
}

