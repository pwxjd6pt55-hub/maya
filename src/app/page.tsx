'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } }
}

export default function MayaHome() {
  const [parfums, setParfums] = useState<any[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { scrollY, scrollYProgress } = useScroll()

  const filteredParfums = useMemo(() => {
    if (!searchQuery) return parfums;
    const term = searchQuery.toLowerCase();
    return parfums.filter((p) => 
      (p.nom && p.nom.toLowerCase().includes(term)) ||
      (p.famille && p.famille.toLowerCase().includes(term)) ||
      (p.marque_inspiree && p.marque_inspiree.toLowerCase().includes(term))
    );
  }, [parfums, searchQuery]);

  const yHero = useTransform(scrollY, [0, 500], [0, 200])
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0])
  const scaleHero = useTransform(scrollY, [0, 500], [1, 1.1])
  
  // Header animation state
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false)
      } else {
        setHeaderVisible(true)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    // Charger les parfums
    fetch('/api/parfums')
      .then(r => r.json())
      .then(data => {
        if (data.success) setParfums(data.data)
        setLoading(false)
      })

    // Vérifier la session utilisateur
    fetch('/api/auth')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) setUser(data.user)
      })
      .catch(() => {})

    // Compter les articles du panier
    fetch('/api/cart')
      .then(r => r.json())
      .then(d => { if (d.success) setCartCount(d.items?.length || 0) })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
    setCartCount(0)
    showToast('Vous êtes déconnecté', 'info')
  }

  const addToCart = async (parfum: any) => {
    if (!user) {
      showToast('Connectez-vous pour ajouter au panier', 'info')
      return
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: 'catalogue',
          parfum_catalogue_id: parfum.id,
          nom_personnalise: parfum.nom,
          ml: 50,
          prix: parfum.prix_50ml || 0,
          quantite: 1,
        })
      })
      const data = await res.json()
      if (data.success) {
        setCartCount(c => c + 1)
        showToast(`✨ ${parfum.nom} ajouté au panier !`)
        setSearchQuery('') // Auto-clear search when item is added
      } else if (res.status === 401) {
        showToast('Connectez-vous pour ajouter au panier', 'info')
      } else {
        showToast('Erreur lors de l\'ajout', 'error')
      }
    } catch {
      showToast('Erreur réseau', 'error')
    }
  }

  return (
    <div className="bg-[#0D0800] text-[#F9F5F2] font-body overflow-x-hidden">
      
      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -60, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-[200] px-6 py-4 rounded-full text-sm font-bold tracking-widest uppercase shadow-2xl ${
              toast.type === 'success' ? 'bg-rose text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-white/10 backdrop-blur text-white border border-white/20'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BARRE DE NAVIGATION SMART ── */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: headerVisible ? 0 : -100 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-[100] px-4 sm:px-10 py-5 sm:py-7 flex justify-between items-center bg-[#0D0800]/60 backdrop-blur-xl border-b border-white/[0.03]"
      >
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="group cursor-pointer">
          <Link href="/">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tighter group-hover:text-rose transition-all duration-700">
              MAYA <span className="italic font-light opacity-30 group-hover:opacity-100 transition-all">BAR</span>
            </h1>
          </Link>
        </motion.div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.5em] font-bold">
          {[
            { href: '#hero', label: 'Accueil' },
            { href: '#collection', label: 'Collection' },
            { href: '/configurateur', label: 'Le Bar' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="relative group overflow-hidden opacity-60 hover:opacity-100 transition-all">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">{link.label}</span>
              <span className="absolute top-full left-0 block transition-transform duration-500 group-hover:-translate-y-full text-rose">{link.label}</span>
            </Link>
          ))}
          
          {user ? (
            <Link href="/mon-compte" className="relative group opacity-60 hover:opacity-100 transition-all">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">Mon Compte</span>
              <span className="absolute top-full left-0 block transition-transform duration-500 group-hover:-translate-y-full text-rose">Mon Compte</span>
              {cartCount > 0 && (
                <motion.span 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="absolute -top-3 -right-4 w-4 h-4 bg-rose rounded-full text-[7px] flex items-center justify-center text-white font-bold"
                >
                 {cartCount}
                </motion.span>
              )}
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="opacity-60 hover:opacity-100 transition-all">Connexion</Link>
              <Link href="/inscription" className="opacity-60 hover:opacity-100 transition-all">Inscription</Link>
            </>
          )}
        </div>

        {/* Desktop CTA */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-6">
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest opacity-40">👤 {user.nom?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-[9px] uppercase tracking-widest opacity-30 hover:text-rose hover:opacity-100 transition-all">
                Quitter
              </button>
            </div>
          )}
          <Link href="/configurateur" className="hidden sm:block">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold !py-3 !px-8 !text-[9px]"
            >
              CRÉER MON PARFUM
            </motion.button>
          </Link>
          
          {/* Mobile Menu Trigger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden w-10 h-10 flex flex-col justify-center items-end gap-1.5 group">
            <span className={`block h-[1px] bg-white transition-all duration-500 ${menuOpen ? 'w-8 rotate-45 translate-y-1' : 'w-8 group-hover:w-6'}`} />
            <span className={`block h-[1px] bg-white transition-all duration-500 ${menuOpen ? 'opacity-0' : 'w-6 group-hover:w-8'}`} />
            <span className={`block h-[1px] bg-white transition-all duration-500 ${menuOpen ? 'w-8 -rotate-45 -translate-y-2' : 'w-4 group-hover:w-8'}`} />
          </button>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[99] bg-[#0D0800]/97 backdrop-blur-xl flex flex-col items-center justify-center gap-8 pt-20"
          >
            {[
              { href: '#hero', label: 'Accueil' },
              { href: '#collection', label: 'Collection' },
              { href: '/configurateur', label: 'Le Bar' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl italic text-white/60 hover:text-rose transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/mon-compte" onClick={() => setMenuOpen(false)} className="font-display text-4xl italic text-white/60 hover:text-rose transition-colors">
                  Mon Compte {cartCount > 0 && <span className="text-lg text-[#D4AF37]">({cartCount})</span>}
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-[11px] uppercase tracking-widest text-rose/60 hover:text-rose transition-colors">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion" onClick={() => setMenuOpen(false)} className="font-display text-4xl italic text-white/60 hover:text-rose transition-colors">Connexion</Link>
                <Link href="/inscription" onClick={() => setMenuOpen(false)} className="font-display text-4xl italic text-white/60 hover:text-rose transition-colors">Inscription</Link>
              </>
            )}
            <Link href="/configurateur" onClick={() => setMenuOpen(false)}>
              <button className="btn-gold mt-6 px-10 py-4 text-[10px]">CRÉER MON PARFUM</button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION HERO IMMERSIVE ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ y: yHero, opacity: opacityHero, scale: scaleHero }} className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-[#0D0800]/20 via-[#0D0800]/60 to-[#0D0800]" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-5" />
           
           {/* Animated Glows */}
           <motion.div 
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.15, 0.25, 0.15],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose/20 blur-[120px] rounded-full"
           />
           <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2], 
              opacity: [0.1, 0.2, 0.1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[150px] rounded-full"
           />
        </motion.div>

        <div className="relative z-10 text-center px-6 sm:px-8 max-w-5xl">
           <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-rose text-[11px] sm:text-[13px] uppercase font-bold mb-8 tracking-[0.8em]"
           >
             Lomé — Togo — Excellence Olfactive
           </motion.p>
           
           <h2 className="font-display text-[clamp(2.5rem,10vw,8.5rem)] leading-[0.95] font-light mb-12">
             <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="block"
             >
               L&apos;Art du
             </motion.span>
             <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 1 }}
              className="italic text-rose block mt-2"
             >
               Sur-Mesure
             </motion.span>
           </h2>
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="flex flex-col gap-8 justify-center items-center mt-12"
           >
             <Link href="/configurateur" className="group">
               <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold !px-12 !py-5 shadow-[0_0_50px_rgba(188,124,124,0.3)] group-hover:shadow-[0_0_70px_rgba(188,124,124,0.5)] transition-all duration-700"
               >
                 DÉMARRER VOTRE CRÉATION
               </motion.button>
             </Link>
             
             {!user ? (
               <div className="flex gap-6 items-center">
                 <Link href="/connexion" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-rose transition-all">Connexion</Link>
                 <div className="w-[1px] h-4 bg-white/10" />
                 <Link href="/inscription" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-rose transition-all">Créer un compte</Link>
               </div>
             ) : (
               <Link href="/mon-compte" className="text-[11px] uppercase tracking-[0.5em] opacity-50 hover:opacity-100 hover:text-rose transition-all flex items-center gap-3">
                 <span className="w-8 h-[1px] bg-rose/40" />
                 Bonjour, {user.nom?.split(' ')[0]}
                 <span className="w-8 h-[1px] bg-rose/40" />
               </Link>
             )}
           </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 hidden xs:flex flex-col items-center gap-3 opacity-40"
        >
           <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.5em] font-bold">Découvrir</span>
           <div className="w-[1px] h-6 sm:h-10 bg-white" />
        </motion.div>
      </section>

      {/* ── SECTION COLLECTION LUXE ── */}
      <section id="collection" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-8 max-w-[1500px] mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-16 sm:mb-24 lg:mb-32">
           <p className="text-rose text-[13px] uppercase tracking-[0.5em] font-bold mb-4 sm:mb-6">Nos Fragrances Iconiques</p>
           <h3 className="font-display text-[clamp(2rem,6vw,5rem)] font-light mb-10">La Collection <span className="italic text-rose">Prestige</span></h3>
           
           <div className="max-w-md mx-auto relative">
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Rechercher un parfum, une famille, une inspiration..."
               className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose/50 transition-colors"
             />
             {searchQuery ? (
               <button 
                 onClick={() => setSearchQuery('')}
                 className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-rose transition-colors flex items-center justify-center p-2"
                 title="Effacer la recherche"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             )}
           </div>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12"
        >
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-[400px] sm:h-[500px] bg-white/5 rounded-[30px] sm:rounded-[40px] animate-pulse" />)
          ) : (
            filteredParfums.map((p) => (
              <motion.div 
                key={p.id} 
                variants={fadeInUp}
                className="glass-card group relative flex flex-col h-full rounded-[40px] overflow-hidden"
              >
                {/* Image Container with Hover Zoom */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#100B08]">
                  {p.image_url ? (
                    <motion.img 
                      initial={{ scale: 1.1 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      src={p.image_url} 
                      alt={p.nom} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-1000" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose/5 to-transparent">
                      <span className="font-display text-[8rem] text-rose/5 italic">M</span>
                    </div>
                  )}
                  
                  {/* Luxury Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0800] via-transparent to-transparent opacity-60" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-6 left-6 overflow-hidden">
                    <motion.span 
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="inline-block bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold text-rose"
                    >
                      {p.famille}
                    </motion.span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-10 flex flex-col flex-1 -mt-16 relative z-20">
                  <h4 className="text-2xl sm:text-3xl font-display font-medium mb-2 tracking-tight group-hover:text-rose transition-colors duration-500 drop-shadow-2xl">
                    {p.nom}
                  </h4>
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-light mb-8 line-clamp-1 italic">
                    Note inspirée de {p.marque_inspiree}
                  </p>
                  
                  <div className="mt-auto pt-6 flex justify-between items-center border-t border-white/[0.05]">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Prix Prestige</span>
                      <span className="text-xl font-display text-[#D4AF37] font-bold">{p.prix_50ml?.toLocaleString()} F</span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "#BC7C7C", color: "#fff" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addToCart(p)}
                      className="w-14 h-14 rounded-full border border-rose/30 flex items-center justify-center text-rose transition-all bg-white/5 backdrop-blur-sm group-hover:border-rose shadow-xl"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* ── SECTION EXPERIENCE IMMERSIVE ── */}
      <section className="py-20 sm:py-40 lg:py-60 bg-[#120D0A]/50 border-y border-white/5 relative overflow-hidden">
         <div className="max-w-[1200px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 lg:gap-24 items-center">
            <motion.div {...fadeInUp} className="relative">
               <div className="aspect-[4/5] border border-white/10 rounded-[20px] sm:rounded-[40px] overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80" alt="Atelier Maya Bar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
                  <div className="absolute inset-0 bg-rose/10 mix-blend-overlay" />
               </div>
               <div className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-10 w-32 h-32 sm:w-48 sm:h-48 bg-rose p-6 sm:p-10 rounded-[20px] sm:rounded-[30px] shadow-2xl flex items-center justify-center">
                  <span className="font-display text-4xl sm:text-5xl italic text-white">M</span>
               </div>
            </motion.div>
            
            <motion.div {...fadeInUp} className="space-y-10 pt-8 lg:pt-0">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-rose" />
                  <p className="text-rose text-[11px] uppercase tracking-[0.8em] font-bold">Le Savoir-Faire</p>
                </div>
                <h3 className="font-display text-4xl sm:text-6xl lg:text-7xl font-light leading-[1.1]">Une Signature Olfactive <span className="italic text-rose block mt-2">Unique au Togo</span></h3>
                <p className="text-white/40 leading-[2.2] font-light text-base sm:text-lg max-w-xl">
                   Chaque flacon qui sort de notre bar est une œuvre d&apos;art. Nous marions les essences les plus rares pour créer un sillage qui raconte votre histoire. Plus qu&apos;un parfum, une identité.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-6">
                   <Link href="/configurateur">
                     <button className="btn-gold !px-10 !py-5">PRENDRE RENDEZ-VOUS</button>
                   </Link>
                   <button className="btn-outline">NOTRE HISTOIRE</button>
                </div>
             </motion.div>
         </div>
      </section>

      {/* ── FOOTER LUXE ── */}
      <footer className="py-12 sm:py-20 px-4 sm:px-8 border-t border-white/5 bg-[#0A0704]">
         <div className="max-w-[1500px] mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-20">
            <div className="col-span-2 sm:col-span-2 lg:col-span-2">
               <h4 className="font-display text-3xl sm:text-4xl mb-4 sm:mb-6 tracking-tighter">MAYA BAR</h4>
               <p className="text-white/30 text-sm font-light max-w-sm leading-loose uppercase tracking-widest">
                  Premier Bar à Senteurs du Togo. L&apos;excellence olfactive au service de votre élégance.
               </p>
            </div>
            <div>
               <h5 className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold mb-6">Navigation</h5>
               <ul className="space-y-3 text-xs opacity-40 font-medium">
                  <li><Link href="#hero">Le Concept</Link></li>
                  <li><Link href="#collection">La Collection</Link></li>
                  <li><Link href="/configurateur">Le Bar</Link></li>
               </ul>
            </div>
            <div>
               <h5 className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold mb-6">Suivez-nous</h5>
               <div className="flex gap-6 text-xl">
                  <a href="https://www.tiktok.com/@barasenteursmaya?_r=1&_t=ZS-96FMuiAWTZ6" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:text-rose transition-colors">TikTok</a>
                  <a href="https://www.instagram.com/maya_scents?igsh=MTQ0ZjBxMW53bnZ2Mg==" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:text-rose transition-colors">Insta</a>
               </div>
            </div>
         </div>
         <div className="max-w-[1500px] mx-auto mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-20 text-[9px] uppercase tracking-[0.3em] font-bold">
            <p>© 2026 Maya Bar à Senteurs. All Rights Reserved.</p>
            <p>Conçu avec Excellence à Lomé</p>
         </div>
      </footer>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .btn-gold {
          background: #BC7C7C;
          color: white;
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
        .btn-gold:hover {
          background: white;
          color: black;
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(188, 124, 124, 0.3);
        }
        .text-rose { color: #BC7C7C; }
        .bg-rose { background-color: #BC7C7C; }
        .border-rose { border-color: #BC7C7C; }
        .text-gold { color: #D4AF37; }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
