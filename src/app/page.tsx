'use client'
import { useState, useEffect, useCallback } from 'react'
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
  const { scrollY } = useScroll()
  const yHero = useTransform(scrollY, [0, 500], [0, 150])
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0])

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

      {/* ── BARRE DE NAVIGATION MOBILE-FIRST ── */}
      <nav className="fixed top-0 w-full z-[100] px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center bg-[#0D0800]/80 backdrop-blur-md border-b border-white/5">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="group cursor-pointer">
          <Link href="/">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tighter group-hover:text-rose transition-colors duration-500">MAYA <span className="italic font-light opacity-40 group-hover:opacity-100 transition-all">BAR</span></h1>
          </Link>
        </motion.div>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-8 lg:gap-12 text-[12px] uppercase tracking-[0.4em] font-bold opacity-70">
          <Link href="#hero" className="hover:text-rose transition-colors">Accueil</Link>
          <Link href="#collection" className="hover:text-rose transition-colors">Collection</Link>
          <Link href="/configurateur" className="hover:text-rose transition-colors">Le Bar</Link>
          {user ? (
            <Link href="/mon-compte" className="relative group">
              <span className="hover:text-rose transition-colors">Mon Compte</span>
              {cartCount > 0 && (
                <motion.span 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="absolute -top-3 -right-3 w-4 h-4 bg-[#D4AF37] rounded-full text-[7px] flex items-center justify-center text-black font-bold"
                >
                 {cartCount}
                </motion.span>
              )}
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hover:text-rose transition-colors">Connexion</Link>
              <Link href="/inscription" className="hover:text-rose transition-colors">Inscription</Link>
            </>
          )}
        </div>

        {/* Mobile: panier + menu */}
        <div className="flex items-center gap-3 md:hidden">
          {user && cartCount > 0 && (
            <Link href="/mon-compte" className="relative">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">🛍️</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] rounded-full text-[7px] flex items-center justify-center text-black font-bold">{cartCount}</span>
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 flex flex-col justify-center items-center gap-1.5">
            <span className={`block w-6 h-[1px] bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block w-6 h-[1px] bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-[1px] bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
          </button>
        </div>

        {/* Desktop CTA */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-[11px] uppercase tracking-widest opacity-50">👤 {user.nom?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest opacity-40 hover:text-rose hover:opacity-100 transition-all">
                Déconnexion
              </button>
            </div>
          ) : null}
          <Link href="/configurateur">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold px-6 py-3 text-[10px]"
            >
              CRÉER MON PARFUM
            </motion.button>
          </Link>
        </motion.div>
      </nav>

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
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0800]/50 to-[#0D0800]" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10" />
           <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] lg:w-[800px] h-[300px] sm:h-[600px] lg:h-[800px] bg-rose/10 blur-[100px] sm:blur-[150px] rounded-full"
           />
        </motion.div>

        <div className="relative z-10 text-center px-6 sm:px-8">
           <motion.p 
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.8em' }}
            transition={{ duration: 2 }}
            className="text-rose text-[13px] sm:text-[14px] uppercase font-bold mb-6 sm:mb-8"
           >
             Lomé — Togo
           </motion.p>
           <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,11vw,9rem)] leading-[0.9] font-light mb-8 sm:mb-10"
           >
             L&apos;Art du <span className="italic text-rose">Sur-Mesure</span> Olfactif
           </motion.h2>
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col gap-6 justify-center items-center mt-10"
           >
             <Link href="/configurateur" className="w-full max-w-xs sm:max-w-sm">
               <button className="btn-gold w-full py-4 sm:py-6 text-[10px] sm:text-[11px]">DÉMARRER VOTRE CRÉATION</button>
             </Link>
             
             {!user && (
               <div className="flex gap-4 w-full max-w-xs sm:max-w-sm">
                 <Link href="/connexion" className="flex-1">
                    <button className="bg-white/5 border border-white/10 text-white tracking-[0.2em] uppercase text-[9px] py-4 px-4 hover:bg-white/10 transition-all w-full rounded-full">Connexion</button>
                 </Link>
                 <Link href="/inscription" className="flex-1">
                    <button className="bg-rose text-white tracking-[0.2em] uppercase text-[9px] py-4 px-4 hover:bg-rose/80 transition-all w-full rounded-full">Inscription</button>
                 </Link>
               </div>
             )}
             {user && (
               <Link href="/mon-compte" className="text-[10px] uppercase tracking-[0.4em] opacity-60 hover:opacity-100 hover:text-rose transition-all">
                 👤 Bonjour, {user.nom?.split(' ')[0]} →
               </Link>
             )}

             <a href="#collection" className="text-[9px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity mt-4 italic">Explorer la Collection</a>
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
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-5 top-1/2 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
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
            parfums.filter((p) => {
              if (!searchQuery) return true;
              const term = searchQuery.toLowerCase();
              return (
                (p.nom && p.nom.toLowerCase().includes(term)) ||
                (p.famille && p.famille.toLowerCase().includes(term)) ||
                (p.marque_inspiree && p.marque_inspiree.toLowerCase().includes(term))
              );
            }).map((p) => (
              <motion.div 
                key={p.id} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="glass-card group relative overflow-hidden transition-all duration-700 flex flex-col border border-white/5 hover:border-rose/20"
              >
                {/* Glowing Background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                   <div className="w-full h-64 sm:h-80 lg:h-96 relative overflow-hidden bg-black/40">
                      {p.image_url ? (
                        <motion.img 
                          whileHover={{ scale: 1.05 }}
                          src={p.image_url} alt={p.nom} 
                          className="w-full h-full object-cover transition-transform duration-1000" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-7xl sm:text-9xl font-display text-rose/5 italic opacity-20">M</div>
                        </div>
                      )}
                      {/* Subtil dégradé en bas de l'image pour fondre avec la carte */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#100B08] to-transparent pointer-events-none" />
                   </div>
                   
                   <div className="px-6 sm:px-10 pb-6 sm:px-10 flex-1 flex flex-col -mt-10 relative z-20">
                     <div className="text-[11px] uppercase tracking-[0.5em] text-rose font-bold mb-3 drop-shadow-md">{p.famille}</div>
                     <h4 className="text-3xl sm:text-4xl font-display font-medium mb-3 tracking-tight group-hover:text-rose transition-colors duration-500 drop-shadow-md">{p.nom}</h4>
                     <p className="text-[12px] text-white/50 uppercase tracking-widest italic mb-8 sm:mb-10 flex-1">Inspiré de {p.marque_inspiree}</p>
                     
                     <div className="flex justify-between items-center pt-6 border-t border-white/10">
                        <div className="text-xl sm:text-2xl font-display text-[#D4AF37] font-bold">{p.prix_50ml?.toLocaleString()} F</div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToCart(p)}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-rose/30 flex items-center justify-center hover:bg-rose hover:text-white hover:border-rose transition-all text-xl sm:text-2xl shadow-lg shadow-black/50 bg-[#100B08]/80 backdrop-blur-sm"
                          title="Ajouter au panier"
                        >
                          +
                        </motion.button>
                     </div>
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
            
            <motion.div {...fadeInUp} className="space-y-8 sm:space-y-12 pt-8 lg:pt-0">
               <p className="text-rose text-[13px] uppercase tracking-[0.6em] font-bold">Le Savoir-Faire</p>
               <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">Une Signature Olfactive <span className="italic text-rose">Unique au Togo</span></h3>
               <p className="text-white/50 leading-[2] font-light text-lg sm:text-xl">
                  Chaque flacon qui sort de notre bar est une œuvre d&apos;art. Nous marions les essences les plus rares pour créer un sillage qui raconte votre histoire. Plus qu&apos;un parfum, une identité.
               </p>
               <div className="pt-4">
                  <Link href="/configurateur">
                    <button className="btn-gold px-8 sm:px-12 py-4 sm:py-6 text-[10px]">PRENDRE RENDEZ-VOUS</button>
                  </Link>
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
                  <a href="#" className="opacity-40 hover:text-rose transition-colors">TikTok</a>
                  <a href="#" className="opacity-40 hover:text-rose transition-colors">Insta</a>
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
          background: rgba(18, 13, 10, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 30px;
        }
        @media (min-width: 640px) {
          .glass-card { border-radius: 50px; }
        }
        .btn-gold {
          background: #BC7C7C;
          color: white;
          font-family: var(--font-display);
          font-weight: 500;
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
          box-shadow: 0 20px 60px rgba(188, 124, 124, 0.2);
        }
        .text-rose { color: #BC7C7C; }
        .bg-rose { background-color: #BC7C7C; }
        .border-rose { border-color: #BC7C7C; }
        .text-gold { color: #D4AF37; }
      `}</style>
    </div>
  )
}
