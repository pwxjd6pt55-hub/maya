'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
}

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { 
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  },
  viewport: { once: true }
}

export default function HomePage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [parfums, setParfums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(data => {
      if (data.authenticated) setUser(data.user)
    })

    fetch('/api/parfums').then(r => r.json()).then(data => {
      if (data.success) setParfums(data.data.slice(0, 6)) // Top 6
      setLoading(false)
    })

    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const ajouterAuPanier = async (p: any) => {
    if (!user) {
      router.push('/connexion?redirect=/')
      return
    }
    setAddingToCart(p.id)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_type: 'catalogue',
        parfum_catalogue_id: p.id,
        ml: 50,
        prix: p.prix_50ml,
        quantite: 1
      })
    })
    if (res.ok) {
      alert(`${p.nom} ajouté au panier !`)
    }
    setAddingToCart(null)
  }

  return (
    <main className="bg-[#0D0800] min-h-screen selection:bg-rose/30 text-cream font-body">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] px-8 py-5 transition-all duration-500 ease-in-out flex items-center justify-between ${scrolled ? 'bg-[#0D0800]/90 border-b border-rose/10 backdrop-blur-xl py-4' : 'bg-transparent border-none'}`}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-2xl font-semibold text-rose cursor-default tracking-widest"
        >
          MAYA BAR <span className="text-rose-light text-sm font-light tracking-[0.15em] opacity-60 ml-1">à Senteurs</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex gap-10 items-center"
        >
          {['Accueil', 'Catalogue', 'Créer', 'Contact'].map((item) => (
            <motion.a 
              key={item} 
              href={item === 'Accueil' ? '#hero' : item === 'Catalogue' ? '#collection' : item === 'Créer' ? '/configurateur' : '#contact'}
              whileHover={{ y: -2, color: '#BC7C7C' }}
              className="text-cream no-underline text-[10px] tracking-[0.3em] uppercase opacity-70 hover:opacity-100 transition-all font-bold"
            >
              {item}
            </motion.a>
          ))}
          <div className="flex gap-6 items-center border-l border-rose/20 pl-10 ml-4">
            {user ? (
              <Link href="/mon-compte">
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(188,124,124,0.1)' }}
                  className="bg-transparent border border-rose/30 text-rose px-5 py-2.5 text-[9px] tracking-[0.2em] uppercase transition-all"
                >
                  Compte ({user.nom})
                </motion.button>
              </Link>
            ) : (
              <Link href="/connexion">
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(188,124,124,0.1)' }}
                  className="bg-transparent border border-rose/30 text-rose px-5 py-2.5 text-[9px] tracking-[0.2em] uppercase transition-all"
                >
                  Connexion
                </motion.button>
              </Link>
            )}
            <Link href="/configurateur">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-gold px-6 py-2.5 text-[10px]"
              >
                CRÉER MON PARFUM
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden px-8 pt-24 pb-16">
        {/* Background decorative Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none bg-rose/10 blur-[80px]" 
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full pointer-events-none bg-rose-dark/5 blur-[60px]" 
        />

        <div className="max-w-[1100px] text-center relative z-10">
          <motion.div {...fadeInUp} className="mb-10">
            <span className="text-[11px] tracking-[0.6em] uppercase text-rose font-bold opacity-80">L&apos;Élégance Olfactive</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3.5rem,10vw,7rem)] font-light leading-[1] tracking-[-0.02em] mb-12"
          >
            Fragrance <br />
            <span className="text-gold-gradient italic font-medium">Signature</span>
          </motion.h1>

          <motion.p 
            {...fadeInUp}
            className="text-lg md:text-xl font-light text-cream/50 max-w-[650px] mx-auto mb-16 leading-[1.8]"
          >
            Composez une essence qui ne ressemble qu&apos;à vous. Une expérience de luxe sur-mesure au cœur de Lomé.
          </motion.p>

          <motion.div {...fadeInUp} className="flex gap-6 justify-center flex-wrap">
            <Link href="/configurateur">
              <button className="btn-gold min-w-[260px] py-5 text-[11px]">DÉMARRER LA CRÉATION</button>
            </Link>
            <a href="#collection">
              <button className="bg-transparent border border-rose/20 text-cream tracking-[0.3em] uppercase text-[10px] py-5 px-12 hover:bg-rose/5 transition-all min-w-[260px]">Explorer la Collection</button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── COLLECTION ── */}
      <section id="collection" className="py-40 px-8 max-w-[1400px] mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-28">
          <p className="text-[11px] tracking-[0.5em] uppercase text-rose/50 mb-6 font-bold">Catalogue de Prestige</p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-tight">
            Les Essentiels <span className="italic text-rose">Maya Bar</span>
          </h2>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {parfums.map((p, i) => (
            <motion.div 
              key={p.id} 
              variants={fadeInUp}
              whileHover={{ y: -15, borderColor: 'rgba(188, 124, 124, 0.4)' }}
              className="glass-card group p-12 relative overflow-hidden transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose/10 transition-colors" />
              
              <div className="text-center mb-12 h-[220px] flex items-center justify-center relative">
                 {p.image_url ? (
                   <motion.img 
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    src={p.image_url} alt={p.nom} className="max-h-full max-w-[180px] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.6)]" 
                   />
                 ) : (
                   <div className="w-24 h-40 border-2 border-rose/10 rounded-sm bg-rose/5 flex items-center justify-center">
                      <span className="font-display text-5xl text-rose/20 italic">M</span>
                   </div>
                 )}
              </div>

              <div className="text-[9px] tracking-[0.4em] uppercase text-rose font-bold mb-4">{p.famille}</div>
              <h3 className="font-display text-3xl font-light mb-4 group-hover:text-rose transition-colors">{p.nom}</h3>
              <p className="text-sm text-cream/40 mb-12 font-light leading-relaxed line-clamp-2 italic">{p.notes_coeur}</p>

              <div className="flex justify-between items-center pt-8 border-t border-rose/10">
                <div className="text-2xl text-rose font-bold">
                  {p.prix_50ml.toLocaleString()} F
                </div>
                <button 
                  onClick={() => ajouterAuPanier(p)}
                  disabled={addingToCart === p.id}
                  className="bg-rose/10 border border-rose/20 text-rose px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-rose hover:text-white transition-all"
                >
                  {addingToCart === p.id ? '...' : '+ Panier'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── EXPÉRIENCE ── */}
      <section className="py-40 bg-rose/[0.02] border-y border-rose/5">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <motion.div {...fadeInUp} className="relative">
                <div className="aspect-[4/5] border border-rose/10 overflow-hidden relative group p-10 bg-[#0D0800]">
                   <img src="https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80" alt="Atelier" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0D0800] via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 border border-rose/10 bg-[#0D0800] p-6 hidden md:flex items-center justify-center">
                   <div className="text-rose/20 font-display text-6xl italic">M</div>
                </div>
             </motion.div>

             <div className="space-y-16">
                <motion.div {...fadeInUp}>
                   <h2 className="font-display text-5xl font-light leading-tight mb-8">Un Savoir-faire <br /><span className="italic text-rose">Artisanal</span></h2>
                   <p className="text-cream/50 text-lg font-light leading-relaxed">Nous croyons que le parfum est la forme la plus intense du souvenir. Nos créations allient essences rares et personnalisation absolue.</p>
                </motion.div>
                
                <div className="grid grid-cols-1 gap-12">
                   {[
                     { t: 'Inspiration Noble', d: 'Des fragrances inspirées des plus grands nez.' },
                     { t: 'Mélange Pur', d: 'Composez votre propre alchimie olfactive.' },
                     { t: 'Gravure Laser', d: 'Immortalisez votre flacon avec une gravure unique.' }
                   ].map((item, i) => (
                     <motion.div key={i} {...fadeInUp} className="flex gap-8 group">
                        <div className="w-12 h-12 rounded-full border border-rose/20 flex items-center justify-center text-rose text-xs font-bold group-hover:bg-rose group-hover:text-white transition-all duration-500">0{i+1}</div>
                        <div>
                           <h4 className="text-cream font-bold tracking-widest text-[11px] uppercase mb-2">{item.t}</h4>
                           <p className="text-sm text-cream/40 font-light">{item.d}</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-24 px-8 border-t border-rose/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 items-center">
          <div className="text-center md:text-left">
            <div className="font-display text-3xl text-rose font-bold tracking-tighter mb-2">MAYA BAR</div>
            <div className="text-[10px] tracking-[0.5em] uppercase text-rose/30 font-bold">Lomé · Togo</div>
          </div>
          
          <div className="flex justify-center gap-10">
            {['TikTok', 'Instagram', 'Facebook'].map(s => (
              <motion.a 
                key={s} href="#" 
                whileHover={{ y: -3, color: '#BC7C7C' }}
                className="text-[10px] tracking-[0.4em] text-rose/40 no-underline uppercase font-bold transition-all"
              >
                {s}
              </motion.a>
            ))}
          </div>

          <div className="text-[9px] tracking-[0.3em] text-rose/20 uppercase text-center md:text-right font-bold space-y-4">
            <div>© 2024 MAYA BAR · TOUS DROITS RÉSERVÉS</div>
            <Link href="/admin-maya-2026" className="text-rose/40 hover:text-rose transition-colors">Espace Privé</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
