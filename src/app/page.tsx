'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARFUMS_VEDETTES = [
  { nom: 'Rose Noire du Togo', famille: 'Floral Oriental', prix: 12500, notes: 'Rose, Oud, Ambre', ml: 50, image_url: '/parfums/parfum_ambre.png' },
  { nom: 'Zeste Tropical', famille: 'Frais Fruité', prix: 9500, notes: 'Bergamote, Mango, Muscs', ml: 30, image_url: '/parfums/parfum_cristal.png' },
  { nom: 'Bois Sacré', famille: 'Boisé Sensuel', prix: 15000, notes: 'Santal, Cèdre, Vétiver', ml: 100, image_url: '/parfums/parfum_noir.png' },
]

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
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(data => {
      if (data.authenticated) setUser(data.user)
    })

    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="bg-deep-brown min-h-screen selection:bg-gold/30">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] px-8 py-5 transition-all duration-500 ease-in-out flex items-center justify-between ${scrolled ? 'bg-deep-brown/90 border-b border-gold/10 backdrop-blur-xl py-4' : 'bg-transparent border-none'}`}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-2xl font-semibold text-gold cursor-default"
        >
          Maya Bar <span className="text-cream text-sm font-light tracking-[0.15em] opacity-60">à Senteurs</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex gap-10 items-center"
        >
          {['Accueil', 'Catalogue', 'Créer', 'Contact'].map((item, i) => (
            <motion.a 
              key={item} 
              href={item === 'Accueil' ? '#hero' : item === 'Catalogue' ? '#collection' : item === 'Créer' ? '/configurateur' : '#contact'}
              whileHover={{ y: -2, color: '#C9A84C' }}
              className="text-cream no-underline text-[10px] tracking-[0.2em] uppercase opacity-70 hover:opacity-100 transition-all font-body"
            >
              {item}
            </motion.a>
          ))}
          <div className="flex gap-4 items-center border-l border-gold/20 pl-10 ml-2">
            {user ? (
              <Link href="/mon-compte">
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(201,168,76,0.1)' }}
                  className="bg-transparent border border-gold/30 text-gold-light px-5 py-2.5 text-[9px] tracking-[0.2em] uppercase transition-all"
                >
                  Mon Compte ({user.nom})
                </motion.button>
              </Link>
            ) : (
              <Link href="/connexion">
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(201,168,76,0.1)' }}
                  className="bg-transparent border border-gold/30 text-gold-light px-5 py-2.5 text-[9px] tracking-[0.2em] uppercase transition-all"
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
                Créer mon parfum
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden px-8 pt-24 pb-16">
        {/* Background decorative Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} 
        />

        <div className="max-w-[1000px] text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="ornament mb-10 justify-center"
          >
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold font-body opacity-80">
              L&apos;Excellence Olfactive à Lomé
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.95] tracking-[-0.03em] mb-10 text-cream"
          >
            Signature <br />
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-gold-gradient italic font-medium"
            >
              Éternelle
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg md:text-xl font-light text-cream/60 max-w-[600px] mx-auto mb-16 leading-[1.8] font-body"
          >
            Découvrez l&apos;art de la création sur-mesure. Composez une fragrance qui raconte votre histoire, inspirée par les plus grands maîtres.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex gap-6 justify-center flex-wrap"
          >
            <Link href="/configurateur">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(201,168,76,0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="btn-gold min-w-[240px] py-4"
              >
                Commencer la création
              </motion.button>
            </Link>
            <a href="#collection">
              <motion.button 
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: '#C9A84C' }}
                className="bg-transparent border border-white/10 text-cream font-body font-medium tracking-[0.2em] uppercase text-[10px] py-4 px-12 cursor-pointer transition-all min-w-[240px]"
              >
                Explorer le Catalogue
              </motion.button>
            </a>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="flex gap-12 md:gap-24 justify-center mt-24 flex-wrap opacity-80"
          >
            {[
              { val: '200+', label: 'Essences Précieuses' },
              { val: 'Lomé', label: 'Boutique Physique' },
              { val: 'Tailored', label: 'Expérience Unique' },
            ].map(stat => (
              <motion.div key={stat.val} variants={fadeInUp} className="text-center group">
                <div className="font-display text-4xl font-semibold text-gold group-hover:scale-110 transition-transform duration-500">{stat.val}</div>
                <div className="text-[9px] tracking-[0.3em] uppercase text-cream/40 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COLLECTION VEDETTE ── */}
      <section id="collection" className="py-32 px-8 max-w-[1400px] mx-auto">
        <motion.div 
          {...fadeInUp}
          className="text-center mb-24"
        >
          <p className="text-[10px] tracking-[0.5em] uppercase text-gold/60 mb-6">Le Bar à Senteurs</p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light text-cream leading-tight">
            Les Icônes <span className="italic text-gold">Maya Bar</span>
          </h2>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {PARFUMS_VEDETTES.map((p, i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              whileHover={{ y: -15 }}
              className="glass-card group p-12 rounded-none relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-gold/10 transition-colors" />
              
              <div className="text-center mb-10 h-[180px] flex items-center justify-center relative">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.nom} className="max-h-full max-w-[150px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
                  ) : (
                    <div className="w-24 h-40 border border-gold/30 rounded-sm bg-gold/5 flex items-center justify-center">
                       <span className="font-display text-4xl text-gold opacity-20">M</span>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="text-[9px] tracking-[0.3em] uppercase text-gold/60 mb-3">{p.famille}</div>
              <h3 className="font-display text-3xl font-light text-cream mb-4 group-hover:text-gold transition-colors">{p.nom}</h3>
              <p className="text-sm text-cream/40 mb-10 font-light leading-relaxed">{p.notes}</p>

              <div className="flex justify-between items-end pt-6 border-t border-white/5">
                <div>
                  <div className="text-[1.6rem] text-gold font-medium">
                    {p.prix.toLocaleString('fr-FR')} <span className="text-[10px] text-cream/30 ml-1 font-light uppercase tracking-widest">FCFA</span>
                  </div>
                </div>
                <Link href="/configurateur">
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="text-gold text-[9px] tracking-[0.2em] uppercase font-semibold flex items-center gap-2"
                  >
                    Découvrir <span>→</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── LUXURY DIVIDER ── */}
      <motion.div 
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 0.1 }}
        className="max-w-[1000px] mx-auto h-px bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      {/* ── WHY US (L'EXPÉRIENCE) ── */}
      <section className="py-32 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-warm-brown/30 border border-gold/10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gold/5 group-hover:bg-transparent transition-colors duration-700" />
                <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80" alt="Atelier" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 border border-gold/20 p-4 bg-deep-brown hidden md:block">
                 <div className="w-full h-full border border-gold/10 flex items-center justify-center text-gold/40 font-display italic">M. Bar</div>
              </div>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="space-y-12"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="font-display text-5xl font-light text-cream mb-8">L&apos;Art de la <br /><span className="italic text-gold">Personnalisation</span></h2>
                <p className="text-cream/50 font-light leading-relaxed text-lg">Chaque flacon est une œuvre unique. Nous transformons vos émotions en senteurs précieuses, flacon après flacon, avec une précision artisanale.</p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                {[
                  { titre: 'Formule Unique', desc: 'Choisissez parmi nos essences rares pour un sillage exclusif.' },
                  { titre: 'Gravure Laser', desc: 'Personnalisez votre flacon avec un message ou un prénom.' },
                  { titre: 'Qualité Premium', desc: 'Des ingrédients nobles pour une tenue exceptionnelle.' },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex gap-6 items-start group">
                    <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold text-xs group-hover:bg-gold group-hover:text-deep-brown transition-all duration-500">0{i+1}</div>
                    <div>
                      <h4 className="text-cream font-medium tracking-wide mb-2">{item.titre}</h4>
                      <p className="text-sm text-cream/40 font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section id="contact" className="py-40 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5 blur-[120px] rounded-full translate-y-1/2" />
        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <motion.p {...fadeInUp} className="text-[10px] tracking-[0.5em] uppercase text-gold mb-10">Rejoignez l&apos;exception</motion.p>
          <motion.h2 
            {...fadeInUp}
            className="font-display text-[clamp(2.5rem,7vw,5rem)] text-cream mb-12 leading-[1.1] font-light"
          >
            Prêt à créer votre <br /> <span className="italic text-gold">Signature ?</span>
          </motion.h2>
          
          <motion.div 
            {...fadeInUp}
            className="flex gap-6 justify-center flex-wrap"
          >
            <Link href="/configurateur">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="btn-gold px-12"
              >
                Ouvrir le configurateur
              </motion.button>
            </Link>
            <a href="https://wa.me/22870993597" target="_blank" rel="noreferrer">
              <motion.button 
                whileHover={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', borderColor: '#25D366' }}
                className="bg-transparent border border-white/10 text-cream font-body font-medium tracking-[0.2em] uppercase text-[10px] py-4 px-10"
              >
                📱 WhatsApp
              </motion.button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-16 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className="font-display text-2xl text-gold mb-2">Maya Bar</div>
            <div className="text-[9px] tracking-[0.4em] uppercase text-cream/30">Haute Parfumerie · Lomé</div>
          </div>
          
          <div className="flex gap-10">
            {['TikTok', 'Instagram', 'Facebook'].map(s => (
              <motion.a 
                key={s} href="#" 
                whileHover={{ y: -2, color: '#C9A84C' }}
                className="text-[9px] tracking-[0.2em] text-cream/40 no-underline uppercase transition-all"
              >
                {s}
              </motion.a>
            ))}
          </div>

          <div className="text-[9px] tracking-[0.2em] text-cream/20 uppercase text-center md:text-right">
            © 2024 Maya Bar · Tous droits réservés <br />
            <Link href="/admin" className="text-gold/30 hover:text-gold transition-colors mt-2 inline-block">Accès Partenaire</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
