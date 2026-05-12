'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Animations ──────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Parfum {
  id: number; nom: string; marque_inspiree: string; famille: string;
  prix_30ml: number; prix_50ml: number; prix_100ml: number; image_url?: string;
}

interface Essence {
  id: number; nom: string; famille: string; note: string; couleur: string; image_url?: string;
}

interface QuizQuestion {
  id: number; question: string; options: any; ordre: number;
}

export default function AdminUltraPremium() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [tab, setTab] = useState<'dashboard' | 'catalog' | 'essences' | 'quiz' | 'clients'>('dashboard')
  const [parfums, setParfums] = useState<Parfum[]>([])
  const [essences, setEssences] = useState<Essence[]>([])
  const [commandes, setCommandes] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [showModal, setShowModal] = useState<'parfum' | 'essence' | 'quiz' | null>(null)
  const [newParfum, setNewParfum] = useState<Partial<Parfum>>({ nom: '', marque_inspiree: '', famille: 'Floral', prix_50ml: 12500 })
  const [newEssence, setNewEssence] = useState<any>({ nom: '', famille: 'Floral', note: 'Cœur', couleur: '#BC7C7C', description: '' })
  const [newQuiz, setNewQuiz] = useState({ question: '', options: [{text: '', category: 'Floral'}], ordre: 1 })
  const [uploading, setUploading] = useState(false)

  // Check if already authenticated from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('maya_admin_auth')
    if (saved === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated])

  const handleLogin = async () => {
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('maya_admin_auth', 'true')
        setIsAuthenticated(true)
      } else {
        setLoginError('Mot de passe incorrect')
      }
    } catch (error: unknown) {
      setLoginError('Erreur de connexion')
    }
    setLoginLoading(false)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resP, resE, resC, resU, resQ] = await Promise.all([
        fetch('/api/parfums').then(r => r.json()),
        fetch('/api/essences').then(r => r.json()),
        fetch('/api/commandes').then(r => r.json()),
        fetch('/api/auth/users').then(r => r.json()).catch(() => ({ success: true, data: [] })),
        fetch('/api/quiz').then(r => r.json())
      ])
      if (resP?.success) setParfums(resP.data)
      if (resE?.success) setEssences(resE.data)
      if (resC?.success) setCommandes(resC.data)
      if (resU?.success) setClients(resU.data)
      if (resQ?.success) setQuizQuestions(resQ.data)
    } catch (e: unknown) { console.error(e) }
    setLoading(false)
  }

  const handleUpload = async (file: File, type: 'parfum' | 'essence') => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (type === 'parfum') setNewParfum({ ...newParfum, image_url: data.url })
        else setNewEssence({ ...newEssence, image_url: data.url })
      } else {
        alert("Erreur lors de l'upload de l'image: " + data.error)
      }
    } catch (e: unknown) { 
      console.error(e)
      alert("Erreur réseau lors de l'upload.")
    }
    setUploading(false)
  }

  const saveParfum = async () => {
    const method = newParfum.id ? 'PATCH' : 'POST'
    const res = await fetch('/api/parfums', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newParfum) })
    if (res.ok) { setShowModal(null); fetchData(); setNewParfum({ nom: '', marque_inspiree: '', famille: 'Floral', prix_50ml: 12500 }) }
  }

  const saveEssence = async () => {
    const method = newEssence.id ? 'PATCH' : 'POST'
    const res = await fetch('/api/essences', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEssence) })
    if (res.ok) { 
      setShowModal(null); 
      fetchData(); 
    } else {
      const data = await res.json()
      alert('Erreur: ' + data.error)
    }
  }

  const saveQuiz = async () => {
    const res = await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newQuiz) })
    if (res.ok) { setShowModal(null); fetchData(); }
  }

  const deleteQuiz = async (id: number) => {
    if (confirm('Supprimer cette question ?')) {
       await fetch(`/api/quiz?id=${id}`, { method: 'DELETE' })
       fetchData()
    }
  }

  const handleNotify = async (commande: any) => {
    try {
      const res = await fetch('/api/commandes/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandeId: commande.id })
      })
      const data = await res.json()
      if (data.success) {
        // Email envoyé, ouvrir WhatsApp en parallèle
        window.open(data.whatsappLink, '_blank')
        fetchData()
        alert('✅ Notification envoyée ! WhatsApp ouvert.')
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (e) {
      alert('Erreur réseau')
    }
  }

  const stats = [
    { label: 'Revenus Totaux', value: `${commandes.reduce((a,c)=>a+(c.prix_total||0),0).toLocaleString()} F`, icon: '💰', color: 'text-gold' },
    { label: 'Commandes', value: commandes.length, icon: '🛍️', color: 'text-rose' },
    { label: 'Essences au Bar', value: essences.length, icon: '🧪', color: 'text-blue-400' },
    { label: 'Fidélité Clients', value: clients.length, icon: '💎', color: 'text-purple-400' },
  ]

  // ── LOGIN SCREEN ──
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0D0800] flex items-center justify-center font-body">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass-card p-16 text-center">
          <h1 className="font-display text-5xl tracking-tighter mb-2">MAYA <span className="italic font-light opacity-30">BAR</span></h1>
          <p className="text-[9px] uppercase tracking-[0.5em] text-rose/40 font-bold mb-16">Espace Administrateur</p>
          
          <div className="space-y-8">
            <div className="text-left space-y-3">
              <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Mot de passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => { setPassword(e.target.value); setLoginError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="luxury-input w-full" 
                placeholder="Entrez le mot de passe admin..."
                autoFocus
              />
            </div>
            
            {loginError && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-red-400 text-xs"
              >
                {loginError}
              </motion.p>
            )}
            
            <button 
              onClick={handleLogin} 
              disabled={loginLoading || !password}
              className="btn-gold w-full py-5 text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'VÉRIFICATION...' : 'ACCÉDER À L\'ESPACE ADMIN'}
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .glass-card { background: rgba(18, 13, 10, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(188, 124, 124, 0.1); border-radius: 40px; }
        .luxury-input { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(188, 124, 124, 0.1); padding: 20px 24px; border-radius: 20px; outline: none; transition: all 0.5s ease; font-size: 14px; color: white; width: 100%; }
        .luxury-input:focus { border-color: #BC7C7C; background: rgba(188, 124, 124, 0.05); }
        .btn-gold { background: #BC7C7C; color: white; font-family: var(--font-display); font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; transition: all 0.5s ease; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-gold:hover { background: #A66B6B; transform: translateY(-5px); box-shadow: 0 20px 40px rgba(188, 124, 124, 0.3); }
      `}</style>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#0D0800] flex items-center justify-center font-display">
      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1, 0.98] }} transition={{ duration: 2, repeat: Infinity }} className="text-rose text-3xl italic tracking-widest">
        Maya Bar <span className="text-white/20 not-italic">Elite</span>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0800] text-[#F9F5F2] font-body selection:bg-rose/40">
      
      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden fixed top-0 w-full z-[101] bg-[#0D0800]/90 backdrop-blur-xl border-b border-rose/10 px-6 py-4 flex justify-between items-center">
        <h1 className="font-display text-xl tracking-tighter">MAYA <span className="italic font-light opacity-30">ADMIN</span></h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 flex flex-col justify-center items-center gap-1.5">
          <span className={`block w-6 h-[1px] bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block w-6 h-[1px] bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[1px] bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
        </button>
      </div>

      {/* ── SIDEBAR NAVIGATION ── */}
      <nav className={`fixed left-0 top-0 bottom-0 w-72 sm:w-80 bg-[#120D0A]/95 backdrop-blur-3xl border-r border-rose/10 z-[100] flex flex-col p-8 sm:p-12 transition-transform duration-500 lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 sm:mb-20 text-center mt-10 lg:mt-0">
          <Link href="/" className="group block">
            <h1 className="font-display text-3xl sm:text-4xl tracking-tighter group-hover:text-rose transition-colors duration-500">MAYA <span className="italic font-light opacity-30 group-hover:opacity-100 transition-all">BAR</span></h1>
            <p className="text-[8px] uppercase tracking-[0.5em] text-rose/40 mt-2 font-bold text-center">Luxury Management</p>
          </Link>
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4">
          {[
            { id: 'dashboard', label: 'Vue d\'ensemble', icon: '🍷' },
            { id: 'catalog', label: 'Collection Privée', icon: '🏺' },
            { id: 'essences', label: 'Laboratoire d\'Essences', icon: '🧪' },
            { id: 'quiz', label: 'Gestion du Quiz', icon: '✨' },
            { id: 'clients', label: 'Cercle Privé', icon: '💎' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id as any); setMenuOpen(false); }}
              className={`w-full group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-500 ${tab === item.id ? 'bg-gradient-to-r from-rose to-rose-dark text-white shadow-xl shadow-rose/20 scale-105' : 'hover:bg-white/5 text-white/40'}`}
            >
              <span className={`text-lg transition-transform duration-500 ${tab === item.id ? 'scale-110' : 'group-hover:translate-x-1'}`}>{item.icon}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-8 border-t border-rose/10">
          <button onClick={() => window.location.href = '/'} className="w-full py-4 text-[9px] uppercase tracking-widest text-white/20 hover:text-rose transition-colors flex items-center justify-center gap-3">
             <span>←</span> Retour au site
          </button>
        </div>
      </nav>

      {/* ── MAIN WORKSPACE ── */}
      <main className={`transition-all duration-500 min-h-screen p-6 sm:p-10 lg:p-16 pt-24 lg:pt-16 ${menuOpen ? 'blur-sm lg:blur-0' : ''} lg:pl-80`}>
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 sm:mb-20">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-[9px] uppercase tracking-[0.6em] text-rose font-bold mb-2 sm:mb-4">Système de Gestion</h2>
            <h3 className="text-3xl sm:text-5xl font-display font-light leading-tight">Espace <span className="italic text-rose">Maya Bar 2026</span></h3>
          </motion.div>
          <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-rose rounded-full animate-ping" />
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Status: Operational</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <motion.div key="dashboard" variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {stats.map((s, i) => (
                  <motion.div key={i} variants={itemVariants} className="glass-card p-6 sm:p-10 group hover:border-rose/30 transition-all">
                    <div className={`text-2xl sm:text-3xl mb-4 sm:mb-6 ${s.color} bg-white/5 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>{s.icon}</div>
                    <div className="text-xl sm:text-3xl font-display font-medium mb-1 tracking-tight">{s.value}</div>
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30 font-bold">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="glass-card p-12">
                 <h4 className="text-sm uppercase tracking-[0.4em] font-bold text-rose mb-10">Dernières Commandes</h4>
                 <div className="space-y-8">
                    {commandes.length > 0 ? commandes.slice(0, 10).map((c, i) => (
                      <div key={i} className="flex items-center justify-between group p-4 hover:bg-white/5 rounded-2xl transition-all gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose/5 border border-rose/10 flex items-center justify-center font-display italic text-rose flex-shrink-0">M</div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium tracking-wide">{c.client_nom} · {c.client_telephone || c.client_tel}</div>
                            <div className="text-[9px] sm:text-[10px] text-white/40 italic mt-0.5">{c.client_adresse || c.client_email || '—'}</div>
                            <div className="text-[9px] sm:text-[10px] text-white/20 uppercase tracking-widest mt-1">Ref: {c.reference} · {c.retrait || c.mode_retrait}</div>
                          </div>
                        </div>
                        <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-2">
                          <div className="text-xs sm:text-sm font-display text-rose font-bold whitespace-nowrap">{c.prix_total?.toLocaleString()} F</div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full inline-block ${
                              c.statut === 'livree' || c.statut === 'livre' ? 'bg-green-500/10 text-green-500' :
                              c.statut === 'prete' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-rose/10 text-rose'
                            }`}>{c.statut || 'en cours'}</div>
                            {c.statut !== 'livree' && c.statut !== 'livre' && (
                              <button
                                onClick={() => handleNotify(c)}
                                className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest px-2 sm:px-3 py-1.5 bg-white/5 hover:bg-rose/20 hover:text-rose border border-white/10 hover:border-rose/30 rounded-full transition-all"
                              >
                                📲 Notifier
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center text-white/10 italic text-sm">Aucune commande enregistrée.</div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}

          {/* ── CATALOG ── */}
          {tab === 'catalog' && (
            <motion.div key="catalog" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
              <div className="flex justify-between items-center bg-[#120D0A]/30 p-10 rounded-[30px] border border-rose/10 backdrop-blur-md">
                <p className="text-sm font-light text-white/50 tracking-wide max-w-md">Administrez votre collection de fragrances de prestige. Ajoutez de nouvelles créations ou modifiez les tarifs.</p>
                <button onClick={() => { setNewParfum({ nom: '', marque_inspiree: '', famille: 'Floral', prix_50ml: 12500 }); setShowModal('parfum'); }} className="btn-gold px-10 py-5 text-[10px]">AJOUTER AU CATALOGUE</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {parfums.map(p => (
                  <motion.div key={p.id} variants={itemVariants} className="glass-card group overflow-hidden hover:border-rose/40 transition-all duration-700">
                    <div className="h-72 bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-center p-12 relative overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-700" /> : <span className="font-display text-7xl text-rose/10 italic">M</span>}
                    </div>
                    <div className="p-10">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-rose font-bold mb-2">{p.famille}</p>
                      <h5 className="text-3xl font-display font-medium tracking-tight mb-6">{p.nom}</h5>
                      <div className="flex justify-between items-center py-6 border-t border-white/5">
                        <div className="text-2xl font-display text-gold font-bold">{p.prix_50ml?.toLocaleString()} F</div>
                        <button onClick={() => { setNewParfum(p); setShowModal('parfum'); }} className="text-white/20 hover:text-rose transition-colors text-[9px] uppercase font-bold tracking-widest">Modifier</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── ESSENCES ── */}
          {tab === 'essences' && (
            <motion.div key="essences" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
              <div className="flex justify-between items-center bg-[#120D0A]/30 p-10 rounded-[30px] border border-rose/10">
                <p className="text-sm font-light text-white/50 tracking-wide max-w-md">Gérez les essences pures disponibles pour le bar à senteurs. La précision est la clé de l&apos;excellence.</p>
                <button onClick={() => setShowModal('essence')} className="btn-gold px-10 py-5 text-[10px]">NOUVELLE ESSENCE</button>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-white/[0.03] border-b border-rose/10"><th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Essence</th><th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Profil</th><th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Note</th><th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] text-rose font-bold text-right">Edition</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {essences.map(e => (
                      <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-10 py-8 flex items-center gap-6"><div className="w-10 h-10 rounded-xl border border-rose/20" style={{ background: e.couleur }} /><span className="text-base font-medium">{e.nom}</span></td>
                        <td className="px-10 py-8 text-[10px] uppercase text-white/40">{e.famille}</td>
                        <td className="px-10 py-8"><span className="px-5 py-2 bg-rose/5 border border-rose/10 text-[9px] uppercase text-rose font-bold rounded-full">{e.note}</span></td>
                        <td className="px-10 py-8 text-right"><button onClick={() => { setNewEssence(e); setShowModal('essence'); }} className="text-white/20 hover:text-rose transition-colors text-[9px] font-bold uppercase tracking-widest">Modifier</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── QUIZ MANAGEMENT ── */}
          {tab === 'quiz' && (
            <motion.div key="quiz" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
               <div className="flex justify-between items-center bg-[#120D0A]/30 p-10 rounded-[30px] border border-rose/10">
                <p className="text-sm font-light text-white/50 tracking-wide max-w-md">Définissez le parcours de diagnostic olfactif pour guider vos clients vers leur signature unique.</p>
                <button onClick={() => setShowModal('quiz')} className="btn-gold px-10 py-5 text-[10px]">AJOUTER UNE QUESTION</button>
              </div>

              <div className="space-y-6">
                 {quizQuestions.map((q, i) => (
                   <div key={q.id} className="glass-card p-10 flex justify-between items-center group">
                      <div className="flex items-center gap-10">
                         <div className="text-4xl font-display text-rose opacity-20 italic">0{i+1}</div>
                         <div>
                            <h5 className="text-xl font-display mb-2">{q.question}</h5>
                             <div className="flex flex-wrap gap-2 mt-2">
                               {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt: any, idx: number) => (
                                 <span key={idx} className="px-3 py-1.5 bg-white/10 border border-white/5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60 font-medium">{opt.label || opt.text || String(opt)}</span>
                               ))}
                             </div>
                         </div>
                      </div>
                      <button onClick={() => deleteQuiz(q.id)} className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose/20 transition-all text-xs">🗑️</button>
                   </div>
                 ))}
                 {quizQuestions.length === 0 && <div className="py-20 text-center text-white/10 italic">Aucune question configurée.</div>}
              </div>
            </motion.div>
          )}

          {/* ── CLIENTS ── */}
          {tab === 'clients' && (
            <motion.div key="clients" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
               <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr><th className="px-10 py-8 text-[10px] uppercase text-rose font-bold">Client Elite</th><th className="px-10 py-8 text-[10px] uppercase text-rose font-bold">Email / Contact</th><th className="px-10 py-8 text-[10px] uppercase text-rose font-bold text-right">Inscrit le</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clients.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02]">
                        <td className="px-10 py-8 text-sm font-medium">{u.nom}</td>
                        <td className="px-10 py-8 text-[10px] uppercase tracking-widest opacity-60">{u.email}</td>
                        <td className="px-10 py-8 text-right text-[10px] text-white/20">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── MODAL SYSTEM ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-12 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#0D0800] w-full max-w-4xl rounded-[50px] border border-rose/20 p-16 shadow-2xl relative my-auto">
              
              <button onClick={() => setShowModal(null)} className="absolute top-12 right-12 text-2xl opacity-20 hover:opacity-100 transition-opacity">×</button>

              <h3 className="text-4xl font-display mb-12 italic">{showModal === 'parfum' ? 'Nouveau Parfum' : showModal === 'essence' ? 'Nouvelle Essence' : 'Nouvelle Question Quiz'}</h3>

              {showModal === 'quiz' ? (
                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Intitulé de la Question</label>
                      <input value={newQuiz.question} onChange={e => setNewQuiz({...newQuiz, question: e.target.value})} className="luxury-input w-full" placeholder="Ex: Quelle note vous inspire ?" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Options (Séparez par des virgules)</label>
                      <textarea 
                        onChange={e => {
                           const opts = e.target.value.split(',').map(t => ({ text: t.trim(), category: 'Floral' }))
                           setNewQuiz({...newQuiz, options: opts})
                        }} 
                        className="luxury-input w-full h-32 resize-none" 
                        placeholder="Boisé, Floral, Épicé..." 
                      />
                   </div>
                   <button onClick={saveQuiz} className="btn-gold w-full py-6">ENREGISTRER LA QUESTION</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Nom</label>
                      <input 
                        value={showModal === 'parfum' ? newParfum.nom : newEssence.nom} 
                        onChange={e => showModal === 'parfum' ? setNewParfum({...newParfum, nom: e.target.value}) : setNewEssence({...newEssence, nom: e.target.value})} 
                        className="luxury-input w-full" 
                        placeholder="Ex: Rose de Damas..." 
                      />
                    </div>
                    {showModal === 'parfum' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Inspiré de</label>
                          <input value={newParfum.marque_inspiree || ''} onChange={e => setNewParfum({...newParfum, marque_inspiree: e.target.value})} className="luxury-input w-full" placeholder="Ex: Chanel N°5..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Famille olfactive</label>
                          <input value={newParfum.famille || ''} onChange={e => setNewParfum({...newParfum, famille: e.target.value})} className="luxury-input w-full" placeholder="Ex: Floral Oriental..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Prix 50ml (F)</label>
                          <input type="number" value={newParfum.prix_50ml || ''} onChange={e => setNewParfum({...newParfum, prix_50ml: parseInt(e.target.value)})} className="luxury-input w-full" placeholder="14000" />
                        </div>
                      </>
                    )}
                    {showModal === 'essence' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Famille</label>
                          <select value={newEssence.famille} onChange={e => setNewEssence({...newEssence, famille: e.target.value})} className="luxury-input w-full">
                            {['Floral', 'Boisé', 'Oriental', 'Agrumes', 'Frais', 'Épicé', 'Gourmand', 'Musqué'].map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Note</label>
                          <select value={newEssence.note} onChange={e => setNewEssence({...newEssence, note: e.target.value})} className="luxury-input w-full">
                            {['tête', 'cœur', 'fond'].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Description</label>
                          <textarea value={newEssence.description} onChange={e => setNewEssence({...newEssence, description: e.target.value})} className="luxury-input w-full h-24 resize-none" placeholder="Décrivez le caractère de cette essence..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-rose font-bold">Couleur</label>
                          <input type="color" value={newEssence.couleur} onChange={e => setNewEssence({...newEssence, couleur: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer border-0 bg-transparent" />
                        </div>
                      </>
                    )}
                    <button onClick={showModal === 'parfum' ? saveParfum : saveEssence} className="btn-gold w-full py-6">
                      {(showModal === 'parfum' && newParfum.id) || (showModal === 'essence' && newEssence.id) ? 'ENREGISTRER LES MODIFICATIONS' : 'VALIDER L\'AJOUT'}
                    </button>
                  </div>
                  <div className="aspect-square bg-rose/5 border-2 border-dashed border-rose/20 rounded-[40px] flex flex-col items-center justify-center relative cursor-pointer group gap-4">
                     <span className="text-4xl opacity-20 group-hover:scale-110 transition-transform">📷</span>
                     <span className="text-[9px] uppercase tracking-widest opacity-20">Photo du produit</span>
                     {uploading && <span className="text-[9px] text-rose animate-pulse">Envoi en cours...</span>}
                     {(showModal === 'parfum' ? newParfum.image_url : newEssence.image_url) && (
                       <img src={showModal === 'parfum' ? newParfum.image_url : newEssence.image_url} className="absolute inset-0 w-full h-full object-contain rounded-[40px] p-6" alt="preview" />
                     )}
                     <input type="file" accept="image/*" onChange={e => e.target.files && handleUpload(e.target.files[0], showModal as any)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glass-card { background: rgba(18, 13, 10, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(188, 124, 124, 0.1); border-radius: 40px; }
        .luxury-input { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(188, 124, 124, 0.1); padding: 20px 24px; border-radius: 20px; outline: none; transition: all 0.5s ease; font-size: 14px; color: white; }
        .luxury-input:focus { border-color: #BC7C7C; background: rgba(188, 124, 124, 0.05); }
        .btn-gold { background: #BC7C7C; color: white; font-family: var(--font-display); font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; transition: all 0.5s ease; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-gold:hover { background: #A66B6B; transform: translateY(-5px); box-shadow: 0 20px 40px rgba(188, 124, 124, 0.3); }
      `}</style>
    </div>
  )
}

